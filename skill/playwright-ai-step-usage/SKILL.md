---
name: playwright-ai-step-usage
description: Use when a project uses playwright-ai-step and tests should be authored with ai()-first flows, replicating user behavior in Chrome DevTools MCP and producing simple deterministic tests without relying on raw Playwright selectors.
---

# Playwright AI Step Usage

## Overview
This skill defines the production standard for writing E2E tests with `playwright-ai-step`.

Primary principle:
- express user intent with `ai()`;
- avoid manual selector engineering unless there is a proven technical gap;
- keep tests small, deterministic, and easy to maintain.

If two fields look similar (same label family, similar placeholder, repeated forms), increase instruction precision with section context + full field label + placeholder hint.

## Why this approach
`playwright-ai-step` is designed to encode behavior at user-language level. If you fall back to `page.locator()` everywhere, you lose the core value of the library and return to brittle selector maintenance.

## When to use
Use this skill when:
- a project imports `playwright-ai-step`;
- you are creating/updating browser E2E tests;
- a flow must be replicated from an actual page session (form, checkout, onboarding, profile edit);
- selectors are unstable and intent-based instructions are preferred;
- forms have ambiguous fields (e.g. address/name-like fields, phone/confirm phone, affiliate phone/account phone).

Do not use this skill for:
- pure unit tests;
- non-browser tests;
- low-level Playwright locator experiments not related to `ai()` usage.

## Non-negotiable rules
1. Use `playwright-ai-step` API (`test`, `ai`) as the default interaction layer.
2. Do NOT start with `page.locator`, `getByRole`, `getByText`, CSS/XPath selectors.
3. Only use raw Playwright selectors if `ai()` cannot express the step after a concrete attempt.
4. If raw selectors are used, isolate them and document the reason in one concise inline comment.
5. Keep one business flow per test. Do not create giant end-to-end mega-tests.
6. Prefer explicit single-step instructions over long multi-action prompts.

## Install this skill
Skill source in repository:
- `skill/playwright-ai-step-usage/SKILL.md`

Install for Kilo/Codex-style agents:
```bash
mkdir -p ~/.agents/skills/playwright-ai-step-usage
cp skill/playwright-ai-step-usage/SKILL.md ~/.agents/skills/playwright-ai-step-usage/SKILL.md
```

Install for Claude-style agents:
```bash
mkdir -p ~/.claude/skills/playwright-ai-step-usage
cp skill/playwright-ai-step-usage/SKILL.md ~/.claude/skills/playwright-ai-step-usage/SKILL.md
```

Recommended project note:
- Add a brief line in project agent instructions: "When writing tests for this repo, load skill `playwright-ai-step-usage`."

## Setup and imports
Minimal setup pattern:
```ts
import { test } from "playwright-ai-step"
```

Use `test` from this package (not `@playwright/test`) for flows where `ai` fixture is expected.

## Chrome DevTools MCP workflow (mandatory for flaky/ambiguous UI)
1. Open the target URL with Chrome DevTools MCP.
2. Reproduce the user path manually.
3. Capture exact visible text:
   - section/heading,
   - full field labels,
   - placeholders,
   - option names/buttons.
4. Identify ambiguous fields before coding.
5. Convert each human step into one `ai()` instruction.
6. Run test, inspect failing instruction, refine wording (not selectors) first.

## Instruction design rules
### Always include
- action verb (`escribir`, `seleccionar`, `hacer click`, `validar`),
- business context (section name),
- field identity (full label),
- value.

### Good patterns
- `"En Información de Contacto, escribir Jose en Nombre"`
- `"En Información de Contacto, escribir Av Principal 123 en Dirección"`
- `"En Domicilia tu cuenta bancaria, escribir 2222345 en Teléfono afiliado a la cuenta"`
- `"Seleccionar Bancamiga en Cuenta Bancaria Domiciliada"`

### Bad patterns
- `"llenar nombre"`
- `"escribir teléfono"`
- `"completar dirección y código postal"` (dos acciones mezcladas)

## Placeholder-first disambiguation examples
Use these when labels are similar or absent.

### Example A: same label family, different placeholder
Suppose two fields can be interpreted as phone-like fields.

Preferred instruction:
- `"En Domicilia tu cuenta bancaria, escribir 2222345 en el campo con placeholder '222 2345' (Teléfono afiliado a la cuenta)"`

