// Selector Resolver — converts LLMCommand to Playwright Locator with fallback chain

import type { Page } from '@playwright/test'
import type { LLMCommand, DOMSnapshot, ElementDescriptor } from './types'

export class SelectorError extends Error {
  constructor(
    message: string,
    public readonly strategiesTried: string[],
  ) {
    super(message)
    this.name = 'SelectorError'
  }
}

function log(verbose: boolean, ...args: unknown[]): void {
  if (verbose) console.log('[selector-resolver]', ...args)
}

// Find element in DOM snapshot by LLM command hints
function findInSnapshot(
  snapshot: DOMSnapshot,
  command: LLMCommand,
): ElementDescriptor | undefined {
  // Try testId first
  if (command.testId) {
    return snapshot.elements.find(el => el.dataTestId === command.testId)
  }

  // Try text match
  if (command.text) {
    return snapshot.elements.find(el =>
      el.textContent?.toLowerCase().includes(command.text!.toLowerCase()) ||
      el.ariaLabel?.toLowerCase().includes(command.text!.toLowerCase())
    )
  }

  // Try role + text
  if (command.role && command.text) {
    return snapshot.elements.find(el =>
      el.role === command.role &&
      (el.textContent?.toLowerCase().includes(command.text!.toLowerCase()) ||
       el.ariaLabel?.toLowerCase().includes(command.text!.toLowerCase()))
    )
  }

  // Try CSS selector
  if (command.selector) {
    return snapshot.elements.find(el => {
      if (el.id && command.selector!.includes(`#${el.id}`)) return true
      if (el.classes?.some(c => command.selector!.includes(`.${c}`))) return true
      return false
    })
  }

  return undefined
}

async function resolveByRole(page: Page, command: LLMCommand): Promise<import('@playwright/test').Locator | null> {
  if (!command.role && !command.text) return null
  const role = command.role ?? 'button'
  const name = command.text ?? command.value ?? ''

  try {
    const locator = page.getByRole(role as Parameters<typeof page.getByRole>[0], { name, exact: false })
    if (await locator.isVisible({ timeout: 1000 })) return locator
  } catch { /* not found */ }
  return null
}

async function resolveByText(page: Page, command: LLMCommand): Promise<import('@playwright/test').Locator | null> {
  if (!command.text && !command.value) return null
  const text = command.text ?? command.value ?? ''

  try {
    const locator = page.getByText(text, { exact: false })
    if (await locator.isVisible({ timeout: 1000 })) return locator
  } catch { /* not found */ }
  return null
}

async function resolveByTestId(page: Page, command: LLMCommand): Promise<import('@playwright/test').Locator | null> {
  const testId = command.testId
  if (!testId) return null

  try {
    const locator = page.getByTestId(testId)
    if (await locator.isVisible({ timeout: 1000 })) return locator
  } catch { /* not found */ }
  return null
}

async function resolveByCSS(page: Page, command: LLMCommand): Promise<import('@playwright/test').Locator | null> {
  const selector = command.selector
  if (!selector) return null

  try {
    const locator = page.locator(selector)
    if (await locator.isVisible({ timeout: 1000 })) return locator
  } catch { /* not found */ }
  return null
}

// Main resolver
export async function resolveSelector(
  page: Page,
  command: LLMCommand,
  _snapshot: DOMSnapshot,
  verbose = false,
): Promise<import('@playwright/test').Locator | null> {
  const strategies: Array<[string, () => Promise<import('@playwright/test').Locator | null>]> = [
    ['role', () => resolveByRole(page, command)],
    ['text', () => resolveByText(page, command)],
    ['testId', () => resolveByTestId(page, command)],
    ['css', () => resolveByCSS(page, command)],
  ]

  for (const [name, fn] of strategies) {
    log(verbose, `Trying strategy: ${name}`)
    const locator = await fn()
    if (locator) {
      log(verbose, `✓ Strategy ${name} succeeded`)
      return locator
    }
    log(verbose, `✗ Strategy ${name} failed`)
  }

  return null
}

// Build a readable error message
export function buildSelectorError(command: LLMCommand, snapshot: DOMSnapshot): string {
  const el = findInSnapshot(snapshot, command)
  const elDesc = el
    ? `${el.role} <${el.tagName}> "${el.textContent || el.placeholder}" (#${el.id || el.dataTestId || 'no-id'})`
    : 'element not found in DOM snapshot'

  return (
    `ai() failed to resolve selector.\n` +
    `  Action: ${command.action}\n` +
    `  LLM reasoning: ${command.reasoning}\n` +
    `  LLM confidence: ${command.confidence}\n` +
    `  Closest DOM element: ${elDesc}\n` +
    `  Tried: role → text → testId → CSS\n` +
    `  Tip: Add data-testid attributes to make selectors stable, or use more specific instructions.`
  )
}