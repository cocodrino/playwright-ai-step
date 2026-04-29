// Core types for playwright-ai-step

import type { Page, TestInfo } from '@playwright/test'

// ─── LLM Command (what the LLM returns) ──────────────────────────────────

export interface LLMCommand {
  action: 'click' | 'type' | 'hover' | 'select' | 'scroll' | 'wait' | 'assert' | 'query' | 'extract' | 'fail'
  selector?: string
  value?: string
  role?: string
  text?: string
  name?: string
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

export interface LinkDescriptor {
  href: string
  text: string
  label: string
}

export interface DOMSnapshot {
  url: string
  title: string
  elements: ElementDescriptor[]
  links: LinkDescriptor[]
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
  fallbackStrategies: ('role' | 'field' | 'text' | 'testId' | 'css')[]
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
  /**
   * Optional post-condition contract.
   * If provided, ai() validates expected UI state after executing an action.
   */
  expect?: {
    /** text expected to become visible */
    visibleText?: string
    /** CSS selector expected to be visible */
    visibleSelector?: string
    /** URL expected after action */
    url?: string | RegExp
    /** max wait time for expectation checks */
    timeoutMs?: number
  }
}

// ─── Fixture types ─────────────────────────────────────────────────────

export interface AiFixture {
  ai: (instruction: string | string[], options?: Partial<AiOptions>) => ReturnType<typeof import('./ai.js').ai>
}

// ─── Default config ────────────────────────────────────────────────────
// Static constants only — no process.env reads at module load time.
// Runtime config is resolved by resolveLLMConfig() in config.ts.

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'ollama',
  apiKey: '',
  baseUrl: 'https://ollama.com/v1',
  model: 'gemma4:31b',
  maxTokens: 512,
  temperature: 0.1,
  timeoutMs: 30_000,
}

export const DEFAULT_SELECTOR_CONFIG: SelectorConfig = {
  preferSemantic: true,
  fallbackStrategies: ['role', 'field', 'text', 'testId', 'css'],
  maxRetries: 2,
}

export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  includeScreenshot: false,
  screenshotQuality: 'medium',
  maxDomDepth: 10,
  maxElements: 100,
}

export const DEFAULT_DEBUG_CONFIG: DebugConfig = {
  verbose: process.env.DEBUG === 'playwright-ai-step',
  saveScreenshots: process.env.DEBUG === 'playwright-ai-step',
}
