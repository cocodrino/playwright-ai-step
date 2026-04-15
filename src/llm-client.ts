// LLM Client — calls MiniMax (or any OpenAI-compatible endpoint) with DOM context

import OpenAI from 'openai'
import type { LLMConfig, LLMCommand, DOMSnapshot, InstructionType } from './types'


// ─── Extract mode ───────────────────────────────────────────────────────

const EXTRACT_SYSTEM_PROMPT = `You are a data extraction expert. Given a page DOM and a user query, extract structured data and return it as valid JSON.

IMPORTANT — Return ONLY valid JSON, nothing else. No markdown, no code fences, no text outside the JSON.

Rules:
- Return a JSON object matching the schema — keys must match exactly
- String fields: use the exact visible text from the DOM
- Number fields: extract the numeric value (remove commas, K/M/B suffixes where needed)
- If a field is not found on the page, use null
- For URLs: always return the complete watch/share URL (https://www.youtube.com/watch?v=...)
- Be thorough — extract ALL matching items, not just the first one
- Dates/times: preserve the human-readable format from the page

Schema to follow:
{SCHEMA}

Examples:
Schema: {"videos": [{"title": "string", "url": "string", "channel": "string"}]}
Instruction: "extract all video results"
-> [{"title":"TypeScript Tutorial 2025","url":"https://www.youtube.com/watch?v=abc123","channel":"Traversy Media"},...]

Schema: {"comments": [{"username": "string", "text": "string", "likes": "string"}]}
Instruction: "extract the top 5 comments"
-> [{"username":"john_doe","text":"Great tutorial!","likes":"42"},...]`

// Few-shot examples embedded in system prompt for better accuracy
const SYSTEM_PROMPT = `You are a Playwright test automation expert.
Given a DOM description and a user instruction, return a JSON command to execute.

IMPORTANT — Return ONLY valid JSON, no markdown, no code fences, no explanatory text.

JSON schema:
{
  "action": "click" | "type" | "hover" | "select" | "scroll" | "wait" | "assert" | "query" | "fail",
  "selector": "<css selector or empty>",
  "value": "<text or empty>",
  "role": "<aria role>",
  "text": "<visible text or empty>",
  "testId": "<data-testid value or empty>",
  "assertion": { "type": "visible" | "text" | "count" | "attribute", "expected": "...", "attribute": "..." },
  "query": { "extraction": "text" | "attribute" | "count" | "title", "attribute": "<attr name if needed>", "selector": "<element selector if needed>" },
  "reasoning": "<brief 1-sentence explanation>",
  "confidence": 0.0-1.0
}

Rules:
- CLICK: prefer page.getByRole(role, {name:"text"}) when element has visible text — DO NOT use CSS selectors first
- TYPE: must include both selector AND value
- SELECT: include selector + value (option text or value attribute)
- HOVER/SCROLL/WAIT: include selector for the target element
- ASSERT: include assertion object {type, expected}. Prefer 'visible' for UI checks.
- QUERY — use 'query' type. For page/title → extraction:"title". For element text → extraction:"text" + selector. For attributes → extraction:"attribute" + selector + attribute name.
- FAIL: return confidence < 0.5 only. For queries, even low confidence is ok — return what you think.
- Never return CSS selectors unless all semantic methods (role/text/testid) are unavailable.
- Use data-testid when element has one — it's the most stable selector.

Examples:
Instruction: "click the submit button"
→ {"action":"click","role":"button","text":"submit","reasoning":"Submit button found by role and text","confidence":0.95}

Instruction: "type my name in the name field"
→ {"action":"type","role":"textbox","text":"name","value":"my name","reasoning":"Name input located by role and label text","confidence":0.9}

Instruction: "assert the success message is visible"
→ {"action":"assert","selector":"[data-testid='success-message']","assertion":{"type":"visible","expected":"visible"},"reasoning":"Success message element marked with testid","confidence":0.95}

Instruction: "query the page title"
→ {"action":"query","query":{"extraction":"title"},"reasoning":"Querying document title directly","confidence":0.9}

Instruction: "query the submit button text"
→ {"action":"query","selector":"[data-testid='submit-button']","query":{"extraction":"text"},"reasoning":"Extracting text content from submit button","confidence":0.9}

Instruction: "query the checkbox is checked"
→ {"action":"query","selector":"[data-testid='terms-checkbox']","query":{"extraction":"attribute","attribute":"checked"},"reasoning":"Getting checked attribute from checkbox","confidence":0.85}`

