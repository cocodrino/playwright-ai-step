// Integration tests — real LLM calls with Playwright
// These tests are SKIPPED in vitest context (use bunx playwright to run them)

import { test as pwTest, expect } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { ai } from '../src/index'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Guard: skip all tests when not using @playwright/test runner
// These run only via: LLM_API_KEY=... bunx playwright test
const IS_PLAYWRIGHT = process.env.OLLAMA_API_KEY
const test = IS_PLAYWRIGHT ? pwTest : (pwTest as any).skip

async function openForm(page: import('@playwright/test').Page) {
  const filePath = resolve(__dirname, 'pages/example-form.html')
  await page.goto('file://' + filePath)
  await page.waitForLoadState('domcontentloaded')
}

// ─── Ollama Cloud (gemma4:31b) integration tests ─────────────────────────

test('OLLAMA: click submit button by role', async ({ page }) => {
  await openForm(page)
  await ai('click the submit button', { page })

  const success = page.locator('[data-testid="success-message"]')
  await expect(success).toBeVisible()
})

test('OLLAMA: type in name field', async ({ page }) => {
  await openForm(page)

  await ai('type "Carlos Perez" in the name field', { page })
  const input = page.locator('[data-testid="name-input"]')
  await expect(input).toHaveValue('Carlos Perez')
})

test('OLLAMA: select Developer from dropdown', async ({ page }) => {
  await openForm(page)

  await ai('select "Developer" from the account type dropdown', { page })
  const select = page.locator('[data-testid="role-select"]')
  await expect(select).toHaveValue('developer')
})

test('OLLAMA: assert heading is visible', async ({ page }) => {
  await openForm(page)

  const result = await ai('assert the heading "User Registration" is visible', { page, type: 'assert' })
  expect(result).toBe(true)
})

test('OLLAMA: query page title text', async ({ page }) => {
  await openForm(page)

  const title = await ai('query the page title text', { page, type: 'query' }) as string
  expect(title).toContain('User Registration')
})