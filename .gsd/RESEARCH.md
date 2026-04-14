# ZeroStep-Like AI Testing Library: Technical Research Document

**Prepared for:** Carlos  
**Date:** 2026-04-15  
**Research Duration:** 30 minutes  
**Channel:** whatsapp (subagent: f8c5a9d8-6217-45a5-bb9c-40ce16556760)

---

## 1. Executive Summary

### What We're Building
An **open-source, self-hosted AI-powered Playwright testing library** that brings ZeroStep-like natural-language test execution to TypeScript/Vitest projects — without any external SaaS dependency. Users plug in their own LLM API key (MiniMax or Gemma 4 via Ollama) and write tests like:

```typescript
import { ai } from '@your-library/playwright'
test('book a timeslot', async ({ page }) => {
  await ai('Click on the first available day', { page })
  await ai('Fill out the form with realistic values', { page })
  await ai('Assert the confirmation message is visible', { page })
})
```

### Why It Matters
- **ZeroStep** is proprietary (closed-source backend, GPT-4-only, $0.30–$1.20/1M tokens via their SaaS)
- **No self-hosted alternative exists** for this workflow
- MiniMax's OpenAI-compatible API at **$0.12–$1.20/1M tokens** is dramatically cheaper than GPT-4
- **Gemma 4 via Ollama is free** (local inference) — zero API cost
- Developers increasingly want to own their AI infrastructure

### Verdict
**Technically feasible.** The hardest parts are: (1) building a reliable DOM-to-LLM prompt, (2) generating stable selectors from LLM output, and (3) handling ambiguous actions gracefully. MiniMax M2.7 is the best cost/quality balance; Gemma 4 via Ollama is the free option.

---

## 2. ZeroStep Deep Analysis

### What is ZeroStep?
ZeroStep (`@zerostep/playwright`) is an npm package that adds an `ai()` function to Playwright tests. Instead of CSS selectors or XPath, you write plain-text instructions:

```typescript
import { ai } from '@zerostep/playwright'
await ai('Fill out the form with realistic values', { page, test })
```

### How It Works (Architecture)

ZeroStep's architecture has **two components**:

1. **Open-source JavaScript client** (`@zerostep/playwright` on npm)
   - Installed as a dev dependency
   - Drives the Playwright browser, captures context
   - Exposes the `ai()` function to test code

2. **Proprietary SaaS backend** (controlled by `ZEROSTEP_TOKEN`)
   - Receives context from the client
   - Calls GPT-3.5/GPT-4
   - Returns Playwright commands
   - Communication via **WebSocket**

### Context Capture (per `ai()` call)
Before calling the backend, the client sends:
- **Base64-encoded screenshot** of the current viewport
- **DOM snapshot** (serialized HTML/Accessibility tree)
- The **plain-text instruction** (e.g., "Click the submit button")
- The **instruction type** (`action` | `assert` | `query`)

### Backend Processing
1. Receives screenshot + DOM + instruction
2. Calls **GPT-3.5 or GPT-4** (user selects model)
3. GPT returns a structured response: `{ action: "click", selector: "..." }` or similar
4. Commands are sent back over WebSocket to the client
5. Client executes the Playwright commands

### Supported Instruction Types
| Type | Behavior | Return Value |
|------|----------|--------------|
| `action` | Simulates user interaction (click, type, hover) | `undefined` (throws on failure) |
| `assert` | Validates page state | `true` (throws if fails) |
| `query` | Extracts data from the page | Extracted value (string/number) |

### Pricing Model
- **Free tier:** 500 `ai()` calls/month (no credit card required)
- **Usage-based:** Billing per `ai()` call, not per token
- Each `ai()` call → 1 screenshot + DOM snapshot → 1 LLM call
- ZeroStep wraps GPT-3.5/4 and adds its own prompt engineering on top

### Key Limitations (from their docs)
- **Only Chromium is supported**
- Maximum 10 prompts can be run concurrently (via array syntax)
- No support for `function_call` (use `tools` instead internally)
- The backend is **closed source** — you cannot self-host

### GitHub
- Repo: `github.com/zerostep-ai/zerostep`
- The npm package is open source; the AI backend is proprietary

---

## 3. LLM Options Analysis