function buildUserMessage(
  instruction: string,
  snapshot: DOMSnapshot,
  type: InstructionType,
  visionContext?: import('./vision').VisionPromptParts,
): string {
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

  const vision = visionContext
    ? `\n\n${visionContext.visualContext}\n${visionContext.screenshotAvailable ? '[Screenshot captured — available for vision]' : ''}`
    : ''

  return `URL: ${snapshot.url}
Title: ${snapshot.title}

[VISIBLE ELEMENTS] (max 80 shown):
${elementList || '(no visible elements)'}${vision}

[INSTRUCTION] (type: ${type})
${instruction}

Return JSON command:`
}
function buildExtractUserMessage(
  instruction: string,
  snapshot: DOMSnapshot,
  schema: Record<string, unknown>,
  visionContext?: import('./vision').VisionPromptParts,
): string {
  const elementList = snapshot.elements
    .filter((el: any) => el.isVisible && (el.textContent || el.placeholder || el.role))
    .slice(0, 120)
    .map((el: any) => {
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

  const vision = visionContext ? `\n\n${visionContext.visualContext}\n[Screenshot available for vision]` : ''

  return `URL: ${snapshot.url}
Title: ${snapshot.title}

[VISIBLE ELEMENTS] (max 120 shown):
${elementList || '(no visible elements)'}${vision}

[EXTRACTION TASK]
Query: ${instruction}

[JSON SCHEMA — follow this schema exactly]
${JSON.stringify(schema, null, 2)}

Return ONLY valid JSON. Nothing else:`
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
  visionContext?: import('./vision').VisionPromptParts,
  schema?: Record<string, unknown>,
): Promise<LLMCommand> {
  const client = new OpenAI({
    apiKey: llmConfig.apiKey,
    baseURL: llmConfig.baseUrl,
    timeout: llmConfig.timeoutMs,
  })

  // ── Extract mode: structured data ────────────────────────────────────
  if (type === 'extract') {
    const systemPrompt = EXTRACT_SYSTEM_PROMPT.replace('{SCHEMA}', JSON.stringify(schema ?? {}, null, 2))
    const userMsg = buildExtractUserMessage(instruction, snapshot, schema ?? {}, visionContext)

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMsg },
    ]

    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: llmConfig.model,
          messages,
          max_tokens: 4096,
          temperature: 0.1,
        })
        const content2 = response.choices[0]?.message?.content ?? ''

        let jsonStr = content2.trim()
        if (jsonStr.startsWith('```')) {
          const fenceEnd = jsonStr.indexOf('\n')
          jsonStr = jsonStr.slice(fenceEnd + 1)
          const fenceClose = jsonStr.lastIndexOf('```')
          if (fenceClose > 0) jsonStr = jsonStr.slice(0, fenceClose)
        }
        const parsed = JSON.parse(jsonStr.trim())

        return {
          action: 'extract',
          reasoning: content2.slice(0, 100),
          confidence: 1.0,
          extractedData: parsed,
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const isRetryable = msg.includes('429') || msg.includes('500') || msg.includes('502') ||
          msg.includes('503') || msg.includes('rate') || msg.includes('timeout') ||
          msg.includes('JSON')
        if (!isRetryable || attempt === 2) {
          return {
            action: 'fail',
            reasoning: '',
            confidence: 0,
            reason: `extract failed after ${attempt + 1} attempts: ${msg}`.slice(0, 500),
          }
        }
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
      }
    }
  }

  // ── Standard mode ─────────────────────────────────────────────────────
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserMessage(instruction, snapshot, type, visionContext) },
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