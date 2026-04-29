// Playwright Test Fixture — integrates ai() into @playwright/test

import { test as base, type Page } from '@playwright/test'
import { ai } from './ai.js'
import { checkApiKey } from './config.js'
import type { AiOptions } from './types.js'

checkApiKey()

export { ai }
export type { AiOptions, AiConfig, LLMCommand, DOMSnapshot, ElementDescriptor } from './types.js'

type AiFn = (instruction: string | string[], options?: Partial<AiOptions>) => ReturnType<typeof ai>

export const test = base.extend<{ ai: AiFn }>({
  ai: async ({ page }: { page: Page }, use: (fn: AiFn) => Promise<void>) => {
    await use(async (instruction, opts) => ai(instruction, { page, ...opts }))
  },
})

export default test