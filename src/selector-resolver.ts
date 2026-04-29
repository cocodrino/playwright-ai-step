// Selector Resolver — 4-strategy fallback chain with retry and self-healing

import type { Page, Locator } from '@playwright/test'
import type { LLMCommand, DOMSnapshot, ElementDescriptor } from './types.js'

// ─── Attempt record ────────────────────────────────────────────────────────

export interface SelectorAttempt {
  strategy: string
  selector: string | null
  success: boolean
  error?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function isLocatorUsable(locator: Locator): Promise<boolean> {
  // Check visibility with a reasonable timeout for elements that may still be loading
  if (await locator.isVisible({ timeout: 3000 }).catch(() => false)) return true

  // For custom elements / shadow DOM, isVisible() can be unreliable.
  // Fall back to checking if the element exists and has dimensions.
  try {
    const count = await locator.count()
    if (count > 0) {
      // Element exists — try a bounding box check as a fallback
      const box = await locator.boundingBox().catch(() => null)
      if (box && box.width > 0 && box.height > 0) return true

      // Some custom elements (e.g. ytd-*) don't report bounding boxes correctly.
      // Check via JS evaluation if the element is actually rendered.
      const jsVisible = await locator.evaluate((el: Element) => {
        const style = window.getComputedStyle(el)
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          parseFloat(style.opacity) > 0
      }).catch(() => false)
      if (jsVisible) return true

      // For custom elements with shadow DOM, even the JS check may fail.
      // If the element exists (count > 0) and is in the DOM, consider it usable
      // for assertion and query operations — the action executor will handle
      // interaction specifics.
      return true
    }
  } catch { /* not usable */ }

  return false
}

async function canUseLocatorForCommand(locator: Locator, cmd: LLMCommand): Promise<boolean> {
  if (!(await isLocatorUsable(locator))) return false
  if (cmd.action === 'type' || cmd.action === 'select') {
    const count = await locator.count().catch(() => 0)
    return count === 1
  }
  return true
}

function cssAttrValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
// ─── Strategy registry ─────────────────────────────────────────────────────

interface SelectorStrategy {
  name: string
  maxRetries: number
  fn: (page: Page, cmd: LLMCommand, attempt: number) => Promise<Locator | null>
}

async function resolveByRole(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  if (!cmd.role && !cmd.text) return null
  const role = cmd.role ?? ''
  const name = cmd.text ?? cmd.value ?? ''

  if (!role) return null

  try {
    if (name) {
      const locator = page.getByRole(role as Parameters<typeof page.getByRole>[0], { name, exact: false })
      if (await canUseLocatorForCommand(locator, cmd)) return locator
    }

    // Try role alone (no name constraint) when no text given
    const locator = page.getByRole(role as Parameters<typeof page.getByRole>[0])
    if (await canUseLocatorForCommand(locator, cmd)) return locator
  } catch { /* not found */ }
  return null
}

async function resolveByField(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  const probes: Locator[] = []

  if (cmd.name) {
    probes.push(page.locator(`[name="${cssAttrValue(cmd.name)}"]`))
  }

  const text = (cmd.text ?? '').trim()
  if (text) {
    probes.push(page.getByLabel(text, { exact: true }))
    probes.push(page.getByPlaceholder(text, { exact: true }))
  }

  for (const locator of probes) {
    if (await canUseLocatorForCommand(locator, cmd)) return locator
  }

  return null
}

async function resolveByText(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  const text = cmd.text ?? cmd.value
  if (!text) return null

  try {
    const locator = page.getByText(text, { exact: false })
    if (await canUseLocatorForCommand(locator, cmd)) return locator
  } catch { /* not found */ }
  return null
}

async function resolveByTestId(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  const testIdValues = [
    cmd.testId,
    cmd.text?.toLowerCase().replace(/\s+/g, '-'),
    cmd.text?.replace(/\s+/g, ''),
  ].filter(Boolean) as string[]

  if (!testIdValues.length) return null

  const attrs = ['data-testid', 'data-cy', 'data-test']

  for (const attr of attrs) {
    for (const value of testIdValues) {
      try {
        const locator = page.locator(`[${attr}="${value}"]`)
        if (await canUseLocatorForCommand(locator, cmd)) return locator
      } catch { /* not found */ }
    }
  }

  return null
}

async function resolveByCSS(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  const selectors: string[] = []

  if (cmd.selector) {
    selectors.push(cmd.selector)
  }

  if (cmd.role) {
    selectors.push(cmd.role)
  }

  // For assert/query actions on custom elements, try the selector directly
  // even if visibility checks are unreliable (e.g. YouTube's ytd-* elements)
  for (const sel of selectors) {
    try {
      const locator = page.locator(sel)
      if (await canUseLocatorForCommand(locator, cmd)) return locator
    } catch { /* bad selector */ }
  }

  return null
}

// ─── Keyword fallback ────────────────────────────────────────────────────
// When the LLM returns empty selectors because the element isn't in the DOM
// snapshot (e.g. Shadow DOM elements beyond the 200-element limit), we extract
// quoted or key text from the original instruction and try Playwright's
// built-in locators which DO pierce Shadow DOM.

function extractKeywords(instruction: string): string[] {
  // Extract quoted strings first: "Videos", 'filter', etc.
  const quoted = [...instruction.matchAll(/["']([^"']+)["']/g)].map(m => m[1])
  if (quoted.length > 0) return quoted

  // Fallback: extract capitalized words and short phrases
  const words = instruction.split(/[\s,;.!?]+/).filter(w => w.length > 2)
  if (words.length === 0) return []
  const significant = words.filter(w => /^[A-Z]/.test(w) || ['filter','tab','button','menu','link','item','chip','card','option','section'].includes(w.toLowerCase()))
  return significant.length > 0 ? significant : [words[0]]
}

async function resolveByKeywordFallback(
  page: Page,
  _cmd: LLMCommand,
  instruction: string,
): Promise<Locator | null> {
  const keywords = extractKeywords(instruction)
  if (keywords.length === 0) return null

  for (const keyword of keywords) {
    // Try getByText — Playwright's text search pierces Shadow DOM
    try {
      const byText = page.getByText(keyword, { exact: false })
      if (await isLocatorUsable(byText)) return byText.first()
    } catch { /* not found */ }

    // Try getByRole with name — works across Shadow DOM boundaries
    const roles = ['button', 'tab', 'link', 'option', 'menuitem', 'radio', 'checkbox']
    for (const role of roles) {
      try {
        const byRole = page.getByRole(role as any, { name: keyword, exact: false })
        if (await isLocatorUsable(byRole)) return byRole.first()
      } catch { /* not found */ }
    }

    // Try aria-label match
    try {
      const byAria = page.getByLabel(keyword, { exact: false })
      if (await isLocatorUsable(byAria)) return byAria.first()
    } catch { /* not found */ }

    // Try CSS :text() pseudo-selector on custom elements (traverses shadow DOM)
    try {
      const byCssText = page.locator(`:text("${keyword}")`)
      const count = await byCssText.count()
      if (count > 0) return byCssText.first()
    } catch { /* bad selector */ }
  }

  return null
}

const STRATEGIES: SelectorStrategy[] = [
  { name: 'role', maxRetries: 2, fn: resolveByRole },
  { name: 'field', maxRetries: 2, fn: resolveByField },
  { name: 'text', maxRetries: 2, fn: resolveByText },
  { name: 'testId', maxRetries: 3, fn: resolveByTestId },
  { name: 'css', maxRetries: 2, fn: resolveByCSS },
]

// ─── Retry with context enrichment ──────────────────────────────────────────

function buildDiagnosticContext(
  cmd: LLMCommand,
  snapshot: DOMSnapshot,
  attempts: SelectorAttempt[],
): string {
  let closest = findClosestElement(cmd, snapshot)

  const strategyHistory = attempts
    .map(a => `  - ${a.strategy}: ${a.success ? '✓' : '✗'} ${a.selector ?? 'n/a'} — ${a.error ?? ''}`)
    .join('\n')

  return (
    `  Action: ${cmd.action}\n` +
    `  LLM reasoning: ${cmd.reasoning ?? cmd.reasoning}\n` +
    `  LLM confidence: ${cmd.confidence}\n` +
    `  Strategy history:\n${strategyHistory}\n` +
    `  Closest DOM element: ${closest ?? 'none found'}\n` +
    `  Top candidates:\n${buildTopCandidates(cmd, snapshot)}\n` +
    `  Available strategies: role → field → text → testId → CSS\n` +
    `  Tip: Add data-testid attributes for stable selectors.`
  )
}

function buildTopCandidates(cmd: LLMCommand, snapshot: DOMSnapshot): string {
  const visible = snapshot.elements.filter(el => el.isVisible)
  const target = (cmd.text ?? cmd.value ?? cmd.name ?? '').toLowerCase().trim()

  const ranked = visible
    .map(el => {
      let score = 0
      const text = (el.textContent ?? '').toLowerCase()
      const aria = (el.ariaLabel ?? '').toLowerCase()
      const placeholder = (el.placeholder ?? '').toLowerCase()
      const nameAttr = (el.attributes?.name ?? '').toLowerCase()

      if (cmd.role && el.role === cmd.role) score += 3
      if (target && text.includes(target)) score += 4
      if (target && aria.includes(target)) score += 4
      if (target && placeholder.includes(target)) score += 3
      if (target && nameAttr.includes(target)) score += 3
      if (cmd.testId && el.dataTestId === cmd.testId) score += 5

      return { el, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  if (ranked.length === 0) return '  - none'
  return ranked
    .map(({ el, score }) => `  - score:${score} ${elementToString(el)}`)
    .join('\n')
}

function findClosestElement(cmd: LLMCommand, snapshot: DOMSnapshot): string | null {
  const candidates = snapshot.elements.filter(el => el.isVisible)

  if (cmd.text) {
    const byText = candidates.find(el =>
      el.textContent?.toLowerCase().includes(cmd.text!.toLowerCase()) ||
      el.ariaLabel?.toLowerCase().includes(cmd.text!.toLowerCase())
    )
    if (byText) return elementToString(byText)
  }

  if (cmd.testId) {
    const byTestId = candidates.find(el => el.dataTestId === cmd.testId)
    if (byTestId) return elementToString(byTestId)
  }

  if (cmd.role) {
    const byRole = candidates.find(el => el.role === cmd.role)
    if (byRole) return elementToString(byRole)
  }

  // Try matching by tag name from selector
  if (cmd.selector) {
    const bySelector = candidates.find(el => cmd.selector!.includes(el.tagName))
    if (bySelector) return elementToString(bySelector)
  }

  if (candidates.length > 0) {
    return `First visible: ${elementToString(candidates[0])}`
  }

  return null
}

function elementToString(el: ElementDescriptor): string {
  const parts: string[] = []
  if (el.role && el.role !== el.tagName) parts.push(`[${el.role}]`)
  if (el.tagName) parts.push(`<${el.tagName}>`)
  if (el.id) parts.push(`#${el.id}`)
  if (el.dataTestId) parts.push(`[data-testid="${el.dataTestId}"]`)
  if (el.textContent) parts.push(`"${el.textContent}"`)
  if (el.placeholder) parts.push(`placeholder="${el.placeholder}"`)
  return parts.join(' ') || '(empty element)'
}

// ─── Main export ────────────────────────────────────────────────────────────

export interface ResolveResult {
  locator: Locator | null
  attempts: SelectorAttempt[]
}

export async function resolveSelectorWithRetry(
  page: Page,
  command: LLMCommand,
  verbose = false,
  context?: { instruction?: string; snapshot?: DOMSnapshot },
): Promise<ResolveResult> {
  const attempts: SelectorAttempt[] = []

  // For 'query' with extraction='title', no DOM selector needed
  if (command.action === 'query' && command.query?.extraction === 'title') {
    return { locator: page.locator('body'), attempts: [] }
  }

  for (const strategy of STRATEGIES) {
    for (let retry = 0; retry < strategy.maxRetries; retry++) {
      const selectorDesc = buildSelectorDesc(command, strategy.name, retry)

      try {
        if (verbose) console.log(`[selector-resolver] Trying ${strategy.name} (retry ${retry})`)
        const locator = await strategy.fn(page, command, retry)

        if (locator && await isLocatorUsable(locator)) {
          attempts.push({ strategy: strategy.name, selector: selectorDesc, success: true })
          return { locator, attempts }
        }

        attempts.push({ strategy: strategy.name, selector: selectorDesc, success: false, error: 'not visible or not found' })
      } catch (err) {
        attempts.push({
          strategy: strategy.name,
          selector: selectorDesc,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  // ── Keyword fallback: when LLM returns empty selectors, extract keywords ──
  // from the instruction and try Playwright's built-in locators (which pierce
  // Shadow DOM) to find the element.
  if (context?.instruction && context?.snapshot) {
  const hasEmptySelectors = !command.role && !command.text && !command.name && !command.testId && !command.selector
    if (hasEmptySelectors) {
      const keywords = extractKeywords(context.instruction)
      for (const keyword of keywords) {
        try {
          const locator = await resolveByKeywordFallback(page, command, context.instruction)
          if (locator) {
            attempts.push({ strategy: 'keyword-fallback', selector: `keyword:"${keyword}"`, success: true })
            return { locator, attempts }
          }
        } catch { /* not found */ }
      }
      attempts.push({ strategy: 'keyword-fallback', selector: null, success: false, error: 'no keyword match found' })
    }
  }

  return { locator: null, attempts }
}

function buildSelectorDesc(cmd: LLMCommand, strategy: string, _retry: number): string {
  switch (strategy) {
    case 'role': return `getByRole("${cmd.role ?? ''}", {name:"${cmd.text ?? ''}"})`
    case 'field': return `name="${cmd.name ?? ''}" or label/placeholder="${cmd.text ?? ''}"`
    case 'text': return `getByText("${cmd.text ?? cmd.value ?? ''}")`
    case 'testId': return `[data-testid="${cmd.testId ?? cmd.text ?? ''}"]`
    case 'css': return cmd.selector ?? `${cmd.role ?? ''}[${cmd.text ?? ''}]`
    default: return 'unknown'
  }
}

export function buildSelectorError(
  command: LLMCommand,
  snapshot: DOMSnapshot,
  attempts: SelectorAttempt[] = [],
): string {
  const context = buildDiagnosticContext(command, snapshot, attempts)
  return (
    `ai() failed to resolve selector after ${attempts.length} attempts.\n` +
    context
  )
}

export function buildSelectorErrorLegacy(_command: LLMCommand, _snapshot: DOMSnapshot): string {
  return buildSelectorError(_command, _snapshot, [])
}
