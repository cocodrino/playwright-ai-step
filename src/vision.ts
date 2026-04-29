// Vision module — screenshot capture + visual context for LLM prompts

import type { Page } from '@playwright/test'
import type { DOMSnapshot } from './types.js'

export interface VisionConfig {
  enabled: boolean
  quality: 'low' | 'medium' | 'high'
  maxWidth: number
  maxHeight: number
}

const DEFAULT_VISION_CONFIG: VisionConfig = {
  enabled: false, // Off by default — saves cost
  quality: 'medium',
  maxWidth: 1280,
  maxHeight: 720,
}

export interface CapturedScreenshot {
  base64: string
  width: number
  height: number
  timestamp: number
}

// ─── Screenshot capture ─────────────────────────────────────────────────

export async function captureScreenshot(
  page: Page,
  config: Partial<VisionConfig> = {},
): Promise<CapturedScreenshot | null> {
  const cfg = { ...DEFAULT_VISION_CONFIG, ...config }
  if (!cfg.enabled) return null

  try {
    const buffer = await page.screenshot({
      type: cfg.quality === 'high' ? 'png' : 'jpeg',
      quality: cfg.quality === 'low' ? 30 : cfg.quality === 'high' ? undefined : 60,
    })
    // Use actual viewport dimensions, not the config limits
    const viewport = page.viewportSize()
    return {
      base64: buffer.toString('base64'),
      width: viewport?.width ?? cfg.maxWidth,
      height: viewport?.height ?? cfg.maxHeight,
      timestamp: Date.now(),
    }
  } catch {
    return null
  }
}

// ─── Visual context from DOM → text description for LLM ──────────────

export interface VisualElement {
  tag: string
  role: string
  text: string
  x: number  // center X as % of viewport
  y: number  // center Y as % of viewport
  w: number  // width as % of viewport
  h: number  // height as % of viewport
  visible: boolean
}

export function describeVisualPage(snapshot: DOMSnapshot, viewport = { width: 1280, height: 720 }): string {

  const elements: VisualElement[] = snapshot.elements
    .filter(el => el.isVisible && (el.textContent || el.placeholder || el.role !== 'paragraph'))
    .slice(0, 40) // limit to 40 elements for prompt size
    .map(el => {
      const box = el.boundingBox
      return {
        tag: el.tagName,
        role: el.role,
        text: (el.textContent || el.placeholder || '').slice(0, 50),
        x: box ? Math.round((box.x + box.width / 2) / viewport.width * 100) : 50,
        y: box ? Math.round((box.y + box.height / 2) / viewport.height * 100) : 50,
        w: box ? Math.round(box.width / viewport.width * 100) : 0,
        h: box ? Math.round(box.height / viewport.height * 100) : 0,
        visible: el.isVisible,
      }
    })

  if (elements.length === 0) {
    return '[No visible elements in page snapshot]'
  }

  const lines = [
    '[VISUAL PAGE LAYOUT — elements as % of viewport x/y/w/h]',
    ...elements.map(el =>
      `  [${el.x.toString().padStart(3)}%,${el.y.toString().padStart(3)}%] ` +
      `${el.w.toString().padStart(3)}%x${el.h.toString().padStart(3)}% ` +
      `${el.role || el.tag} "${el.text}"`
    ),
  ]

  return lines.join('\n')
}

// ─── Vision prompt builder ─────────────────────────────────────────────

export interface VisionPromptParts {
  visualContext: string
  screenshotAvailable: boolean
}

export async function buildVisionContext(
  page: Page,
  snapshot: DOMSnapshot,
  includeScreenshot: boolean,
): Promise<VisionPromptParts> {
  const screenshot = includeScreenshot ? await captureScreenshot(page, { enabled: true }) : null
  // Only compute visual layout when screenshots are enabled — saves tokens otherwise
  const viewport = page.viewportSize() ?? undefined
  const visualContext = includeScreenshot ? describeVisualPage(snapshot, viewport) : ''

  return {
    visualContext,
    screenshotAvailable: screenshot !== null,
  }
}

export function formatVisionMessage(vision: VisionPromptParts): string {
  return [
    '=== VISUAL PAGE CONTEXT ===',
    vision.visualContext,
    vision.screenshotAvailable ? '[Screenshot captured — available for vision models]' : '',
    '',
  ].filter(Boolean).join('\n')
}