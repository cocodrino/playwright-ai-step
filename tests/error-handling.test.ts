// Error handling tests — validates clear error messages

import { test, expect } from 'vitest'
import { parseResponse } from '../src/llm-client'
import { resolveLLMConfig } from '../src/config'

test('parseResponse returns fail action with reason for invalid JSON', () => {
  const cmd = parseResponse('not json at all {[]}')
  expect(cmd.action).toBe('fail')
  expect(cmd.reason).toContain('JSON parse error')
})

test('parseResponse returns fail action when action is missing', () => {
  const cmd = parseResponse('{"foo":"bar"}')
  expect(cmd.action).toBe('fail')
})

test('parseResponse returns fail action for unexpected action type', () => {
  const cmd = parseResponse('{"action":"fly_to_the_moon","reasoning":"ok","confidence":0.9}')
  expect(cmd.action).toBe('fail')
})

test('LLM config returns empty apiKey when no key is set', () => {
  // Save originals
  const original: Record<string, string | undefined> = {}
  const keys = [
    'LLM_API_KEY', 'OLLAMA_API_KEY', 'MINIMAX_API_KEY', 'OPENAI_API_KEY',
    'PAS_LLM_API_KEY', 'PAS_OLLAMA_API_KEY', 'PAS_MINIMAX_API_KEY', 'PAS_OPENAI_API_KEY',
  ]
  for (const key of keys) {
    original[key] = process.env[key]
    delete (process.env as Record<string, string | undefined>)[key]
  }

  const config = resolveLLMConfig()
  expect(config.apiKey).toBe('')

  // Restore originals
  for (const key of keys) {
    if (original[key] !== undefined) (process.env as Record<string, string | undefined>)[key] = original[key]
  }
})

test('buildSelectorError includes all fallback strategies tried', async () => {
  const { buildSelectorError } = await import('../src/selector-resolver')

  const msg = buildSelectorError(
    { action: 'click', reasoning: 'element not found', confidence: 0.2 },
    { url: 'https://example.com', title: 'Example', elements: [], timestamp: 0 }
  )

  expect(msg).toContain('role')
  expect(msg).toContain('text')
  expect(msg).toContain('testId')
  expect(msg).toContain('CSS')
  expect(msg).toContain('ai() failed to resolve selector')
})