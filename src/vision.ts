// Vision module — screenshot capture for complex selector resolution

import type { Page } from '@playwright/test'

export interface VisionConfig {
  enabled: boolean
  quality: 'low' | 'medium' | 'high' // affects screenshot resolution
  maxWidth: number
  maxHeight: number
}

const DEFAULT_VISION_CONFIG: VisionConfig = {
  enabled: false, // Off by default — Phase 3 optional feature
  quality: 'medium',
  maxWidth: 1280,
  maxHeight: 720,
}

export interface VisionInput {
  instruction: string
  snapshot: {
    url: string
    title: string
    elementCount: number
    sampleElements: string // abbreviated DOM for prompt
  }
  screenshotBase64: string | null
}

export async function captureScreenshot(
  page: Page,
  config: Partial<VisionConfig> = {},
): Promise<string | null> {
  const cfg = { ...DEFAULT_VISION_CONFIG, ...config }
  if (!cfg.enabled) return null

  try {
    // Screenshots in Playwright are simple
    const buffer = await page.screenshot({
      type: cfg.quality === 'high' ? 'png' : 'jpeg',
      quality: cfg.quality === 'high' ? undefined : cfg.quality === 'low' ? 30 : 60,
    })
    return buffer.toString('base64')
  } catch {
    return null
  }
}

export async function buildVisionPrompt(
  page: Page,
  instruction: string,
  snapshotElements: string,
  config: VisionConfig = DEFAULT_VISION_CONFIG,
): Promise<VisionInput> {
  const screenshot = await captureScreenshot(page, config)

  return {
    instruction,
    snapshot: {
      url: await page.url(),
      title: await page.title(),
      elementCount: 0, // not used in simple prompts
      sampleElements: snapshotElements.slice(0, 2000), // limit prompt size
    },
    screenshotBase64: screenshot,
  }
}

export function formatVisionMessage(vision: VisionInput): string {
  // Build a text description for the LLM when screenshot is used
  // (screenshot is sent as base64 in real implementation)
  const lines = [
    `URL: ${vision.snapshot.url}`,
    `Title: ${vision.snapshot.title}`,
    `Page elements: ${vision.snapshot.sampleElements}`,
    `Instruction: ${vision.instruction}`,
    vision.screenshotBase64
      ? '[Screenshot available — used for visual matching]'
      : '[No screenshot available]',
  ]
  return lines.join('\n')
}