### Option 1: MiniMax API (Recommended for Cost/Quality)

**API Details:**
- **Base URL:** `https://api.minimax.io/v1` (international); `https://api.minimax.chat/v1` (China)
- **OpenAI-compatible:** Yes — set `OPENAI_BASE_URL` and use OpenAI SDK directly
- **Auth:** Bearer token via `MINIMAX_API_KEY`

**Key Models:**
| Model | Context Window | Input Price | Output Price | Cached Input |
|-------|---------------|-------------|-------------|-------------|
| MiniMax-M2.7 | 196,608 tokens | $0.30/1M | $1.20/1M | $0.06/1M |
| MiniMax-M2.5 | ~197K tokens | $0.12–0.30/1M | $0.95–1.20/1M | ~$0.06/1M |
| MiniMax-Text-01 | 1,000,192 tokens | $0.20/1M | $1.10/1M | — |

**Strengths:**
- OpenAI-compatible API — drop-in replacement for any OpenAI SDK usage
- Much cheaper than GPT-4 for high-volume test runs
- Good reasoning capabilities for coding tasks (M2.7)
- Supports `tools` (function calling) — critical for structured command output

**Weaknesses:**
- Not as capable as GPT-4 for ambiguous visual reasoning
- Requires API key management
- Rate limits apply (depends on tier)

**Recommended for this project:** `MiniMax-M2.7` — best cost/quality at $0.30 input / $1.20 output per million tokens.

### Option 2: Gemma 4 via Ollama (Free, Local)

**What is Gemma 4?**
Google's latest open-weight model family (released March–April 2026):
- `gemma-4-2b-a4b-it` — 2B effective params (mobile-capable)
- `gemma-4-4b-a4b-it` — 4B effective params
- `gemma-4-26b-a4b-it` — 26B MoE (needs 16GB VRAM)
- `gemma-4-31b-it` — 31B dense (needs 24GB+ VRAM)

**Running Locally via Ollama:**
```bash
ollama run gemma-4-31b-it
```
Ollama exposes a **local REST API that is OpenAI-compatible**:
```json
POST /api/chat
{
  "model": "gemma-4-31b-it",
  "messages": [...]
}
```
This means the same OpenAI SDK client works with Ollama by pointing at `http://localhost:11434/v1`.

**Hardware Requirements:**
| Model | VRAM | Suitable Hardware |
|-------|------|------------------|
| 2B / 4B | 6–8GB | Modern laptop GPU, MacBook Air M3 |
| 26B MoE | 16GB | MacBook Pro M2 Pro, RTX 4070 |
| 31B | 24GB | Mac Studio M4 Max, RTX 4090, A100 |

**Speed (rough estimates via Ollama):**
- 2B: ~20–40 tok/s (very usable)
- 31B: ~8–15 tok/s (usable for testing with small context)
- Speeds vary significantly by quantization level (Q4_K_M recommended)

**Strengths:**
- **Completely free** — no API costs
- Fully local — no data leaves the machine
- OpenAI-compatible API via Ollama
- Gemma 4 ranks #3 on Arena AI text leaderboard (31B model)

**Weaknesses:**
- Requires local GPU with enough VRAM
- Slower than cloud APIs (8–40 tok/s vs. 100+ tok/s)
- Smaller context window (supports up to ~8K–32K depending on Ollama config)
- May be less reliable for complex multi-step reasoning than cloud models

### Option 3: Gemma 4 via Google AI Studio / Vertex AI

- **AI Studio free tier:** Limited free quota; good for experimentation
- **Vertex AI:** Pay-per-use; `gemini-4-27b` or similar model, not the same as Ollama Gemma 4
- **OpenAI-compatible:** Via Vertex AI's compatibility layer
- **Best for:** Teams that want managed inference but still want Google Cloud

### Option 4: Other Alternatives (for reference)

| Model | API | Cost | Notes |
|-------|-----|------|-------|
| GPT-4o | OpenAI | $5/1M in, $15/1M out | Most capable but expensive |
| GPT-3.5-turbo | OpenAI | $0.50/1M in, $1.50/1M out | Cheaper but less capable |
| Claude 3.5 Haiku | Anthropic | $0.80/1M in, $4/1M out | Good reasoning |
| Claude 3.5 Sonnet | Anthropic | $3/1M in, $15/1M out | Best for coding |

