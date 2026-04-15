// Core types for playwright-ai-step

import type { Page, TestInfo } from '@playwright/test'

// ─── LLM Command (what the LLM returns) ──────────────────────────────────

export interface LLMCommand {
  action: 'click' | 'type' | 'hover' | 'select' | 'scroll' | 'wait' | 'assert' | 'query' | 'extract' | 'fail'
  selector?: string
  value?: string
  role?: string
  text?: string
  testId?: string
  assertion?: {
    type: 'visible' | 'text' | 'count' | 'attribute'
    expected: string | number
    attribute?: string
    elementSelector?: string
  }
  query?: {
    selectors: string[]
    extraction: 'text' | 'attribute' | 'count' | 'title'
    attribute?: string
  }
  reasoning: string
  confidence: number // 0.0–1.0
  reason?: string // for 'fail' action
  extractedData?: unknown // for 'extract' type
}

// ─── DOM Serialization ─────────────────────────────────────────────────

export interface BoundingBox {
  x: number; y: number; width: number; height: number
}

export interface ElementDescriptor {
  role: string
  tagName: string
  id?: string
  classes?: string[]
  textContent?: string
  placeholder?: string
  ariaLabel?: string
  attributes: Record<string, string>
  isVisible: boolean
  boundingBox?: BoundingBox
  dataTestId?: string
  children: ElementDescriptor[]
}

export interface DOMSnapshot {
  url: string
  title: string
  elements: ElementDescriptor[]
  timestamp: number
}

// ─── Config ────────────────────────────────────────────────────────────

export type LLMProvider = 'minimax' | 'ollama' | 'openai' | 'custom'

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
  timeoutMs: number
}

export interface SelectorConfig {
  preferSemantic: boolean
  fallbackStrategies: ('role' | 'text' | 'testId' | 'css')[]
  maxRetries: number
}

export interface ContextConfig {
  includeScreenshot: boolean
  screenshotQuality: 'low' | 'medium' | 'high'
  maxDomDepth: number
  maxElements: number
}

export interface DebugConfig {
  verbose: boolean
  saveScreenshots: boolean
}

export interface AiConfig {
  llm: Partial<LLMConfig>
  selectors: Partial<SelectorConfig>
  context: Partial<ContextConfig>
  debugging: Partial<DebugConfig>
}

// ─── ai() options ──────────────────────────────────────────────────────

export type InstructionType = 'action' | 'assert' | 'query' | 'extract'

export interface AiOptions {
  page: Page
  test?: TestInfo
  type?: InstructionType
  model?: string
  /** JSON schema for type:'extract' — describes the data to extract */
  schema?: Record<string, unknown>
}

// ─── Fixture types ─────────────────────────────────────────────────────

export interface AiFixture {
  ai: (instruction: string | string[], options?: Partial<AiOptions>) => Promise<boolean | string | number>
}

// ─── Default config ────────────────────────────────────────────────────

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'minimax',
  apiKey: process.env.LLM_API_KEY ?? '',
  baseUrl: process.env.LLM_BASE_URL ?? 'https://api.minimax.io/v1',
  model: process.env.LLM_MODEL ?? 'MiniMax-M2.7',
  maxTokens: 512,
  temperature: 0.1,
  timeoutMs: 30_000,
}

export const DEFAULT_SELECTOR_CONFIG: SelectorConfig = {
  preferSemantic: true,
  fallbackStrategies: ['role', 'text', 'testId', 'css'],
  maxRetries: 2,
}

export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  includeScreenshot: false, // Phase 1: DOM only, no vision
  screenshotQuality: 'medium',
  maxDomDepth: 10,
  maxElements: 100,
}

export const DEFAULT_DEBUG_CONFIG: DebugConfig = {
  verbose: process.env.DEBUG === 'playwright-ai-step',
  saveScreenshots: process.env.DEBUG === 'playwright-ai-step',
}