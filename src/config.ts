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

// ─── PAS_ prefixed env vars (all PAS_LLM_* variables) ─────────────────────
//
//PAS_LLM_PROVIDER=ollama           → provider selection
//PAS_LLM_API_KEY=...              → fallback API key
//PAS_LLM_BASE_URL=https://...     → fallback base URL
//PAS_LLM_MODEL=gemma4:31b        → fallback model
//PAS_LLM_MAX_TOKENS=512           → max tokens in response
//PAS_LLM_TEMPERATURE=0.1          → temperature
//PAS_LLM_TIMEOUT_MS=30000         → request timeout
//
//Provider-specific overrides (take priority over PAS_LLM_*):
//  Ollama:   PAS_OLLAMA_API_KEY, PAS_OLLAMA_BASE_URL, PAS_OLLAMA_MODEL
//  MiniMax:  PAS_MINIMAX_API_KEY, PAS_MINIMAX_BASE_URL, PAS_MINIMAX_MODEL
//  OpenAI:   PAS_OPENAI_API_KEY, PAS_OPENAI_BASE_URL, PAS_OPENAI_MODEL

// ─── Provider configs ─────────────────────────────────────────────────────

interface ProviderSpec {
  provider: LLMProvider
  apiKey: string
  baseUrl: string
  model: string
}

function getEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}

function detectProvider(): LLMProvider {
  const explicit = getEnv('PAS_LLM_PROVIDER')
  if (explicit) return explicit as LLMProvider

  // Auto-detect from baseUrl
  const url = getEnv('PAS_LLM_BASE_URL').toLowerCase()
  if (url.includes('localhost') || url.includes('ollama')) return 'ollama'
  if (url.includes('minimax')) return 'minimax'
  if (url.includes('openai')) return 'openai'

  return 'ollama'
}

function resolveProviderConfig(provider: LLMProvider): ProviderSpec {
  const pas = (suffix: string) => `PAS_LLM_${suffix}`
  const pasProvider = (p: string, suffix: string) => `PAS_${p.toUpperCase()}_${suffix}`

  const pasApiKey = getEnv(pas('API_KEY'))
  const pasBaseUrl = getEnv(pas('BASE_URL'))
  const pasModel = getEnv(pas('MODEL'))

  switch (provider) {
    case 'ollama':
      return {
        provider: 'ollama',
        apiKey: getEnv(pasProvider('ollama', 'API_KEY')) || getEnv('PAS_OLLAMA_API_KEY') || pasApiKey || '',
        baseUrl: getEnv('PAS_OLLAMA_BASE_URL') || getEnv('OLLAMA_BASE_URL') || pasBaseUrl || 'https://ollama.com/v1',
        model: getEnv('PAS_OLLAMA_MODEL') || getEnv('OLLAMA_MODEL') || pasModel || 'gemma4:31b',
      }
    case 'minimax':
      return {
        provider: 'minimax',
        apiKey: getEnv(pasProvider('minimax', 'API_KEY')) || getEnv('PAS_MINIMAX_API_KEY') || getEnv('MINIMAX_API_KEY') || pasApiKey || '',
        baseUrl: getEnv('PAS_MINIMAX_BASE_URL') || getEnv('MINIMAX_BASE_URL') || pasBaseUrl || 'https://api.minimax.io/v1',
        model: getEnv('PAS_MINIMAX_MODEL') || getEnv('MINIMAX_MODEL') || pasModel || 'MiniMax-M2.7',
      }
    case 'openai':
      return {
        provider: 'openai',
        apiKey: getEnv(pasProvider('openai', 'API_KEY')) || getEnv('PAS_OPENAI_API_KEY') || getEnv('OPENAI_API_KEY') || pasApiKey || '',
        baseUrl: getEnv('PAS_OPENAI_BASE_URL') || getEnv('OPENAI_BASE_URL') || pasBaseUrl || 'https://api.openai.com/v1',
        model: getEnv('PAS_OPENAI_MODEL') || getEnv('OPENAI_MODEL') || pasModel || 'gpt-4o',
      }
    case 'custom':
      return {
        provider: 'custom',
        apiKey: pasApiKey || '',
        baseUrl: pasBaseUrl || 'https://api.example.com/v1',
        model: pasModel || 'gpt-4o',
      }
    default:
      return {
        provider: 'ollama',
        apiKey: getEnv('PAS_OLLAMA_API_KEY') || getEnv('OLLAMA_API_KEY') || '',
        baseUrl: 'https://ollama.com/v1',
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
    maxTokens: parseInt(getEnv('PAS_LLM_MAX_TOKENS') || getEnv('LLM_MAX_TOKENS') || '') || DEFAULT_LLM_CONFIG.maxTokens,
    temperature: parseFloat(getEnv('PAS_LLM_TEMPERATURE') || getEnv('LLM_TEMPERATURE') || '') || DEFAULT_LLM_CONFIG.temperature,
    timeoutMs: parseInt(getEnv('PAS_LLM_TIMEOUT_MS') || getEnv('LLM_TIMEOUT_MS') || '') || DEFAULT_LLM_CONFIG.timeoutMs,
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
    console.warn('[playwright-ai-step] WARNING: No API key set. Set PAS_OLLAMA_API_KEY or PAS_MINIMAX_API_KEY in .env')
  } else {
    console.log('[playwright-ai-step] LLM: ' + config.provider + ' | ' + config.model + ' | ' + config.baseUrl)
  }
}

export function getActiveProvider(): { provider: LLMProvider; model: string; baseUrl: string } {
  const config = resolveLLMConfig()
  return { provider: config.provider, model: config.model, baseUrl: config.baseUrl }
}