---

## 4. Technical Architecture Proposal

### High-Level Architecture

```
Test File (TypeScript/Vitest)
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  @your-library/playwright  (npm package)             │
│                                                     │
│  1. ai() — captures page state (screenshot + DOM)   │
│  2. Builds LLM prompt with instruction + context     │
│  3. Sends to user-configured LLM endpoint           │
│  4. Parses LLM response → Playwright commands        │
│  5. Executes commands on Playwright page              │
└─────────────────────────────────────────────────────┘
    │
    ▼ (HTTP/WebSocket)
LLM Endpoint (user-configured):
  - MiniMax API (api.minimax.io/v1)   ← Recommended
  - Ollama local (localhost:11434/v1) ← Free option
  - Any OpenAI-compatible API
```

### Core Module Design

```typescript
// packages/ai-playwright/src/index.ts

export interface AiOptions {
  page: Page           // Playwright Page
  test?: TestInfo      // Vitest test info (optional)
  type?: 'action' | 'assert' | 'query'
  model?: string       // Model name override
}

export async function ai(
  instruction: string | string[],
  options: AiOptions,
  config?: AiConfig
): Promise<any>
```

### Prompt Engineering Strategy

The most critical piece is the **DOM + screenshot → LLM → Playwright command** pipeline.

**Prompt Structure (per call):**

```
SYSTEM PROMPT:
You are a Playwright test automation expert. Given a DOM description
and a user instruction, return a JSON command to execute on the page.

Return ONLY valid JSON with this schema:
{
  "action": "click" | "type" | "hover" | "select" | "scroll" | "wait" | "assert" | "query",
  "selector": "<css selector>",     // for click/type/hover/select
  "value": "<text>",                // for type/select
  "assertion": { "type": "...", "expected": "..." },  // for assert
  "query": { "selectors": ["..."], "extraction": "text|attribute|count" }, // for query
  "reasoning": "<brief explanation>",
  "confidence": 0.0-1.0
}

Rules:
- Only return ONE action per response
- Use semantic selectors (getByRole, getByText) over CSS selectors
- If the element is not in the DOM, return action: "fail" with reason
- For assertions, return what to check and expected value
- Confidence < 0.6 means: try multiple selector strategies or fail

USER MESSAGE:
Instruction: "Click the submit button"

=== VIEWPORT SCREENSHOT ===
[base64 encoded PNG]

=== DOM SNAPSHOT ===
[Serialized DOM tree — see format below]

=== AVAILABLE PAGE STATE ===
URL: https://example.com
Title: Example Page
Visible elements: [list with roles, text, aria-labels]
```

**DOM Snapshot Format:**
```typescript
interface ElementDescriptor {
  role: string        // ARIA role
  tagName: string
  id?: string
  classes?: string[]
  textContent?: string
  placeholder?: string
  ariaLabel?: string
  attributes: Record<string, string>
  isVisible: boolean
  boundingBox?: { x: number, y: number, width: number, height: number }
  children: ElementDescriptor[]
}
```

**DOM Serialization Strategy:**
1. Use `page.evaluate()` to serialize accessible elements
2. Include ARIA roles, text content, bounding boxes
3. Limit to visible elements (z-index, display: none filtered out)
4. Truncate very long text content (max 200 chars per element)
5. Include `data-testid` attributes if present (best stability)

### Selector Generation Strategy

LLMs often generate fragile CSS selectors. Use a **multi-strategy fallback**:

```typescript
async function resolveSelector(
  page: Page,
  llmResponse: LLMCommand,
  domContext: DOMContext
): Promise<Locator | null> {
  // Strategy 1: Use LLM's exact selector (highest confidence)
  if (llmResponse.confidence > 0.8 && llmResponse.selector) {
    const locator = page.locator(llmResponse.selector)
    if (await locator.isVisible()) return locator
  }

  // Strategy 2: Semantic locators from DOM context
  if (llmResponse.role && llmResponse.text) {
    const locator = page.getByRole(llmResponse.role, { name: llmResponse.text })
    if (await locator.isVisible()) return locator
  }

  // Strategy 3: Text content match
  if (llmResponse.text) {
    const locator = page.getByText(llmResponse.text, { exact: false })
    if (await locator.isVisible()) return locator
  }

  // Strategy 4: GPT-4V-style "visual grounding" using screenshot
  // (If screenshot is passed and model supports vision)
  // This is the most complex — requires matching screenshot regions to DOM

  return null // All strategies failed
}
```

