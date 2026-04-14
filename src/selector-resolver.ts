// Selector Resolver — 4-strategy fallback chain with retry and self-healing

import type { Page, Locator } from '@playwright/test'
import type { LLMCommand, DOMSnapshot, ElementDescriptor } from './types'

// ─── Attempt record ────────────────────────────────────────────────────────

export interface SelectorAttempt {
  strategy: string
  selector: string | null
  success: boolean
  error?: string
}

// ─── Strategy registry ─────────────────────────────────────────────────────

interface SelectorStrategy {
  name: string
  maxRetries: number
  fn: (page: Page, cmd: LLMCommand, attempt: number) => Promise<Locator | null>
}

async function resolveByRole(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  if (!cmd.role && !cmd.text) return null
  const role = cmd.role ?? 'button'
  const name = cmd.text ?? cmd.value ?? ''

  try {
    // Try exact name first, then partial
    for (const exact of [false]) {
      const locator = page.getByRole(role as Parameters<typeof page.getByRole>[0], { name, exact })
      if (await locator.isVisible({ timeout: 500 }).catch(() => false)) return locator
    }
    // Try role alone (no name constraint) when no text given
    if (!name) {
      const locator = page.getByRole(role as Parameters<typeof page.getByRole>[0])
      if (await locator.isVisible({ timeout: 500 }).catch(() => false)) return locator
    }
  } catch { /* not found */ }
  return null
}

async function resolveByText(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  const text = cmd.text ?? cmd.value
  if (!text) return null

  try {
    const locator = page.getByText(text, { exact: false })
    if (await locator.isVisible({ timeout: 500 }).catch(() => false)) return locator
  } catch { /* not found */ }
  return null
}

async function resolveByTestId(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  // Try data-testid variations
  const attrs = ['data-testid', 'data-cy', 'data-test']
  const testIdValues = [
    cmd.testId,
    cmd.text?.toLowerCase().replace(/\s+/g, '-'),
    cmd.text?.replace(/\s+/g, ''),
  ].filter(Boolean) as string[]

  for (const attr of attrs) {
    for (const value of testIdValues) {
      try {
        // Construct selector for attribute
        const locator = page.locator(`[${attr}="${value}"]`)
        if (await locator.isVisible({ timeout: 500 }).catch(() => false)) return locator
      } catch { /* not found */ }
    }
  }

  // Also try: find elements in DOM snapshot that have testids and match the command
  return null
}

async function resolveByCSS(page: Page, cmd: LLMCommand, _attempt: number): Promise<Locator | null> {
  // Build CSS selector from element's id, classes, or tag
  const selectors: string[] = []

  if (cmd.selector) {
    // Direct CSS from LLM
    selectors.push(cmd.selector)
  }

  // Build from DOM context if we have element info
  // Try tag + attributes as CSS
  if (cmd.role) {
    selectors.push(cmd.role)
  }

  for (const sel of selectors) {
    try {
      const locator = page.locator(sel)
      if (await locator.isVisible({ timeout: 500 }).catch(() => false)) return locator
    } catch { /* bad selector */ }
  }

  return null
}

const STRATEGIES: SelectorStrategy[] = [
  { name: 'role', maxRetries: 2, fn: resolveByRole },
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
  // Find closest matching element
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
    `  Available strategies: role → text → testId → CSS\n` +
    `  Tip: Add data-testid attributes for stable selectors.`
  )
}

function findClosestElement(cmd: LLMCommand, snapshot: DOMSnapshot): string | null {
  // Find element that best matches the command intent
  const candidates = snapshot.elements.filter(el => el.isVisible)

  // Try text match
  if (cmd.text) {
    const byText = candidates.find(el =>
      el.textContent?.toLowerCase().includes(cmd.text!.toLowerCase()) ||
      el.ariaLabel?.toLowerCase().includes(cmd.text!.toLowerCase())
    )
    if (byText) return elementToString(byText)
  }

  // Try testid match
  if (cmd.testId) {
    const byTestId = candidates.find(el => el.dataTestId === cmd.testId)
    if (byTestId) return elementToString(byTestId)
  }

  // Try role match
  if (cmd.role) {
    const byRole = candidates.find(el => el.role === cmd.role)
    if (byRole) return elementToString(byRole)
  }

  // First visible element as fallback
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
): Promise<ResolveResult> {
  const attempts: SelectorAttempt[] = []
  let lastLocator: Locator | null = null

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

        if (locator) {
          // Verify it's actually visible and usable
          const isVisible = await locator.isVisible({ timeout: 500 }).catch(() => false)
          if (isVisible) {
            attempts.push({ strategy: strategy.name, selector: selectorDesc, success: true })
            lastLocator = locator
            return { locator, attempts }
          }
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

      // Stop trying this strategy if first attempt succeeded but element not visible
      if (lastLocator === null) {
        // continue to next retry or strategy
      }
    }
  }

  return { locator: null, attempts }
}

function buildSelectorDesc(cmd: LLMCommand, strategy: string, _retry: number): string {
  switch (strategy) {
    case 'role': return `getByRole("${cmd.role ?? ''}", {name:"${cmd.text ?? ''}"})`
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