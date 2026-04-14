# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integration.test.ts >> OLLAMA: query page title text
- Location: tests/integration.test.ts:56:1

# Error details

```
Error: ai() selector resolution failed.
ai() failed to resolve selector.
  Action: query
  LLM reasoning: The user wants to query the page title text. The element with data-testid='page-title' corresponds to the <h1> 'User Registration'.
  LLM confidence: 1
  Closest DOM element: element not found in DOM snapshot
  Tried: role → text → testId → CSS
  Tip: Add data-testid attributes to make selectors stable, or use more specific instructions.
  Instruction: "query the page title text"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - paragraph [ref=e3]:
    - text: Welcome to the
    - strong [ref=e4]: playwright-ai-step
    - text: test page. Use natural language to interact with this form.
  - heading "User Registration" [level=1] [ref=e5]
  - paragraph [ref=e6]: Please fill in the form below to create your account.
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]: Full Name
      - textbox "Full Name" [ref=e10]:
        - /placeholder: Enter your full name
    - generic [ref=e11]:
      - generic [ref=e12]: Email Address
      - textbox "Email Address" [ref=e13]:
        - /placeholder: you@example.com
    - generic [ref=e14]:
      - generic [ref=e15]: Account Type
      - combobox "Account Type" [ref=e16]:
        - option "Select a role..." [selected]
        - option "Developer"
        - option "Designer"
        - option "Manager"
    - generic [ref=e18]:
      - checkbox "I agree to the Terms of Service" [ref=e19]
      - text: I agree to the Terms of Service
    - button "Create Account" [ref=e20] [cursor=pointer]
  - paragraph [ref=e21]:
    - link "Learn more about our services →" [ref=e22] [cursor=pointer]:
      - /url: https://example.com
```

# Test source

```ts
  20  |       break
  21  |     case 'hover':
  22  |       await locator.hover()
  23  |       break
  24  |     case 'select':
  25  |       if (command.value) await locator.selectOption(command.value)
  26  |       break
  27  |     case 'scroll':
  28  |       await locator.scrollIntoViewIfNeeded()
  29  |       break
  30  |     case 'wait':
  31  |       await locator.waitFor({ state: 'visible', timeout: 5000 })
  32  |       break
  33  |     default:
  34  |       throw new Error(`Unsupported action type: ${command.action}`)
  35  |   }
  36  | }
  37  | 
  38  | async function executeAssert(
  39  |   command: LLMCommand,
  40  |   locator: import('@playwright/test').Locator,
  41  | ): Promise<boolean> {
  42  |   const assertion = command.assertion
  43  |   if (!assertion) throw new Error('assert action missing assertion object')
  44  | 
  45  |   switch (assertion.type) {
  46  |     case 'visible':
  47  |       await locator.waitFor({ state: 'visible', timeout: 5000 })
  48  |       return true
  49  |     case 'text': {
  50  |       const actual = await locator.textContent()
  51  |       if (!actual?.includes(String(assertion.expected))) {
  52  |         throw new Error(`Assertion failed: expected text containing "${assertion.expected}", got "${actual}"`)
  53  |       }
  54  |       return true
  55  |     }
  56  |     case 'count': {
  57  |       const count = await locator.count()
  58  |       if (count !== Number(assertion.expected)) {
  59  |         throw new Error(`Assertion failed: expected ${assertion.expected} elements, got ${count}`)
  60  |       }
  61  |       return true
  62  |     }
  63  |     case 'attribute': {
  64  |       if (!command.selector) throw new Error('Attribute assertion requires a selector')
  65  |       const attrVal = await locator.getAttribute(assertion.attribute ?? '')
  66  |       if (attrVal !== String(assertion.expected)) {
  67  |         throw new Error(`Assertion failed: expected ${assertion.attribute}="${assertion.expected}", got "${attrVal}"`)
  68  |       }
  69  |       return true
  70  |     }
  71  |     default:
  72  |       throw new Error(`Unknown assertion type: ${assertion.type}`)
  73  |   }
  74  | }
  75  | 
  76  | async function executeQuery(
  77  |   locator: import('@playwright/test').Locator,
  78  |   command: LLMCommand,
  79  | ): Promise<string | number> {
  80  |   const q = command.query
  81  |   if (!q) throw new Error('query action missing query object')
  82  | 
  83  |   switch (q.extraction) {
  84  |     case 'text':
  85  |       return (await locator.textContent()) ?? ''
  86  |     case 'attribute':
  87  |       return (await locator.getAttribute(q.attribute ?? '')) ?? ''
  88  |     case 'count':
  89  |       return await locator.count()
  90  |     default:
  91  |       throw new Error(`Unknown extraction type: ${q.extraction}`)
  92  |   }
  93  | }
  94  | 
  95  | export async function ai(
  96  |   instruction: string | string[],
  97  |   options: AiOptions,
  98  | ): Promise<boolean | string | number> {
  99  |   const config = resolveLLMConfig()
  100 |   const debug = DEFAULT_DEBUG_CONFIG
  101 | 
  102 |   const instructions = Array.isArray(instruction) ? instruction : [instruction]
  103 |   const snapshot = await serializePage(options.page)
  104 | 
  105 |   for (const inst of instructions) {
  106 |     const type = options.type ?? 'action'
  107 |     const command = await callLLM(inst, snapshot, type, config)
  108 | 
  109 |     if (command.action === 'fail') {
  110 |       throw new Error(
  111 |         `ai() failed: ${command.reason ?? command.reasoning ?? 'unknown error'}\n` +
  112 |         `  Instruction: "${inst}"\n  confidence: ${command.confidence}`
  113 |       )
  114 |     }
  115 | 
  116 |     const locator = await resolveSelector(options.page, command, snapshot, debug.verbose)
  117 | 
  118 |     if (!locator) {
  119 |       const errorMsg = buildSelectorError(command, snapshot)
> 120 |       throw new Error(`ai() selector resolution failed.\n${errorMsg}\n  Instruction: "${inst}"`)
      |             ^ Error: ai() selector resolution failed.
  121 |     }
  122 | 
  123 |     if (type === 'assert' || command.action === 'assert') {
  124 |       return await executeAssert(command, locator)
  125 |     } else if (type === 'query' || command.action === 'query') {
  126 |       return await executeQuery(locator, command)
  127 |     } else {
  128 |       await executeAction(command, locator)
  129 |     }
  130 |   }
  131 | 
  132 |   return true
  133 | }
```