### Interception Points with Playwright

**Option A: Monkey-patch `page` methods** (simpler, more fragile)
```typescript
// Not recommended — too fragile across Playwright versions
```

**Option B: Command Queue Pattern** (recommended)
```typescript
// The ai() function returns a command queue
// Each command is: { action, params, locator }
// Executed sequentially with error handling
```

**Option C: Custom Test Runner** (most control)
```typescript
// Wrap Vitest's test() function
// Interpose ai() calls between test steps
// This is how ZeroStep works — a custom fixture
```

### Vitest Integration

```typescript
// packages/ai-playwright/src/fixtures.ts
import { test as base } from '@playwright/test'
import { ai, aiFixture, type AiFixture } from '@your-library/playwright'

// Export the pre-wrapped test with ai() available as a fixture
export { ai }

export const test = base.extend<AiFixture>({
  ...aiFixture(base),
})

// In vitest.config.ts:
import { defineConfig } from 'vitest/config'
import { playwright } from '@playwright/test'

export default defineConfig({
  test: {
    use: {
      ...playwright({
        browsers: ['chromium'], // Only chromium supported
      }),
    },
  },
})
```

### Configuration

```typescript
// ai-playwright.config.ts
{
  llm: {
    provider: 'minimax' | 'ollama' | 'openai' | 'custom',
    apiKey: process.env.LLM_API_KEY,
    baseUrl: 'https://api.minimax.io/v1', // or 'http://localhost:11434/v1'
    model: 'MiniMax-M2.7',               // or 'gemma-4-31b-it'
    maxTokens: 512,                        // Keep responses short
    temperature: 0.1,                      // Low temp for deterministic output
  },
  selectors: {
    preferSemantic: true,                  // Use getByRole over CSS
    fallbackStrategies: ['role', 'text', 'testId', 'css'],
    maxRetries: 2,                         // Retry failed selectors
  },
  context: {
    includeScreenshot: true,               // Pass screenshot to LLM
    screenshotQuality: 'medium',           // 'low' | 'medium' | 'high'
    maxDomDepth: 10,                       // Limit DOM tree depth
    maxElements: 100,                      // Max elements in DOM snapshot
  },
  debugging: {
    verbose: process.env.DEBUG === 'ai-playwright',
    saveScreenshots: process.env.DEBUG === 'ai-playwright',
  }
}
```

---

## 5. Implementation Roadmap

### Phase 1: Core Engine (Weeks 1–2)
**Goal:** Make `ai()` work for simple click/type actions with MiniMax

- [ ] Set up monorepo: `packages/ai-playwright`, `packages/core`, `packages/prompts`
- [ ] Implement DOM serializer (`page.evaluate()` → JSON tree)
- [ ] Build the prompt builder (system prompt + user message)
- [ ] Implement OpenAI-compatible API client (supports MiniMax + Ollama)
- [ ] Parse JSON command response from LLM
- [ ] Basic selector resolution (CSS selector from LLM)
- [ ] `ai()` function: action type working end-to-end
- [ ] Basic fixture for `@playwright/test`

### Phase 2: Robust Selectors & Assertions (Weeks 3–4)
**Goal:** Make tests reliable — selector fallback, assertions, query

- [ ] Multi-strategy selector resolution (role → text → testId → CSS)
- [ ] `assert` type — verify element visibility, text content, counts
- [ ] `query` type — extract text, attributes, counts
- [ ] Retry logic for failed selectors (up to `maxRetries`)
- [ ] Screenshot capture and base64 encoding
- [ ] Vision-capable LLM support (MiniMax has vision in M2.5+)
- [ ] Error messages that explain what failed and why

### Phase 3: Vitest Integration + CLI (Weeks 5–6)
**Goal:** First-class DX for TypeScript/Vitest projects

