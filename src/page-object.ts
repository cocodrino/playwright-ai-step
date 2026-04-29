// Page Object pattern — AI-powered page objects with typed methods

import type { Page } from '@playwright/test'
import { ai } from './ai.js'

/**
 * AiPageObject — base class for AI-powered page objects.
 * Subclass it and define typed methods that use ai() internally.
 */
export class AiPageObject {
  constructor(
    protected page: Page,
    protected options: { baseUrl?: string; selectorPrefix?: string } = {},
  ) {}

  /**
   * Run a natural language instruction against this page.
   */
  protected async step(instruction: string): Promise<void> {
    await ai(instruction, { page: this.page })
  }

  /**
   * Run a natural language assertion.
   */
  protected async check(instruction: string): Promise<boolean> {
    return await ai(instruction, { page: this.page, type: 'assert' }) as boolean
  }

  /**
   * Query the page for a value.
   */
  protected async query<T = string>(instruction: string): Promise<T> {
    return await ai(instruction, { page: this.page, type: 'query' }) as T
  }

  /**
   * Navigate to the base URL (if configured).
   */
  async open(path = '/'): Promise<void> {
    if (!this.options.baseUrl) throw new Error('baseUrl not configured for this page object')
    await this.page.goto(this.options.baseUrl + path)
  }

  /**
   * Wait for a selector to appear.
   */
  async waitFor(selector: string, timeoutMs = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout: timeoutMs })
  }
}

// ─── Helper: create a bound page object ─────────────────────────────────

export function bindPageObject<T extends AiPageObject>(
  cls: new (page: Page, options?: { baseUrl?: string }) => T,
  page: Page,
  options?: { baseUrl?: string },
): T {
  return new cls(page, options)
}

// ─── Example: LoginPage ─────────────────────────────────────────────────

export class LoginPage extends AiPageObject {
  async goto() {
    await this.step('go to the login page')
  }

  async login(username: string, password: string): Promise<void> {
    await this.step(`type "${username}" in the email or username field`)
    await this.step(`type "${password}" in the password field`)
    await this.step('click the sign in or submit button')
  }

  async assertLoggedIn(): Promise<boolean> {
    return await this.check('the user dashboard or welcome message is visible')
  }

  async assertErrorVisible(): Promise<boolean> {
    return await this.check('an error message is visible')
  }
}

export class FormPage extends AiPageObject {
  async fillField(label: string, value: string): Promise<void> {
    await this.step(`type "${value}" in the ${label} field`)
  }

  async submit(): Promise<void> {
    await this.step('click the submit button')
  }

  async assertSuccess(): Promise<boolean> {
    return await this.check('the success message is visible')
  }

  async getFieldValue(label: string): Promise<string> {
    return await this.query<string>(`query the value of the ${label} field`)
  }
}

// ─── Generic helpers for quick page objects ─────────────────────────────

/**
 * Create a simple page object with a fluent AI interface.
 * Usage:
 * ```typescript
 * const page = createAiPage(page)
 * await page.ai('click login')
 * await page.ai('fill form', { field: 'name', value: 'Carlos' })
 * ```
 */
export function createAiPage(page: Page) {
  return {
    page,
    async ai(instruction: string | string[]) {
      return await ai(instruction, { page })
    },
    async aiAssert(instruction: string): Promise<boolean> {
      return await ai(instruction, { page, type: 'assert' }) as boolean
    },
    async aiQuery<T = string>(instruction: string): Promise<T> {
      return await ai(instruction, { page, type: 'query' }) as T
    },
  }
}