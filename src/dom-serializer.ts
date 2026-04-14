// DOM Serializer — captures Playwright page state as a structured snapshot

import type { Page } from '@playwright/test'
import type { DOMSnapshot, ElementDescriptor } from './types'

const MAX_TEXT_LENGTH = 200

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

const ALLOWED_ATTRS = [
  'aria-label', 'aria-labelledby', 'aria-describedby',
  'data-testid', 'data-cy', 'data-test',
  'name', 'type', 'value', 'placeholder', 'for',
  'href', 'src', 'alt', 'title', 'id', 'class',
]

function sanitizeAttrs(raw: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of ALLOWED_ATTRS) {
    if (raw[key] !== undefined) out[key] = raw[key]
  }
  return out
}

async function serializePage(page: Page): Promise<DOMSnapshot> {
  // All constants must be defined inside page.evaluate so they're in browser context
  const result = await page.evaluate(() => {
    const MAX_ELEMENTS = 100
    const MAX_DEPTH = 10

    function walk(el: Element, depth: number, seen: Set<Element>, out: Element[]) {
      if (out.length >= MAX_ELEMENTS) return
      if (depth > MAX_DEPTH) return
      if (seen.has(el)) return
      seen.add(el)
      out.push(el)
      for (let i = 0; i < el.children.length; i++) {
        walk(el.children[i] as Element, depth + 1, seen, out)
      }
    }

    const seen = new Set<Element>()
    const elements: Element[] = []
    walk(document.body, 0, seen, elements)

    return elements.map(el => {
      const computed = window.getComputedStyle(el)
      const visible =
        computed.display !== 'none' &&
        computed.visibility !== 'hidden' &&
        parseFloat(computed.opacity) > 0

      let role = el.getAttribute('role') ?? ''
      if (!role) {
        const tag = el.tagName.toLowerCase()
        if (['button', 'a', 'input', 'select', 'textarea'].includes(tag)) role = tag
        else if (tag === 'p') role = 'paragraph'
        else if (['h1','h2','h3','h4','h5','h6'].includes(tag)) role = 'heading'
      }

      const rawAttrs: Record<string, string> = {}
      for (let i = 0; i < el.attributes.length; i++) {
        const a = el.attributes[i]
        rawAttrs[a.name] = a.value
      }

      const box = el.getBoundingClientRect()

      return {
        tagName: el.tagName.toLowerCase(),
        role: role || el.tagName.toLowerCase(),
        textContent: el.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        placeholder: (el as HTMLInputElement).placeholder ?? '',
        ariaLabel: el.getAttribute('aria-label') ?? '',
        id: el.id,
        className: el.className,
        attributes: rawAttrs,
        box,
        visible,
      }
    })
  })

  const descriptors: ElementDescriptor[] = result
    .filter((el: { box: DOMRect; visible: boolean }) => el.visible && el.box.width >= 2 && el.box.height >= 2)
    .map((el: { tagName: string; role: string; textContent: string; placeholder: string; ariaLabel: string; id: string; className: string; attributes: Record<string, string>; box: DOMRect; visible: boolean }) => {
      const dataTestId =
        el.attributes['data-testid'] ??
        el.attributes['data-cy'] ??
        el.attributes['data-test'] ??
        undefined

      return {
        role: el.role,
        tagName: el.tagName,
        id: el.id || undefined,
        classes: el.className ? el.className.split(' ').filter(Boolean) : undefined,
        textContent: truncate(el.textContent, MAX_TEXT_LENGTH),
        placeholder: truncate(el.placeholder, MAX_TEXT_LENGTH),
        ariaLabel: truncate(el.ariaLabel, MAX_TEXT_LENGTH),
        attributes: sanitizeAttrs(el.attributes),
        isVisible: el.visible,
        boundingBox: { x: el.box.x, y: el.box.y, width: el.box.width, height: el.box.height },
        dataTestId,
        children: [],
      }
    })

  const url = await page.url()
  const title = await page.title()

  return { url, title, elements: descriptors, timestamp: Date.now() }
}

export { serializePage }