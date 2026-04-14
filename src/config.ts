// Configuration — reads from env vars and optional ai-step.config.ts

import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { AiConfig, LLMConfig } from './types'
import { DEFAULT_LLM_CONFIG, DEFAULT_SELECTOR_CONFIG, DEFAULT_CONTEXT_CONFIG, DEFAULT_DEBUG_CONFIG } from './types'

function loadEnvFile(): void {
  try {
    const envPath = resolve(process.cwd(), '.env')
    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx < 0) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      if (!(key in process.env)) process.env[key] = val
    }
  } catch { /* no .env */ }
}

loadEnvFile()

export function loadConfig(overrides?: Partial<AiConfig>): AiConfig {
  return {
    llm: { ...DEFAULT_LLM_CONFIG, ...overrides?.llm },
    selectors: { ...DEFAULT_SELECTOR_CONFIG, ...overrides?.selectors },
    context: { ...DEFAULT_CONTEXT_CONFIG, ...overrides?.context },
    debugging: { ...DEFAULT_DEBUG_CONFIG, ...overrides?.debugging },
  }
}

export function resolveLLMConfig(): LLMConfig {
  const isOllama =
    (process.env.LLM_BASE_URL?.includes('localhost') ?? false) ||
    process.env.LLM_PROVIDER === 'ollama'

  return {
    ...DEFAULT_LLM_CONFIG,
    provider: isOllama ? 'ollama' : (process.env.LLM_PROVIDER as LLMConfig['provider']) ?? 'minimax',
    apiKey: process.env.LLM_API_KEY ?? '',
    baseUrl: process.env.LLM_BASE_URL ?? (isOllama ? 'http://localhost:11434/v1' : 'https://api.minimax.io/v1'),
    model: process.env.LLM_MODEL ?? (isOllama ? 'gemma-4-31b-it' : 'MiniMax-M2.7'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS ?? '') || DEFAULT_LLM_CONFIG.maxTokens,
    temperature: parseFloat(process.env.LLM_TEMPERATURE ?? '') || DEFAULT_LLM_CONFIG.temperature,
    timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS ?? '') || DEFAULT_LLM_CONFIG.timeoutMs,
  }
}

export function checkApiKey(): void {
  if (!process.env.LLM_API_KEY) {
    console.warn('[playwright-ai-step] WARNING: LLM_API_KEY not set. Create a .env file with LLM_API_KEY=your_key_here')
  }
}