- [ ] `aiFixture()` for Vitest/Playwright test runner
- [ ] Config file (`ai-playwright.config.ts` or `ai.config.ts`)
- [ ] Environment variable config (`LLM_API_KEY`, `LLM_BASE_URL`, etc.)
- [ ] `npx ai-playwright@latest init` CLI for quick setup
- [ ] Debug mode: save screenshots + prompts + responses to disk
- [ ] TypeScript types for all public APIs

### Phase 4: Ollama Support (Weeks 7–8)
**Goal:** Zero-cost option via local Gemma 4

- [ ] Ollama health check and auto-detection
- [ ] Support for vision models via Ollama (if available)
- [ ] Auto-install Gemma 4 via `ollama pull gemma-4-31b-it`
- [ ] Performance optimization: cache prompts for similar pages
- [ ] Local model benchmarks (tok/s, accuracy vs cloud models)

### Phase 5: Advanced Features (Weeks 9–12)
**Goal:** Make it production-grade

- [ ] Self-healing selectors: when a test fails, ask LLM to find the new selector
- [ ] Test generation: `ai.generateTest('book a flight on delta.com')` → full test file
- [ ] Parallel ai() calls (batch prompts — ZeroStep supports 10 concurrent)
- [ ] CI/CD integration guide (GitHub Actions, etc.)
- [ ] Recording mode: run app manually → auto-generate `ai()` steps
- [ ] Sitemap-based test generation

---

## 6. Viability Assessment

### Technical Feasibility: ✅ YES (with caveats)

**What works:**
- OpenAI-compatible API means MiniMax/Ollama integrate with zero friction
- Playwright's `page.evaluate()` can capture all DOM data needed
- Selector resolution with fallback strategies is well-understood
- The pattern (LLM → structured JSON → Playwright command) is proven by ZeroStep

**Hard parts:**

1. **Vision + DOM fusion** (Hardest)
   - MiniMax M2.7 supports vision — useful for matching screenshot regions to DOM
   - Without vision: LLM only sees serialized DOM, which loses spatial layout
   - Without spatial info, the LLM may pick the wrong element in a list
   - **Mitigation:** Include bounding boxes in DOM snapshot; use `getByRole` + text

2. **Selector fragility** (Hard)
   - LLM-generated CSS selectors often don't match (wrong attribute, wrong combinator)
   - **Mitigation:** Semantic locators (`getByRole`, `getByText`) are 3-5x more stable than CSS

3. **Ambiguous instructions** (Medium)
   - "Click the button" on a page with 5 buttons → LLM must guess
   - **Mitigation:** Include `type: 'action' | 'assert' | 'query'` hint; require specificity

4. **Cost of DOM + screenshot context** (Medium)
   - Each `ai()` call sends: base64 PNG (50–200KB) + DOM (5–50KB) + instruction
   - MiniMax M2.7: ~196K token context → ~$0.06 per call for context input
   - For 500 `ai()` calls: ~$30/month on MiniMax vs. $0 with Ollama

5. **Ollama speed** (Medium)
   - 8–40 tok/s means a single `ai()` call could take 5–20 seconds
   - A test with 10 `ai()` calls: 50–200 seconds just for AI decisions
   - **Mitigation:** Use MiniMax cloud for CI (fast), Ollama for local dev (free)

**Approximations Needed:**
| Approximation | Impact | Mitigation |
|--------------|--------|-----------|
| LLM picks wrong list item | Tests flaky | Use explicit index: "click 3rd item" |
| CSS selector wrong | Action fails | Fallback to semantic locators |
| Screenshot compression loses detail | LLM misreads | Use `screenshotQuality: 'high'` in debug |
| DOM snapshot misses dynamic content | LLM blind | Capture after waiting for networkidle |

---

## 7. Estimated Costs

### Scenario A: MiniMax Cloud (Production CI)

Assume: 100 test files × 20 `ai()` calls each = **2,000 `ai()` calls/month**

| Cost Component | Calculation | Monthly Cost |
|---------------|-------------|-------------|
| Input tokens (context per call) | 2,000 × ~8K tokens × $0.30/1M | **$4.80** |
| Output tokens (command per call) | 2,000 × ~200 tokens × $1.20/1M | **$0.48** |
| **Total** | | **~$5.30/month** |

This is extraordinarily cheap vs. ZeroStep's pricing (which bills per `ai()` call, not tokens).

