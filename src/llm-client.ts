// LLM Client — calls MiniMax (or any OpenAI-compatible endpoint) with DOM context

import OpenAI from 'openai'
import type { LLMConfig, LLMCommand, DOMSnapshot, InstructionType } from './types'

const SYSTEM_PROMPT = `You are a Playwright test automation expert.
Given a DOM description and a user instruction, return a JSON command to execute.

Return ONLY valid JSON with this schema (no markdown, no code fences):
{
  "action": "click" | "type" | "hover" | "select" | "scroll" | "wait" | "assert" | "query" | "fail",
  "selector": "<css selector>",         // for click/type/hover/select
  "value": "<text>",                    // for type/select
  "role": "<aria role>",                // e.g. "button", "link", "textbox"
  "text": "<visible text>",             // for semantic locators
  "testId": "<data-testid>",           // if available
  "assertion": { "type": "visible" | "text" | "count" | "attribute", "expected": "..." },
  "query": { "selectors": [], "extraction": "text" | "attribute" | "count", "attribute": "..." },
  "reasoning": "<brief explanation>",
  "confidence": 0.0-1.0
}

Rules:
- Only return ONE action per response
- Prefer semantic selectors (role + text) over CSS selectors
- Use data-testid attributes when available
- If element not in DOM, return action: "fail" with reason
- confidence < 0.5: return fail — don't guess
- For 'type' action: include both selector AND value
- For 'assert': include assertion object with type and expected
- JSON only — no explanatory text before or after`

function buildUserMessage(instruction: string, snapshot: DOMSnapshot, type: InstructionType): string {
  const elementList = snapshot.elements
    .filter(el => el.isVisible && (el.textContent || el.placeholder || el.role))
    .slice(0, 80)
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

  return `URL: ${snapshot.url}
Title: ${snapshot.title}

[VISIBLE ELEMENTS] (max 80 shown):
${elementList || '(no visible elements)'}

[INSTRUCTION] (type: ${type})
${instruction}

Return JSON command:`
}

export function parseResponse(raw: string): LLMCommand {
  let jsonStr = raw.trim()
  if (jsonStr.startsWith('```')) {
    const fenceEnd = jsonStr.indexOf('\n')
    jsonStr = jsonStr.slice(fenceEnd + 1)
    const fenceClose = jsonStr.lastIndexOf('```')
    if (fenceClose > 0) jsonStr = jsonStr.slice(0, fenceClose)
  }
  jsonStr = jsonStr.trim()

  try {
    const obj = JSON.parse(jsonStr)
    const validActions = ['click', 'type', 'hover', 'select', 'scroll', 'wait', 'assert', 'query', 'fail']
    if (!validActions.includes(obj.action ?? '')) {
      obj.action = 'fail'
      obj.reason = `Invalid action: ${obj.action}`
    }

    return {
      action: obj.action ?? 'fail',
      selector: obj.selector ?? undefined,
      value: obj.value ?? undefined,
      role: obj.role ?? undefined,
      text: obj.text ?? undefined,
      testId: obj.testId ?? undefined,
      assertion: obj.assertion ?? undefined,
      query: obj.query ?? undefined,
      reasoning: obj.reasoning ?? '',
      confidence: typeof obj.confidence === 'number' ? obj.confidence : 0.5,
      reason: obj.reason ?? undefined,
    }
  } catch (err) {
    return {
      action: 'fail',
      confidence: 0,
      reasoning: '',
      reason: `JSON parse error: ${err instanceof Error ? err.message : String(err)}. Raw: ${jsonStr.slice(0, 200)}`,
    }
  }
}

export async function callLLM(
  instruction: string,
  snapshot: DOMSnapshot,
  type: InstructionType,
  llmConfig: LLMConfig,
): Promise<LLMCommand> {
  const client = new OpenAI({
    apiKey: llmConfig.apiKey,
    baseURL: llmConfig.baseUrl,
    timeout: llmConfig.timeoutMs,
  })

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserMessage(instruction, snapshot, type) },
  ]

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: llmConfig.model,
        messages,
        max_tokens: llmConfig.maxTokens,
        temperature: llmConfig.temperature,
      })

      const content = response.choices[0]?.message?.content ?? ''
      return parseResponse(content)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const msg = lastError.message
      const isRetryable = msg.includes('429') || msg.includes('500') || msg.includes('502') ||
        msg.includes('503') || msg.includes('rate') || msg.includes('timeout')
      if (!isRetryable || attempt === 2) throw lastError
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
    }
  }

  throw lastError
}