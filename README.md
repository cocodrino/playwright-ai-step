# playwright-ai-step

[![npm version](https://badge.fury.io/js/playwright-ai-step.svg)](https://www.npmjs.com/package/playwright-ai-step)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **Write Playwright tests in plain English. Your LLM, your API keys.**

A TypeScript library that adds AI-powered natural language test steps to your Playwright tests.

```typescript
import { test } from 'playwright-ai-step'

test('user registration', async ({ page, ai }) => {
  await page.goto('/register')

  await ai('type "Carlos" in the name field', { page })
  await ai('type "carlos@example.com" in the email field', { page })
  await ai('click the submit button', { page })

  const success = await ai('is the success message visible?', { page, type: 'assert' })
  expect(success).toBe(true)
})
```

No external SaaS. No per-test pricing. Just your LLM and your API key.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Provider configuration](#provider-configuration)
- [API](#api)
- [Examples](#examples)
- [CLI](#cli)
- [How it works](#how-it-works)
- [Supported actions](#supported-actions)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Comparison](#comparison-with-other-tools)
- [License](#license)

---

## Features

- **Natural language selectors** — `ai('click the submit button')` instead of fragile CSS selectors
- **Multi-provider LLM** — Ollama Cloud, MiniMax, OpenAI, or any OpenAI-compatible endpoint
- **Semantic fallback chain** — role → text → testId → CSS, automatically
- **Action + Assert + Query + Extract** — clicks, assertions, data extraction, and structured JSON output
- **Shadow DOM support** — keyword fallback pierces shadow DOM when the LLM returns empty selectors
- **Self-healing** — automatic selector retry with improved prompts on failure
- **CI-ready** — works headlessly in GitHub Actions, Jenkins, etc.
- **No opaque SaaS** — you control which LLM is used and what it costs

---

## Installation

```bash
npm install playwright-ai-step
# or
bun add playwright-ai-step
```

Playwright is a peer dependency:

```bash
npx playwright install chromium
```

---

## Quick start

### 1. Configure your LLM provider

Create a `.env` file in your project root:

```bash
# Ollama Cloud (free tier available — recommended for getting started)
PAS_LLM_PROVIDER=ollama
PAS_OLLAMA_API_KEY=your_key_from_ollama.com/cloud
PAS_OLLAMA_MODEL=gemma4:31b

# OR MiniMax (higher quality, pay-per-token)
# PAS_LLM_PROVIDER=minimax
# PAS_MINIMAX_API_KEY=your_key_from_platform.minimax.io
# PAS_MINIMAX_MODEL=MiniMax-M2.7

# OR OpenAI
# PAS_LLM_PROVIDER=openai
# PAS_OPENAI_API_KEY=sk-...
# PAS_OPENAI_MODEL=gpt-4o

# OR local Ollama (no API key needed)
# PAS_LLM_PROVIDER=ollama
# PAS_OLLAMA_API_KEY=local
# PAS_OLLAMA_BASE_URL=http://localhost:11434/v1
# PAS_OLLAMA_MODEL=gemma4:31b
```

> `.env` is automatically loaded by the library. Make sure it is gitignored.

### 2. Write a test

```typescript
// tests/login.spec.ts
import { test } from 'playwright-ai-step'

test('user login flow', async ({ page, ai }) => {
  await page.goto('https://example.com/login')

  // AI picks the right selectors
  await ai('type "admin" in the username field', { page })
  await ai('type "secret123" in the password field', { page })
  await ai('click the login button', { page })

  // Assertions
  const loggedIn = await ai('is the dashboard heading visible?', { page, type: 'assert' })
  expect(loggedIn).toBe(true)
})
```

### 3. Run

```bash
# Unit tests (no LLM needed)
npm test

# Integration tests with a real LLM
npx playwright test
```

---

## Provider configuration

### Ollama Cloud (recommended — free tier)

```bash
export PAS_LLM_PROVIDER=ollama
export PAS_OLLAMA_API_KEY=your_key
export PAS_OLLAMA_BASE_URL=https://ollama.com/v1
export PAS_OLLAMA_MODEL=gemma4:31b
```

Available models: `gemma4:31b`, `minimax-m2.7`, `qwen3.5:397b`, `qwen3-coder:480b`, and 40,000+ more.

### MiniMax

```bash
export PAS_LLM_PROVIDER=minimax
export PAS_MINIMAX_API_KEY=your_key
export PAS_MINIMAX_BASE_URL=https://api.minimax.io/v1
export PAS_MINIMAX_MODEL=MiniMax-M2.7
```

### OpenAI

```bash
export PAS_LLM_PROVIDER=openai
export PAS_OPENAI_API_KEY=sk-...
export PAS_OPENAI_MODEL=gpt-4o
```

### Local Ollama

```bash
export PAS_LLM_PROVIDER=ollama
export PAS_OLLAMA_API_KEY=local
export PAS_OLLAMA_BASE_URL=http://localhost:11434/v1
export PAS_OLLAMA_MODEL=gemma4:31b
```

### Switching providers

No code changes needed. Just change the environment variables:

```bash
# Use Ollama
PAS_LLM_PROVIDER=ollama PAS_OLLAMA_API_KEY=... npx playwright test

# Use MiniMax
PAS_LLM_PROVIDER=minimax PAS_MINIMAX_API_KEY=... npx playwright test
```

---

## API

### `ai(instruction, options)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `instruction` | `string \| string[]` | Natural language instruction(s) |
| `options.page` | `Page` | Playwright Page object (required) |
| `options.type` | `'action' \| 'assert' \| 'query' \| 'extract'` | Default: `'action'` |
| `options.model` | `string` | Optional: override the model for this step |

Returns: `Promise<boolean \| string \| number \| object>` depending on `type`.

### `test` (Playwright fixture)

`playwright-ai-step` exports a pre-wrapped `test` that extends Playwright's built-in test with an `ai` fixture:

```typescript
import { test } from 'playwright-ai-step'

test('my test', async ({ page, ai }) => {
  await ai('click the button', { page })
})
```

You can still use all standard Playwright fixtures (`browser`, `context`, `page`, etc.).

---

## Examples

### 1. Actions (click, type, hover, select)

```typescript
await ai('click the submit button', { page })
await ai('type "hello" in the search box', { page })
await ai('hover over the user menu', { page })
await ai('select "Developer" from the job dropdown', { page })
await ai('scroll to the footer', { page })
await ai('wait for the modal to appear', { page })
```

### 2. Assertions

```typescript
const success = await ai('is the success message visible?', { page, type: 'assert' })
expect(success).toBe(true)

const hasError = await ai('is the error banner shown?', { page, type: 'assert' })
expect(hasError).toBe(false)
```

### 3. Queries

```typescript
const title = await ai('what is the page title?', { page, type: 'query' })
console.log(title) // "Dashboard · Example App"

const count = await ai('how many items are in the cart?', { page, type: 'query' })
console.log(count) // 3
```

### 4. Structured extraction (type: 'extract')

Extract typed JSON directly from the page:

```typescript
const product = await ai('extract product details as { name, price, rating }', {
  page,
  type: 'extract'
})

console.log(product)
// { name: "Wireless Mouse", price: 29.99, rating: 4.5 }
```

### 5. Multi-step workflows

Group related interactions for more reliable navigation:

```typescript
import { test } from 'playwright-ai-step'

test('complete e-commerce checkout', async ({ page, ai }) => {
  await page.goto('https://shop.example.com')

  // Search and add to cart
  await ai('type "wireless keyboard" in the search box', { page })
  await ai('click the search button', { page })
  await ai('click the first product', { page })
  await ai('click the add to cart button', { page })

  // Checkout
  await ai('click the cart icon', { page })
  await ai('click the checkout button', { page })
  await ai('type "John Doe" in the full name field', { page })
  await ai('type "john@example.com" in the email field', { page })
  await ai('click the place order button', { page })

  // Verify
  const confirmed = await ai('is the order confirmation shown?', { page, type: 'assert' })
  expect(confirmed).toBe(true)
})
```

---

## CLI

`playwright-ai-step` ships with a CLI (`playwright-ai-step`) for generating tests and sitemaps.

```bash
# Generate tests from a URL
npx playwright-ai-step generate --url https://example.com --output tests/

# Generate a sitemap
npx playwright-ai-step sitemap --url https://example.com --output sitemap.json
```

---

## How it works

```
test('my test')
  └─ ai('click the submit button', { page })
       ├─ serializePage(page)  ──→ DOM snapshot (roles, text, testIds, bounding boxes)
       ├─ callLLM(instruction, DOM)  ──→ LLMCommand { action, selector, confidence }
       ├─ resolveSelector(command)  ──→ Playwright Locator (role → text → testId → CSS)
       └─ locator.click()  ──→ Playwright action executed
```

**Self-healing on failure:**

If a selector fails (element not found, stale, or hidden), the library automatically:

1. Re-serializes the DOM
2. Calls the LLM again with a more specific prompt
3. Tries the next strategy in the fallback chain
4. Retries up to 3 times before failing

---

## Supported actions

| Type | Example | Return |
|------|---------|--------|
| `click` | `ai('click the submit button')` | `void` |
| `type` | `ai('type "hello" in the search box')` | `void` |
| `hover` | `ai('hover over the user menu')` | `void` |
| `select` | `ai('select "Developer" from the dropdown')` | `void` |
| `scroll` | `ai('scroll to the footer')` | `void` |
| `wait` | `ai('wait for the modal to appear')` | `void` |
| `assert` | `ai('is the success message visible?', { type: 'assert' })` | `boolean` |
| `query` | `ai('what is the page title?', { type: 'query' })` | `string \| number` |
| `extract` | `ai('extract as { name, price }', { type: 'extract' })` | `object` |

---

## Troubleshooting

### "No API key set"

Make sure you have set `PAS_OLLAMA_API_KEY`, `PAS_MINIMAX_API_KEY`, or `PAS_OPENAI_API_KEY` in your `.env` file or environment.

### "Selector not found" / flaky tests

1. Ensure the element is visible before the AI step
2. Add a `wait` step before interacting: `await ai('wait for the table to load', { page })`
3. Use more specific language: `"click the blue submit button in the form"` instead of `"click submit"`

### Slow tests

- Reduce `PAS_LLM_MAX_TOKENS` (default: 512)
- Use a faster model for simpler tasks
- Run tests in parallel with Playwright's built-in parallelism

### Costs with MiniMax / OpenAI

Set `PAS_LLM_TEMPERATURE=0.1` (default) to keep responses deterministic and reduce token waste.

---

## Development

```bash
# Install dependencies
bun install

# Type check
bun run typecheck

# Run unit tests (no LLM required)
bun test

# Run integration tests (requires API keys)
PAS_OLLAMA_API_KEY=... bunx playwright test tests/integration.test.ts

# Build for distribution
bun run build
```

---

## Comparison with other tools

| Feature | playwright-ai-step | ZeroStep | Magicpod |
|---------|-------------------|----------|----------|
| LLM provider | **Your choice** (Ollama, MiniMax, OpenAI) | Closed SaaS | Closed SaaS |
| Cost | **Pay your LLM only** | Per-test pricing | Per-test pricing |
| Setup | **3 lines** | Account + API key registration | Account + setup |
| Shadow DOM | ✅ Yes | ❌ No | ❌ No |
| Self-healing | ✅ Retry chain | Basic retry | Basic retry |
| Open source | ✅ Apache 2.0 | ❌ Closed | ❌ Closed |

---

## Community

### Who's using this?

Are you using `playwright-ai-step` in production? We'd love to hear about it!

🌟 **[Let us know by opening an issue](https://github.com/cocodrino/playwright-ai-step/issues/new?template=whos-using-this.md)** — it helps others discover the project and motivates ongoing development. No pressure, just a friendly ask.

---

## License

[Apache 2.0](LICENSE)
