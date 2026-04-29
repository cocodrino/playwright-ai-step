// Self-healing — when a test step fails, retry with corrected selector/action

import type { LLMCommand, DOMSnapshot } from './types.js'
import { serializePage } from './dom-serializer.js'
import { resolveLLMConfig } from './config.js'
import type { Page } from '@playwright/test'

const HEALER_PROMPT = `You are a Playwright test debugging expert.
A test step failed. Analyze the error and provide a corrected Playwright command.

Context:
- Original instruction: "{instruction}"
- What was attempted: {action} on selector "{selector}"
- Error: "{error}"
- Current page URL: {url}
- Page title: {title}

Available DOM elements:
{domElements}

Return a corrected JSON command with:
{
  "action": "click" | "type" | "hover" | "select" | "scroll" | "wait" | "assert" | "query" | "fail",
  "selector": "corrected CSS or semantic selector",
  "value": "if type action",
  "role": "aria role if applicable",
  "text": "visible text if applicable",
  "testId": "data-testid if available",
  "reasoning": "brief explanation of what went wrong and how you fixed it",
  "confidence": 0.0-1.0 (higher = more confident)
}

Rules:
- The element likely exists but the selector was wrong
- Try getByRole with exact visible text first
- Use data-testid when available
- If element truly doesn't exist, return action:"fail" with reason
- Do not repeat the same selector that already failed`

function buildHealerPrompt(
  instruction: string,
  failedCommand: LLMCommand,
  errorMessage: string,
  snapshot: DOMSnapshot,
): string {
  const elementList = snapshot.elements
    .filter(el => el.isVisible)
    .slice(0, 60)
    .map(el => {
      const parts: string[] = []
      if (el.role && el.role !== el.tagName) parts.push(`[${el.role}]`)
      if (el.tagName) parts.push(`<${el.tagName}>`)
      if (el.id) parts.push(`#${el.id}`)
      if (el.dataTestId) parts.push(`[data-testid="${el.dataTestId}"]`)
      if (el.textContent) parts.push(`"${el.textContent}"`)
      if (el.placeholder) parts.push(`placeholder="${el.placeholder}"`)
      if (el.ariaLabel) parts.push(`aria="${el.ariaLabel}"`)
      return parts.join(' ')
    })
    .join('\n')

  return HEALER_PROMPT
    .replace('{instruction}', instruction)
    .replace('{action}', failedCommand.action)
    .replace('{selector}', failedCommand.selector ?? 'none')
    .replace('{error}', errorMessage)
    .replace('{url}', snapshot.url)
    .replace('{title}', snapshot.title)
    .replace('{domElements}', elementList || '(no visible elements)')
}

function guessActionFromError(errorMessage: string): LLMCommand['action'] {
  const msg = errorMessage.toLowerCase()
  if (msg.includes('type') || msg.includes('fill') || msg.includes('input')) return 'type'
  if (msg.includes('select')) return 'select'
  if (msg.includes('hover')) return 'hover'
  return 'click'
}

export interface HealResult {
  success: boolean
  correctedCommand?: LLMCommand
  attempts: number
}

export async function healFailedStep(
  instruction: string,
  failedCommand: LLMCommand,
  errorMessage: string,
  page: Page,
  maxAttempts = 2,
  existingSnapshot?: DOMSnapshot,
): Promise<HealResult> {
  const { default: OpenAI } = await import('openai')

  // Use the same config as the rest of the system — not raw process.env reads
  const config = resolveLLMConfig()
  const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl, timeout: config.timeoutMs })

  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    // Reuse provided snapshot to avoid an extra page.evaluate() round-trip
    const snapshot = existingSnapshot ?? await serializePage(page)
    const prompt = buildHealerPrompt(instruction, failedCommand, errorMessage, snapshot)

    try {
      const response = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a Playwright test debugging expert. Return ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.1,
      })

      const content = response.choices[0]?.message?.content ?? ''
      const parsed = JSON.parse(content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, ''))

      const command: LLMCommand = {
        action: parsed.action ?? 'fail',
        selector: parsed.selector,
        value: parsed.value,
        role: parsed.role,
        text: parsed.text,
        testId: parsed.testId,
        assertion: parsed.assertion,
        query: parsed.query,
        reasoning: parsed.reasoning ?? '',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        reason: parsed.reason,
      }

      if (command.action !== 'fail' && command.confidence >= 0.5) {
        return { success: true, correctedCommand: command, attempts: attempt + 1 }
      }
    } catch {
      if (attempt === maxAttempts) return { success: false, attempts: attempt + 1 }
    }
  }

  return { success: false, attempts: maxAttempts + 1 }
}

export async function aiWithHealing(
  instruction: string,
  options: Parameters<typeof import('./ai.js').ai>[1],
  onHeal?: (attempt: number, corrected: LLMCommand) => void,
): Promise<boolean | string | number> {
  const { ai } = await import('./ai.js')

  try {
    return await ai(instruction, options)
  } catch (normalError) {
    const errorMessage = normalError instanceof Error ? normalError.message : String(normalError)

    // Best-effort: infer action from error text; healer sees the full DOM + instruction
    const failedCommand: LLMCommand = {
      action: guessActionFromError(errorMessage),
      reasoning: errorMessage,
      confidence: 0,
    }

    const result = await healFailedStep(
      instruction,
      failedCommand,
      errorMessage,
      options.page,
      2,
    )

    if (result.success && result.correctedCommand) {
      if (onHeal) onHeal(result.attempts, result.correctedCommand)
      return { healed: true, attempts: result.attempts, command: result.correctedCommand } as unknown as boolean | string | number
    }

    throw normalError
  }
}
