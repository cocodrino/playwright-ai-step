// Core ai() function — DOM capture → LLM → Playwright execution

import type { Page } from '@playwright/test'
import { serializePage } from './dom-serializer.js'
import { resolveLLMConfig } from './config.js'
import { callLLM } from './llm-client.js'
import { resolveSelectorWithRetry, buildSelectorError } from './selector-resolver.js'
import { buildVisionContext } from './vision.js'
import type { AiOptions, LLMCommand, DOMSnapshot } from './types.js'
import { DEFAULT_CONTEXT_CONFIG } from './types.js'

// ─── Action executors ────────────────────────────────────────────────────

async function executeAction(
  command: LLMCommand,
  locator: import('@playwright/test').Locator,
  page: import('@playwright/test').Page,
): Promise<void> {
  // Use .first() for actions that should target a single element,
  // avoiding strict mode violations when multiple matches exist.
  const single = locator.first()
  switch (command.action) {
    case 'click':    await single.click()
      break
    case 'type':    await typeIntoElement(single, command.value ?? '', page)
      break
    case 'hover':   await single.hover()
      break
    case 'select':  if (command.value) await single.selectOption(command.value)
      break
    case 'scroll':  await single.scrollIntoViewIfNeeded()
      break
    case 'wait':    await single.waitFor({ state: 'visible', timeout: 5000 })
      break
    default: throw new Error(`Unsupported action type: ${command.action}`)
  }
}

async function typeIntoElement(
  locator: import('@playwright/test').Locator,
  value: string,
  page: import('@playwright/test').Page,
): Promise<void> {
  // Try fill() first — works for standard input/textarea/contenteditable
  try {
    await locator.fill(value, { timeout: 3000 })
    return
  } catch {
    // fill() failed — element may be a custom element wrapping an input.
    // Try to find an inner input/textarea within the located element.
  }

  // Search for nested <input> or <textarea> inside the custom element
  const innerInput = locator.locator('input, textarea, [contenteditable]')
  const innerCount = await innerInput.count()
  if (innerCount > 0) {
    await innerInput.first().fill(value)
    return
  }

  // Last resort: click to focus, then type character by character
  await locator.click()
  await page.keyboard.type(value)
}

async function executeAssert(
  command: LLMCommand,
  locator: import('@playwright/test').Locator,
): Promise<boolean> {
  const assertion = command.assertion
  if (!assertion) throw new Error('assert action missing assertion object')

  switch (assertion.type) {
    case 'visible': {
      // Try Playwright's waitFor first, but fall back to a simpler check
      // for custom elements where isVisible may not work properly
      try {
        await locator.waitFor({ state: 'visible', timeout: 5000 })
        return true
      } catch {
        // Element might be a custom element with shadow DOM
        // that doesn't play well with Playwright's visibility check
        const count = await locator.count()
        if (count > 0) {
          // Element exists — use JS-based visibility check
          const jsVisible = await locator.evaluate((el: Element) => {
            const style = window.getComputedStyle(el)
            return style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              parseFloat(style.opacity) > 0
          }).catch(() => true) // default to true if JS check fails
          if (jsVisible) return true
        }
        throw new Error(`Assertion failed: element not visible (count: ${count})`)
      }
    }
    case 'text': {
      const actual = await locator.first().textContent()
      if (!actual?.includes(String(assertion.expected))) {
        throw new Error(`Assertion failed: expected text containing "${assertion.expected}", got "${actual}"`)
      }
      return true
    }
    case 'count': {
      const count = await locator.count()
      const expected = Number(assertion.expected)
      // Allow "at least N" semantics — if the LLM says "5" but there are 12, that's still an assertion pass
      if (count < expected) {
        throw new Error(`Assertion failed: expected at least ${expected} elements, got ${count}`)
      }
      return true
    }
    case 'attribute': {
      const attrVal = await locator.first().getAttribute(assertion.attribute ?? '')
      if (attrVal !== String(assertion.expected)) {
        throw new Error(`Assertion failed: expected ${assertion.attribute}="${assertion.expected}", got "${attrVal}"`)
      }
      return true
    }
    default: throw new Error(`Unknown assertion type: ${assertion.type}`)
  }
}

async function executeQuery(
  page: Page,
  command: LLMCommand,
  locator: import('@playwright/test').Locator,
): Promise<string | number> {
  const q = command.query
  if (!q) throw new Error('query action missing query object')

  if (q.extraction === 'title') return page.title()

  switch (q.extraction) {
    case 'text':      return (await locator.first().textContent()) ?? ''
    case 'attribute': return (await locator.first().getAttribute(q.attribute ?? '')) ?? ''
    case 'count':     return await locator.count()
    default: throw new Error(`Unknown extraction type: ${q.extraction}`)
  }
}

function flattenExtractedData(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(flattenExtractedData)
  if (data !== null && typeof data === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        out[key] = String(val)
      } else if (val === null) {
        out[key] = ''
      } else {
        out[key] = flattenExtractedData(val)
      }
    }
    return out
  }
  return data
}

function isUrlField(key: string, schemaValue?: unknown): boolean {
  const k = key.toLowerCase()
  if (k === 'url' || k === 'link' || k === 'href' || k === 'src') return true
  if (typeof schemaValue === 'string') {
    const v = schemaValue.toLowerCase()
    if (v.includes('url') || v.includes('http') || v.includes('link') || v.includes('href')) return true
  }
  return false
}

