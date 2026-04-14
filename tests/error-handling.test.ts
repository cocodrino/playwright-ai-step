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
  const original = process.env.LLM_API_KEY
  delete process.env.LLM_API_KEY
  delete process.env.OLLAMA_API_KEY
  delete process.env.MINIMAX_API_KEY

  const config = resolveLLMConfig()
  expect(config.apiKey).toBe('')

  if (original) process.env.LLM_API_KEY = original
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