Avoid:
- `"escribir teléfono 2222345"`

### Example B: contact fields with nearby ambiguity
Preferred:
- `"En Información de Contacto, escribir Av Principal 123 en Dirección (placeholder 'Ej. Av. Principal, Edificio 1, Piso 2')"`
- `"En Información de Contacto, escribir 1010 en Código Postal (placeholder 'Ej. 1010')"`

### Example C: confirm phone vs phone
Preferred:
- `"En Datos del afiliado, escribir 04141234567 en Teléfono afiliado"`
- `"En Datos del afiliado, escribir 04141234567 en Confirmar teléfono"`

Each instruction must include the exact target label, never just "teléfono".

## Full simple test (recommended baseline)
```ts
import { test } from "playwright-ai-step"

test("checkout - simple happy path", async ({ page, ai }) => {
  await page.goto("http://localhost:3000/clients?org=...&session=...")

  await ai("En Información de Contacto, escribir Jose en Nombre")
  await ai("En Información de Contacto, escribir Perez en Apellido")
  await ai("En Información de Contacto, escribir jose@example.com en Correo electrónico")
  await ai("En Información de Contacto, escribir Av Principal 123 en Dirección (placeholder 'Ej. Av. Principal, Edificio 1, Piso 2')")
  await ai("En Información de Contacto, escribir 1010 en Código Postal (placeholder 'Ej. 1010')")

  await ai("Seleccionar Bancamiga en Cuenta Bancaria Domiciliada")
  await ai("En Domicilia tu cuenta bancaria, escribir 12345678 en Cédula del titular de la cuenta")
  await ai("En Domicilia tu cuenta bancaria, escribir 01020000000000000000 en Número de cuenta bancaria")
  await ai("En Domicilia tu cuenta bancaria, escribir 2222345 en el campo con placeholder '222 2345' (Teléfono afiliado a la cuenta)")

  await ai("Hacer click en Continuar")
})
```

## Assertions with ai()
Prefer intent assertions before raw selectors.

Examples:
- `await ai("validar que se muestra el mensaje 'Faltan campos por completar'", { type: "assert" })`
- `await ai("validar que el botón Continuar está visible", { type: "assert" })`

For extraction-style checks, use query/extract only when needed by business assertion.

## Ambiguity resolution protocol
When a field is filled incorrectly:
1. Keep `ai()` (do not jump to selectors immediately).
2. Add section context.
3. Use exact full label text.
4. Add placeholder hint.
5. Split into one instruction per field.
6. Re-run.
7. Only then consider isolated fallback selector for that one step.

## Allowed fallback to raw Playwright selectors
Fallback is acceptable only if ALL are true:
- `ai()` was attempted with explicit context;
- failure is reproducible;
- the step is blocked by a technical mismatch;
- fallback is isolated to one step with short justification.

Example fallback (last resort):
```ts
// Fallback: UI component exposes no stable semantic target for ai() in this version
await page.locator('[data-internal-control="state-select"]').click()
```

## Test style guide
- One intent per line.
- Keep tests under ~25 actionable lines when possible.
- Prefer clear Spanish natural instructions if product UI is Spanish.
- Do not combine navigation, form fill, and post-purchase audit in one test.
- Use descriptive test names with business meaning.

## Anti-patterns to avoid
- Writing selector-heavy Playwright tests while importing `playwright-ai-step`.
- Using vague verbs without target context.
- Bulk prompt like: `"completa todo el formulario"`.
- Relying on unstable DOM internals first.
- Using MCP only for screenshots instead of reproducing the real user flow.

## Troubleshooting quick map
- Wrong field selected -> add section + exact label + placeholder.
- Flaky click target -> break step and issue explicit click instruction.
- Repeated field labels -> include nearby heading/business block.
- Validation not triggered -> add explicit submit/click step before assert.

## Pre-merge checklist
- Uses `test` from `playwright-ai-step`.
- Primary interactions use `ai()`.
- Ambiguous fields include disambiguation hints.
- MCP reproduction done at least once for the target flow.
- Test is short, readable, and single-purpose.
- No unjustified raw selectors.

## Key outcomes expected
Following this skill should produce:
- fewer brittle selector failures,
- tests closer to real user language,
- faster maintenance when UI structure changes,
- clearer intent and easier review.