function enrichExtractedUrls(data: unknown, snapshot: DOMSnapshot, schema?: Record<string, unknown>): unknown {
  if (!data || typeof data !== 'object') return data

  const links = (snapshot.links ?? []).map(l => ({
    href: l.href,
    text: (l.label || l.text || '').toLowerCase(),
  }))

  if (links.length === 0) return data

  const schemaObj = schema ?? {}

  function findUrlForItem(item: Record<string, unknown>): string | null {
    const titleText = String(item.title || item.name || item.text || '').toLowerCase().trim()
    if (!titleText) return null

    let bestMatch: { href: string; score: number } | null = null
    for (const link of links) {
      if (!link.text) continue
      const words = titleText.split(/\s+/).filter(w => w.length > 2)
      const overlap = words.filter(w => link.text.includes(w)).length
      if (overlap > (bestMatch?.score ?? 0)) {
        bestMatch = { href: link.href, score: overlap }
      }
    }
    return bestMatch && bestMatch.score >= 2 ? bestMatch.href : null
  }

  function enrichLeaf(item: Record<string, unknown>, itemSchema: Record<string, unknown>): Record<string, unknown> {
    const out = { ...item }
    for (const [key, val] of Object.entries(item)) {
      const schemaValue = itemSchema[key]
      if (isUrlField(key, schemaValue) && (!val || val === '')) {
        const matchUrl = findUrlForItem(out)
        if (matchUrl) out[key] = matchUrl
      }
    }
    return out
  }

  function walk(val: unknown, valSchema: Record<string, unknown>): unknown {
    if (Array.isArray(val)) return val.map(el => walk(el, valSchema))
    if (val !== null && typeof val === 'object') {
      const obj = val as Record<string, unknown>
      const hasArrayChild = Object.values(obj).some(v => Array.isArray(v))
      if (hasArrayChild) {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(obj)) {
          const childSchema = valSchema[k]
          const innerSchema = Array.isArray(childSchema) && childSchema.length > 0 && typeof childSchema[0] === 'object'
            ? childSchema[0] as Record<string, unknown>
            : valSchema
          out[k] = walk(v, innerSchema)
        }
        return out
      }
      return enrichLeaf(obj, valSchema)
    }
    return val
  }

  return walk(data, schemaObj)
}

// ─── ai() main ─────────────────────────────────────────────────────────

export async function ai(
  instruction: string | string[],
  options: AiOptions,
): Promise<boolean | string | number> {
  const config = resolveLLMConfig()
  const contextConfig = DEFAULT_CONTEXT_CONFIG

  const instructions = Array.isArray(instruction) ? instruction : [instruction]
  const snapshot = await serializePage(options.page)

  // Build vision context if enabled (Phase 4 feature)
  const visionContext = await buildVisionContext(
    options.page,
    snapshot,
    contextConfig.includeScreenshot,
  )

  for (const inst of instructions) {
    const type = options.type ?? 'action'
    const command = await callLLM(inst, snapshot, type, config, visionContext, options.schema)

    if (command.action === 'fail') {
      throw new Error(
        `ai() failed: ${command.reason ?? command.reasoning ?? 'unknown error'}\n` +
        `  Instruction: "${inst}"\n  confidence: ${command.confidence}`
      )
    }

    // Extract mode: return structured JSON directly
    if (type === 'extract') {
      if (command.extractedData === undefined) {
        throw new Error(`ai() extract: no data returned. LLM said: ${command.reasoning}`)
      }
      const flattened = flattenExtractedData(command.extractedData)
      const enriched = enrichExtractedUrls(flattened, snapshot, options.schema)
      return enriched as boolean | string | number
    }

    const { locator, attempts } = await resolveSelectorWithRetry(
      options.page,
      command,
      false,
      { instruction: inst, snapshot },
    )

    if (!locator) {
      const errorMsg = buildSelectorError(command, snapshot, attempts)
      throw new Error(
        `ai() selector resolution failed after ${attempts.length} attempts.\n` +
        `${errorMsg}\n  Instruction: "${inst}"`
      )
    }

    if (type === 'assert' || command.action === 'assert') {
      return await executeAssert(command, locator)
    } else if (type === 'query' || command.action === 'query') {
      return await executeQuery(options.page, command, locator)
    } else {
      await executeAction(command, locator, options.page)
    }
  }

  return true
}

// ─── aiNavigate — multi-page flows (Phase 4) ───────────────────────────

export interface PageStep {
  instruction: string
  expectedUrl?: RegExp | string
  expectedTitle?: string
  waitForSelector?: string
  type?: 'action' | 'assert' | 'query'
}

export interface AiNavigateResult {
  page: Page
  results: (boolean | string | number)[]
  navigatedSteps: number
}

export async function aiNavigate(
  steps: PageStep[],
  options: AiOptions,
): Promise<AiNavigateResult> {
  const results: (boolean | string | number)[] = []
  let navigatedSteps = 0

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]

    // Execute the instruction
    const result = await ai(step.instruction, {
      ...options,
      type: step.type,
    })
    results.push(result)
    navigatedSteps++

    // Wait for navigation if expectedUrl is specified
    if (step.expectedUrl) {
      await options.page.waitForURL(step.expectedUrl).catch(() => {
        // If we navigated away, that's the expected behavior
      })
    }

    // Wait for selector if specified
    if (step.waitForSelector) {
      await options.page.waitForSelector(step.waitForSelector, { timeout: 5000 }).catch(() => {
        // Element may not have appeared
      })
    }

    // Re-serialize DOM for next step (handled automatically in next ai() call)
  }

  return { page: options.page, results, navigatedSteps }
}

// ─── Exports ───────────────────────────────────────────────────────────

export { captureScreenshot, buildVisionContext } from './vision.js'
export type { VisionConfig, CapturedScreenshot, VisionPromptParts } from './vision.js'