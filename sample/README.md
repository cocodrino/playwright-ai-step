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

Set your LLM provider credentials before running. You can either export them or create a `.env` file in the project root:

```bash
# Option 1: Create a .env file in the project root
echo 'PAS_LLM_PROVIDER=ollama' >> .env
echo 'PAS_OLLAMA_API_KEY=your_key' >> .env
echo 'PAS_OLLAMA_MODEL=gemma4:31b' >> .env

# Option 2: Export inline
export PAS_LLM_PROVIDER=ollama
export PAS_OLLAMA_API_KEY=your_key
export PAS_OLLAMA_MODEL=gemma4:31b
```

Or use other providers:

```bash
# MiniMax
PAS_LLM_PROVIDER=minimax PAS_MINIMAX_API_KEY=your_key PAS_MINIMAX_MODEL=MiniMax-M2.7 \
bunx playwright test sample/youtube-search.spec.ts

# OpenAI
PAS_LLM_PROVIDER=openai PAS_OPENAI_API_KEY=sk-... PAS_OPENAI_MODEL=gpt-4o \
bunx playwright test sample/youtube-search.spec.ts
```

## Available Samples

| File | Site | Workflow |
|---|---|---|
| `youtube-search.spec.ts` | YouTube | Homepage navigation, search, filter by type, open video, validate player and title |

## Adding new samples

1. Create a `*.spec.ts` file inside `sample/`
2. Import `test` and `expect` from `@playwright/test`, and `ai` from `../src/fixtures`
3. Each test should cover one user journey (search → filter → click → validate)
4. Run with `bunx playwright test sample/your-new.spec.ts`
