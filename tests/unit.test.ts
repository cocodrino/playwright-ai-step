// Unit tests — run with `bun test`

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serializePage } from '../src/dom-serializer'
import type { Page } from '@playwright/test'

// ─── Mock Page for DOM serializer tests ────────────────────────────────

function makeMockPage(domElements: object[]): Page {
  return {
    evaluate: vi.fn().mockResolvedValue(domElements),
  } as unknown as Page
}

// ─── DOM Serializer Tests ─────────────────────────────────────────────

describe('DOM Serializer', () => {
  it('returns url, title, elements, timestamp from page', async () => {
    const mockDom = [
      {
        tagName: 'button',
        role: 'button',
        textContent: 'Submit',
        placeholder: '',
        ariaLabel: '',
        id: 'submit-btn',
        className: 'btn primary',
        attributes: { id: 'submit-btn', class: 'btn primary', 'data-testid': 'submit' },
        box: { x: 10, y: 20, width: 100, height: 40 },
        visible: true,
      },
      {
        tagName: 'input',
        role: 'textbox',
        textContent: '',
        placeholder: 'Enter name',
        ariaLabel: 'Name field',
        id: 'name-input',
        className: 'input-field',
        attributes: { id: 'name-input', placeholder: 'Enter name', 'data-testid': 'name-input' },
        box: { x: 10, y: 70, width: 200, height: 30 },
        visible: true,
      },
    ]

    const page = makeMockPage(['https://example.com', 'Example', mockDom])
    const result = await serializePage(page)

    expect(result.url).toBe('https://example.com')
    expect(result.title).toBe('Example')
    expect(result.elements).toHaveLength(2)
    expect(result.timestamp).toBeDefined()
    expect(result.elements[0].role).toBe('button')
    expect(result.elements[0].dataTestId).toBe('submit')
    expect(result.elements[1].placeholder).toBe('Enter name')
  })

  it('filters out invisible elements', async () => {
    const mockDom = [
      {
        tagName: 'div', role: '', textContent: 'visible',
        placeholder: '', ariaLabel: '', id: 'v', className: '',
        attributes: {}, box: { x: 0, y: 0, width: 100, height: 10 }, visible: true,
      },
      {
        tagName: 'div', role: '', textContent: 'hidden',
        placeholder: '', ariaLabel: '', id: 'h', className: '',
        attributes: {}, box: { x: 0, y: 0, width: 100, height: 10 }, visible: false,
      },
    ]

    const page = makeMockPage(['https://x.com', 'X', mockDom])
    const result = await serializePage(page)

    expect(result.elements).toHaveLength(1)
    expect(result.elements[0].textContent).toBe('visible')
  })

  it('truncates long text content', async () => {
    const longText = 'A'.repeat(500)
    const mockDom = [{
      tagName: 'p', role: '', textContent: longText,
      placeholder: '', ariaLabel: '', id: 'p1', className: '',
      attributes: {}, box: { x: 0, y: 0, width: 200, height: 20 }, visible: true,
    }]

    const page = makeMockPage(['https://x.com', 'X', mockDom])
    const result = await serializePage(page)

    expect(result.elements[0].textContent!.length).toBeLessThan(250)
    expect(result.elements[0].textContent!.endsWith('…')).toBe(true)
  })
})

// ─── LLM Client Tests ──────────────────────────────────────────────────

describe('LLM Client', () => {
  // These tests mock the API — real calls go to MiniMax

  it('parseResponse handles clean JSON', async () => {
    const { parseResponse } = await import('../src/llm-client')

    const raw = JSON.stringify({
      action: 'click',
      role: 'button',
      text: 'Submit',
      reasoning: 'Button found',
      confidence: 0.9,
    })
    const cmd = parseResponse(raw)

    expect(cmd.action).toBe('click')
    expect(cmd.role).toBe('button')
    expect(cmd.confidence).toBe(0.9)
  })

  it('parseResponse handles markdown code fences', async () => {
    const { parseResponse } = await import('../src/llm-client')

    const raw = '```json\n{"action":"type","value":"hello","reasoning":"ok","confidence":0.8}\n```'
    const cmd = parseResponse(raw)

    expect(cmd.action).toBe('type')
    expect(cmd.value).toBe('hello')
  })

  it('parseResponse handles malformed JSON as fail', async () => {
    const { parseResponse } = await import('../src/llm-client')

    const cmd = parseResponse('not json at all')

    expect(cmd.action).toBe('fail')
    expect(cmd.confidence).toBe(0)
  })

  it('parseResponse handles missing action defaults to fail', async () => {
    const { parseResponse } = await import('../src/llm-client')

    const cmd = parseResponse('{"foo":"bar"}')

    expect(cmd.action).toBe('fail')
  })
})

// ─── Selector Resolver Tests ───────────────────────────────────────────

describe('Selector Resolver', () => {
  it('buildSelectorError produces readable message', async () => {
    const { buildSelectorError } = await import('../src/selector-resolver')

    const error = buildSelectorError({
      action: 'click',
      reasoning: 'No matching element found',
      confidence: 0.3,
    }, {
      url: 'https://example.com',
      title: 'Example',
      elements: [],
      timestamp: Date.now(),
    })

    expect(error).toContain('ai() failed to resolve selector')
    expect(error).toContain('confidence: 0.3')
    expect(error).toContain('Tried:')
  })
})