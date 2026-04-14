// Core ai() function — orchestrates DOM capture → LLM → Playwright execution

import type { Page } from '@playwright/test'
import { serializePage } from './dom-serializer'
import { resolveLLMConfig } from './config'
import { callLLM } from './llm-client'
import { resolveSelectorWithRetry, buildSelectorError } from './selector-resolver'
import type { AiOptions, LLMCommand } from './types'
import { DEFAULT_DEBUG_CONFIG } from './types'

async function executeAction(
  command: LLMCommand,
  locator: import('@playwright/test').Locator,
): Promise<void> {
  switch (command.action) {
    case 'click':
      await locator.click()
      break
    case 'type':
      await locator.fill(command.value ?? '')
      break
    case 'hover':
      await locator.hover()
      break
    case 'select':
      if (command.value) await locator.selectOption(command.value)
      break
    case 'scroll':
      await locator.scrollIntoViewIfNeeded()
      break
    case 'wait':
      await locator.waitFor({ state: 'visible', timeout: 5000 })
      break
    default:
      throw new Error(`Unsupported action type: ${command.action}`)
  }
}

async function executeAssert(
  command: LLMCommand,
  locator: import('@playwright/test').Locator,
): Promise<boolean> {
  const assertion = command.assertion
  if (!assertion) throw new Error('assert action missing assertion object')

  switch (assertion.type) {
    case 'visible':
      await locator.waitFor({ state: 'visible', timeout: 5000 })
      return true
    case 'text': {
      const actual = await locator.textContent()
      if (!actual?.includes(String(assertion.expected))) {
        throw new Error(`Assertion failed: expected text containing "${assertion.expected}", got "${actual}"`)
      }
      return true
    }
    case 'count': {
      const count = await locator.count()
      if (count !== Number(assertion.expected)) {
        throw new Error(`Assertion failed: expected ${assertion.expected} elements, got ${count}`)
      }
      return true
    }
    case 'attribute': {
      const attrVal = await locator.getAttribute(assertion.attribute ?? '')
      if (attrVal !== String(assertion.expected)) {
        throw new Error(`Assertion failed: expected ${assertion.attribute}="${assertion.expected}", got "${attrVal}"`)
      }
      return true
    }
    default:
      throw new Error(`Unknown assertion type: ${assertion.type}`)
  }
}

async function executeQuery(
  page: Page,
  command: LLMCommand,
  locator: import('@playwright/test').Locator,
): Promise<string | number> {
  const q = command.query
  if (!q) throw new Error('query action missing query object')

  // Special case: querying page title directly
  if (q.extraction === 'title') {
    return page.title()
  }

  switch (q.extraction) {
    case 'text':
      return (await locator.textContent()) ?? ''
    case 'attribute':
      return (await locator.getAttribute(q.attribute ?? '')) ?? ''
    case 'count':
      return await locator.count()
    default:
      throw new Error(`Unknown extraction type: ${q.extraction}`)
  }
}

export async function ai(
  instruction: string | string[],
  options: AiOptions,
): Promise<boolean | string | number> {
  const config = resolveLLMConfig()
  const debug = DEFAULT_DEBUG_CONFIG

  const instructions = Array.isArray(instruction) ? instruction : [instruction]
  const snapshot = await serializePage(options.page)

  for (const inst of instructions) {
    const type = options.type ?? 'action'
    const command = await callLLM(inst, snapshot, type, config)

    if (command.action === 'fail') {
      throw new Error(
        `ai() failed: ${command.reason ?? command.reasoning ?? 'unknown error'}\n` +
        `  Instruction: "${inst}"\n  confidence: ${command.confidence}`
      )
    }

    // Try to resolve selector with retry (3 attempts with context enrichment)
    const { locator, attempts } = await resolveSelectorWithRetry(
      options.page,
      command,
      debug.verbose,
    )

    if (!locator) {
      const errorMsg = buildSelectorError(command, snapshot, attempts)
      throw new Error(`ai() selector resolution failed after ${attempts.length} attempts.\n${errorMsg}\n  Instruction: "${inst}"`)
    }

    if (type === 'assert' || command.action === 'assert') {
      return await executeAssert(command, locator)
    } else if (type === 'query' || command.action === 'query') {
      return await executeQuery(options.page, command, locator)
    } else {
      await executeAction(command, locator)
    }
  }

  return true
}