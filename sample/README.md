# Sample Tests

Ready-to-run Playwright test suites for real websites. Each test demonstrates a complete end-to-end workflow using `ai()` from `playwright-ai-step`.

## How to run

These are **Playwright tests** (not Vitest unit tests), so they need the Playwright runner:

```bash
# Install Chromium (first time only)
bunx playwright install chromium

# Run all samples
bunx playwright test sample/

# Run a specific sample
bunx playwright test sample/youtube-search.spec.ts
```

### Required environment variables

```bash
# Ollama Cloud (recommended — free tier)
PAS_LLM_PROVIDER=ollama \
PAS_OLLAMA_API_KEY=your_key \
PAS_OLLAMA_MODEL=gemma4:31b \
bunx playwright test sample/youtube-search.spec.ts

# MiniMax
PAS_LLM_PROVIDER=minimax \
PAS_MINIMAX_API_KEY=your_key \
PAS_MINIMAX_MODEL=MiniMax-M2.7 \
bunx playwright test sample/youtube-search.spec.ts

# OpenAI
PAS_LLM_PROVIDER=openai \
PAS_OPENAI_API_KEY=sk-... \
PAS_OPENAI_MODEL=gpt-4o \
bunx playwright test sample/youtube-search.spec.ts
```

## Available Samples

| File | Site | Workflow |
|---|---|---|
| `youtube-search.spec.ts` | YouTube | Homepage navigation, search, filter by type, open video, validate player and title |

## Adding new samples

1. Create a `*.spec.ts` file inside `sample/`
2. Import from `'../src/index'` — `test`, `ai`, and `expect` are all available
3. Each test should cover one user journey (search → filter → click → validate)
4. Run with `bunx playwright test sample/your-new.spec.ts`
