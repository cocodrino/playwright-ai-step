# Context: playwright-ai-step

## Decisions (Locked)
- Package name: `playwright-ai-step`
- Runtime: Bun
- Language: TypeScript
- Package manager: Bun (bun install, bun test)
- Test runner: @playwright/test + Vitest (via playwright vitest integration)
- LLM client: OpenAI SDK (set baseURL for MiniMax/Ollama)
- First LLM: MiniMax-M2.7 (OpenAI-compatible at https://api.minimax.io/v1)
- Free option: Ollama with Gemma 4 via localhost:11434
- Phase approach: All phases planned upfront, execute one at a time, each phase verified before advancing
- CI: GitHub Actions — configure in the repo, run tests on push/PR

## Agent Discretion (Freedom Areas)
- DOM serialization format (exact implementation details)
- Prompt engineering specifics (system prompt structure)
- Selector fallback order / retry strategy details
- File structure internal organization within src/

## Deferred Ideas (Out of Scope for Now)
- Self-healing selectors (Phase 5 material)
- Test generation from natural language (Phase 5 material)
- Parallel ai() calls (Phase 5)
- Recording mode
- Sitemap-based generation
- Firefox/WebKit support (only Chromium for now)

## Research Source
`.gsd/RESEARCH.md` — ZeroStep technical analysis, MiniMax API details, Gemma 4 Ollama setup, architecture proposal, cost estimates.