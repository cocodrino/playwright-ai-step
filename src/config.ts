// Configuration — multi-provider LLM support (Ollama, MiniMax, OpenAI, Custom)

import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { AiConfig, LLMConfig, LLMProvider } from './types'
import {
  DEFAULT_LLM_CONFIG,
  DEFAULT_SELECTOR_CONFIG,
  DEFAULT_CONTEXT_CONFIG,
  DEFAULT_DEBUG_CONFIG,
} from './types'

// ─── .env loader ─────────────────────────────────────────────────────────

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

// ─── Provider configs ─────────────────────────────────────────────────────

interface ProviderSpec {
  provider: LLMProvider
  apiKey: string
  baseUrl: string
  model: string
}

function detectProvider(): LLMProvider {
  const explicit = process.env.LLM_PROVIDER
  if (explicit) return explicit as LLMProvider

  // Auto-detect from baseUrl
  const url = (process.env.LLM_BASE_URL ?? '').toLowerCase()
  if (url.includes('localhost') || url.includes('ollama')) return 'ollama'
  if (url.includes('minimax')) return 'minimax'
  if (url.includes('openai')) return 'openai'

  // Default
  return 'ollama'
}

function resolveProviderConfig(provider: LLMProvider): ProviderSpec {
  switch (provider) {
    case 'ollama':
      return {
        provider: 'ollama',
        apiKey: process.env.OLLAMA_API_KEY ?? process.env.LLM_API_KEY ?? '',
        baseUrl: process.env.OLLAMA_BASE_URL ?? process.env.LLM_BASE_URL ?? 'https://ollama.com/v1',
        model: process.env.OLLAMA_MODEL ?? process.env.LLM_MODEL ?? 'gemma4:31b',
      }

    case 'minimax':
      return {
        provider: 'minimax',
        apiKey: process.env.MINIMAX_API_KEY ?? process.env.LLM_API_KEY ?? '',
        baseUrl: process.env.MINIMAX_BASE_URL ?? process.env.LLM_BASE_URL ?? 'https://api.minimax.io/v1',
        model: process.env.MINIMAX_MODEL ?? process.env.LLM_MODEL ?? 'MiniMax-M2.7',
      }

    case 'openai':
      return {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY ?? '',
        baseUrl: process.env.OPENAI_BASE_URL ?? process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL ?? process.env.LLM_MODEL ?? 'gpt-4o',
      }

    case 'custom':
      return {
        provider: 'custom',
        apiKey: process.env.LLM_API_KEY ?? '',
        baseUrl: process.env.LLM_BASE_URL ?? 'https://api.example.com/v1',
        model: process.env.LLM_MODEL ?? 'gpt-4o',
      }

    default:
      return {
        provider: 'ollama',
        apiKey: process.env.OLLAMA_API_KEY ?? '',
        baseUrl: 'https://api.ollama.com/v1',
        model: 'gemma4:31b',
      }
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export function resolveLLMConfig(): LLMConfig {
  const provider = detectProvider()
  const spec = resolveProviderConfig(provider)

  return {
    provider: spec.provider,
    apiKey: spec.apiKey,
    baseUrl: spec.baseUrl,
    model: spec.model,
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS ?? '') || DEFAULT_LLM_CONFIG.maxTokens,
    temperature: parseFloat(process.env.LLM_TEMPERATURE ?? '') || DEFAULT_LLM_CONFIG.temperature,
    timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS ?? '') || DEFAULT_LLM_CONFIG.timeoutMs,
  }
}

export function loadConfig(overrides?: Partial<AiConfig>): AiConfig {
  return {
    llm: { ...DEFAULT_LLM_CONFIG, ...overrides?.llm },
    selectors: { ...DEFAULT_SELECTOR_CONFIG, ...overrides?.selectors },
    context: { ...DEFAULT_CONTEXT_CONFIG, ...overrides?.context },
    debugging: { ...DEFAULT_DEBUG_CONFIG, ...overrides?.debugging },
  }
}

export function checkApiKey(): void {
  const config = resolveLLMConfig()
  if (!config.apiKey) {
    console.warn('[playwright-ai-step] WARNING: No API key set for provider "' + config.provider + '".')
    console.warn('  Set via LLM_PROVIDER env var and the corresponding *_API_KEY.')
    console.warn('  Example: LLM_PROVIDER=ollama OLLAMA_API_KEY=your_key')
  } else {
    console.log('[playwright-ai-step] LLM provider: ' + config.provider + ' | model: ' + config.model + ' | baseURL: ' + config.baseUrl)
  }
}

// ─── Provider switching helper (for tests) ────────────────────────────────

export function getActiveProvider(): { provider: LLMProvider; model: string; baseUrl: string } {
  const config = resolveLLMConfig()
  return { provider: config.provider, model: config.model, baseUrl: config.baseUrl }
}