### Scenario B: Ollama Local (Free)

Hardware: RTX 4070 (16GB VRAM) for ~$600 one-time
- GPU amortized over 3 years: ~$16/month
- Electricity: ~$5–10/month at full load
- **Total: ~$25–30/month** (but serves unlimited tests)

### Scenario C: ZeroStep (Proprietary Reference)

ZeroStep free tier: 500 calls/month
- Paid: unknown per-call pricing, but GPT-4 backend means high cost
- **Not competitive** for high-volume test suites

---

## 8. Open Questions & Risks

### Open Questions

1. **MiniMax vision capabilities:** Does MiniMax-M2.7 support image input in the chat completions API? If yes, screenshot + DOM can go together in one call. If no, we need to decide: is DOM-only sufficient?

2. **Gemma 4 Ollama context window:** What is the actual context window for Gemma 4 via Ollama? Older Ollama versions limited to 8K; newer versions may support more.

3. **ZeroStep's "secret sauce":** ZeroStep's proprietary backend does more than just prompt GPT-4. What specific prompt engineering or post-processing makes it reliable? We won't know without reverse-engineering.

4. **Test parallelization:** ZeroStep limits concurrent `ai()` calls to 10. Should we impose a similar limit, or let users configure?

5. **Browser support:** ZeroStep only supports Chromium. Should we limit to Chromium too, or attempt Firefox/WebKit?

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| LLM-generated selectors frequently fail | High | Test flakiness | Semantic locators first; CSS only as last resort |
| MiniMax blocks/slows API access | Low | Tests hang | Add timeout + fallback to Ollama |
| No vision = frequent mis-clicks on complex UIs | Medium | Test failures | Add explicit instruction guidance in docs |
| Self-healing creates infinite loops | Low | Tests hang forever | Add max-heal-attempts guard (e.g., 3) |
| Prompt injection via test instructions | Low | Unexpected actions | Sanitize instructions; never run untrusted prompts |
| Ollama crashes during test run | Medium | Test failures | Health check before each suite; restart Ollama if needed |

---

## 9. Recommendations

### Do This First

1. **Start with MiniMax-M2.7** — OpenAI-compatible API, cheap, good coding reasoning
2. **Implement DOM serializer** — this is the foundation; needs to be solid
3. **Build prompt iteratively** — start simple, add complexity only when tests fail
4. **Test on 3 real apps first** — e.g., TodoMVC, a form app, a CRUD app — before generalizing

### Recommended Tech Stack

```
Runtime:        Node.js 20+ / Bun 1.x
Language:       TypeScript (strict mode)
Test Runner:    @playwright/test + Vitest runner
LLM Client:     OpenAI SDK (set baseURL for MiniMax/Ollama)
Package Manager: pnpm (monorepo)
```

### Priority Order for Implementation

1. **`ai('click X', { page })`** — the 80% use case
2. **`ai('type in X', { page })`** — second most common
3. **`ai('assert Y is visible', { page })`** — for test assertions
4. **`ai('what is Z?', { page })`** — for query/extract operations
5. **Selector fallback chain** — role → text → testId → CSS
6. **Vitest fixture** — `test` with `ai` as a method
7. **Ollama support** — free local inference
8. **Debug tooling** — save screenshots + prompts for inspection

### Things to Get Right

- **DOM serialization** must be fast (<50ms) and not crash on malformed HTML
- **Timeout handling** — LLM calls should timeout after 30s with a clear error
- **Error messages** — when `ai()` fails, tell the developer exactly why (which selector, what was expected)
- **Token counting** — warn if context is approaching model limits
- **Caching** — if the same instruction is called twice on the same URL, cache the result for 5 minutes

### Read Before Building

- ZeroStep's GitHub README (for API design inspiration): `github.com/zerostep-ai/zerostep`
- Playwright's Accessibility tree docs: `playwright.dev/docs/accessibility-testing`
- Ollama OpenAI compatibility: `github.com/ollama/ollama/blob/main/docs/api.md`
- MiniMax OpenAI compatibility guide: `minimax.io` (search "OpenAI SDK")

---

*This document is intended as a technical handover. Questions? Ask your AI agent to dig deeper into any section.*
