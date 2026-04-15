# playwright-ai-step

> Write Playwright tests in plain English. Your LLM, your API keys.

**Status:** Phase 2 (Integration Testing) — In Progress  
**Provider:** [Ollama Cloud](https://ollama.com/cloud) · [MiniMax](https://platform.minimax.io) · OpenAI · Any OpenAI-compatible endpoint

---

## What is this?

A TypeScript library that adds AI-powered natural language test steps to your Playwright tests. Instead of writing `await page.click('#submit')`, you write `await ai('click the submit button', { page })`. It uses *your own* LLM API key — no external SaaS dependency, no per-test pricing.

```typescript
import { test, ai } from 'playwright-ai-step'

test('user registration flow', async ({ page }) => {
  await page.goto('/register')
  
  // Natural language — the LLM picks the right selector
  await ai('type "Carlos" in the name field', { page })
  await ai('type "carlos@example.com" in the email field', { page })
  await ai('click the submit button', { page })
  
  // Assertions
  const success = await ai('assert the success message is visible', { page, type: 'assert' })
  expect(success).toBe(true)
})
```

## Features

- **3-line setup** — install, set env vars, import
- **Multi-provider** — Ollama Cloud, MiniMax, OpenAI, or any OpenAI-compatible API
- **Semantic selector fallback** — tries role → text → testId → CSS automatically
- **Action + Assert + Query** — `ai()` does clicks, assertions, and data extraction
- **@playwright/test fixture** — `test` is pre-wrapped with `ai` available in every test
- **Works in CI** — GitHub Actions workflow included
- **No opaque SaaS** — you control which LLM is used and what it costs

## Quickstart

### 1. Install

```bash
npm install playwright-ai-step
# or
bun add playwright-ai-step
```

### 2. Configure your LLM provider

```bash
# Ollama Cloud (gemma4:31b — recommended for free tier)
PAS_LLM_PROVIDER=ollama
PAS_OLLAMA_API_KEY=your_ollama_cloud_key
PAS_OLLAMA_MODEL=gemma4:31b

# OR MiniMax (MiniMax-M2.7 — higher quality, pay-per-token)
PAS_LLM_PROVIDER=minimax
PAS_MINIMAX_API_KEY=your_minimax_key
PAS_MINIMAX_MODEL=MiniMax-M2.7
```

### 3. Write your first test

```typescript
// tests/example.spec.ts
import { test } from 'playwright-ai-step'

test('basic form interaction', async ({ page, ai }) => {
  await page.goto('https://example.com')
  
  await ai('click the first link', { page })
  await ai('type "hello" in the search box', { page })
  await ai('click the search button', { page })
  
  const visible = await ai('assert the results are visible', { page, type: 'assert' })
  expect(visible).toBe(true)
})
```

### 4. Run

```bash
# Start Playwright (first time only)
npx playwright install chromium

# Run tests
bun test
# or
npm test
```

## Provider Configuration

### Ollama Cloud (Recommended — free tier available)

```bash
export PAS_LLM_PROVIDER=ollama
export PAS_OLLAMA_API_KEY=your_key_from_ollama.com/cloud
export PAS_OLLAMA_BASE_URL=https://ollama.com/v1
export PAS_OLLAMA_MODEL=gemma4:31b
```

Models available: `gemma4:31b`, `minimax-m2.7`, `qwen3.5:397b`, `qwen3-coder:480b`, and 40,000+ more.

### MiniMax

```bash
export PAS_LLM_PROVIDER=minimax
export PAS_MINIMAX_API_KEY=your_key_from_platform.minimax.io
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
export PAS_OLLAMA_API_KEY=not-required
export PAS_OLLAMA_BASE_URL=http://localhost:11434/v1
export PAS_OLLAMA_MODEL=gemma4:31b
```

### Switching providers

The only thing that changes is the environment variables. No code changes needed:

```bash
# Use Ollama
PAS_LLM_PROVIDER=ollama PAS_OLLAMA_API_KEY=... bun test

# Use MiniMax
PAS_LLM_PROVIDER=minimax PAS_MINIMAX_API_KEY=... bun test
```

## Environment Variables

All configuration is through `PAS_LLM_*` environment variables.

| Variable | Default | Description |
|---|---|---|
| `PAS_LLM_PROVIDER` | `ollama` | Provider: `ollama`, `minimax`, `openai`, `custom` |
| `PAS_LLM_API_KEY` | — | Fallback API key (used if provider-specific key not set) |
| `PAS_LLM_BASE_URL` | `https://ollama.com/v1` | Base URL for the LLM API |
| `PAS_LLM_MODEL` | `gemma4:31b` | Model name |
| `PAS_LLM_MAX_TOKENS` | `512` | Max tokens in LLM response |
| `PAS_LLM_TEMPERATURE` | `0.1` | LLM temperature (lower = more deterministic) |
| `PAS_LLM_TIMEOUT_MS` | `30000` | Request timeout in milliseconds |

Provider-specific overrides (take priority over `PAS_LLM_*`):

| Variable | Provider |
|---|---|
| `PAS_OLLAMA_API_KEY`, `PAS_OLLAMA_BASE_URL`, `PAS_OLLAMA_MODEL` | Ollama |
| `PAS_MINIMAX_API_KEY`, `PAS_MINIMAX_BASE_URL`, `PAS_MINIMAX_MODEL` | MiniMax |
| `PAS_OPENAI_API_KEY`, `PAS_OPENAI_BASE_URL`, `PAS_OPENAI_MODEL` | OpenAI |

## API

### `ai(instruction, options)`

**instruction:** `string | string[]` — Natural language instruction(s)  
**options:** `{ page, type?, model? }`

```typescript
import { ai } from 'playwright-ai-step'

// Action (click/type/hover/select)
await ai('click the submit button', { page })

// Assertion (returns boolean)
const ok = await ai('assert the success message is visible', { page, type: 'assert' })

// Query (returns extracted data)
const title = await ai('query the page title', { page, type: 'query' })
```

### `test` (Playwright fixture)

```typescript
import { test } from 'playwright-ai-step'

test('my test', async ({ page, ai }) => {
  await ai('click the button', { page })
})
```

## Architecture

```
test('my test')
  └─ ai('click submit', { page })
       ├─ serializePage(page)         → DOM snapshot (role, text, testid, boundingBox)
       ├─ callLLM(instruction, DOM)   → LLMCommand { action, selector, confidence }
       ├─ resolveSelector(command)    → Playwright Locator (role → text → testId → CSS)
       └─ locator.click()              → Playwright action executed
```

## Supported Actions

| Action | Example |
|---|---|
| `click` | `ai('click the submit button')` |
| `type` | `ai('type "Carlos" in the name field')` |
| `hover` | `ai('hover over the user menu')` |
| `select` | `ai('select "Developer" from the dropdown')` |
| `scroll` | `ai('scroll to the footer')` |
| `wait` | `ai('wait for the modal to appear')` |
| `assert` | `ai('assert the error message is visible', { type: 'assert' })` → `boolean` |
| `query` | `ai('query the user name text', { type: 'query' })` → `string \| number` |

## Development

```bash
# Install dependencies
bun install

# Type check
bun run typecheck

# Run unit tests (no LLM needed)
bun test

# Run with real LLM (requires API keys in .env)
PAS_OLLAMA_API_KEY=... bun test tests/integration.test.ts

# Build for distribution
bun run build
```

## Repository Structure

```
playwright-ai-step/
├── src/
│   ├── index.ts          # Public exports
│   ├── ai.ts             # Core ai() function
│   ├── config.ts         # Multi-provider config resolution
│   ├── dom-serializer.ts # Page → DOM snapshot
│   ├── llm-client.ts     # LLM API calls + retry logic
│   ├── selector-resolver.ts # Semantic selector fallback
│   ├── fixtures.ts       # @playwright/test integration
│   └── types.ts          # TypeScript interfaces
├── tests/
│   ├── unit.test.ts      # DOM serializer, LLM parsing, selector resolver
│   ├── error-handling.test.ts
│   ├── integration.test.ts  # Real LLM calls (requires API key)
│   └── pages/
│       └── example-form.html
├── sample/               # Example test suites (YouTube, Wikipedia, etc.)
│   ├── youtube-search.spec.ts
│   └── README.md
├── .github/workflows/test.yml
├── .gsd/                 # GSD workflow files
│   ├── CONTEXT.md        # Project decisions
│   ├── STATE.md          # Current phase
│   ├── RESEARCH.md       # ZeroStep analysis
│   └── plans/
│       └── 01-01-PLAN.md # Phase 1 plan
├── package.json
├── tsconfig.json
└── README.md
```

## Sample Tests

The `sample/` directory contains ready-to-run test suites for popular websites. Each sample demonstrates a real-world workflow and serves as both documentation and regression tests.

```bash
# YouTube search workflow
PAS_OLLAMA_API_KEY=... bun test sample/youtube-search.spec.ts
```

See [sample/README.md](sample/README.md) for the full list of available samples and setup instructions.

## Roadmap (GSD Phases)

| Phase | Status | Description |
|---|---|---|
| Phase 1: Core Engine | ✅ Complete | ai(), DOM serializer, selector resolver, fixture |
| Phase 2: Integration Tests | ✅ Complete | Real LLM calls, multi-provider, error handling |
| Phase 3: Selector Intelligence | ✅ Complete | Retry chain, improved prompts, vision module |
| Phase 4: Vision + Multi-page | ✅ Complete | Visual context, aiNavigate(), recording, page objects |
| Phase 5: Advanced Features | ✅ Complete | Test generation, parallel ai(), sitemap, self-healing CLI |

## License

MIT — use it however you want.
