// playwright-ai-step — main export

export { ai, aiNavigate } from './ai'
export { test } from './fixtures'
export { resolveLLMConfig, loadConfig, checkApiKey } from './config'
export { AiRecorder, runRecorderCLI } from './recorder'
export { AiPageObject, LoginPage, FormPage, bindPageObject, createAiPage } from './page-object'
export { captureScreenshot, buildVisionContext } from './vision'
export type {
  AiOptions,
  AiConfig,
  AiFixture,
  LLMCommand,
  LLMConfig,
  DOMSnapshot,
  ElementDescriptor,
  InstructionType,
} from './types'
export type { PageStep, AiNavigateResult } from './ai'
export type { VisionConfig, CapturedScreenshot, VisionPromptParts } from './vision'