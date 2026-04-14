#!/usr/bin/env node
// playwright-ai-step CLI — main entry point
// Usage:
//   npx playwright-ai-step generate "book a flight on delta.com"
//   npx playwright-ai-step sitemap https://example.com/sitemap.xml --type navigation
//   npx playwright-ai-step heal tests/my-test.ts

import { generateTest } from './test-generator'
import { generateSitemapTestsToFile } from './sitemap-generator'

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.log(`
playwright-ai-step CLI

Usage:
  npx playwright-ai-step generate "test description" [options]
    --base-url       Base URL for the test (required)
    --output         Output file path (default: tests/generated.test.ts)
    --name           Test name (default: from spec)

  npx playwright-ai-step sitemap <sitemap-url> [options]
    --type           Test type: basic | form | navigation (default: basic)
    --base-url       Base URL to strip from URLs (required)
    --output         Output file path (default: tests/sitemap.test.ts)

  npx playwright-ai-step --version

Examples:
  npx playwright-ai-step generate "login to github" --base-url https://github.com
  npx playwright-ai-step sitemap https://example.com/sitemap.xml --type navigation --base-url https://example.com
`)
    return
  }

  const command = args[0]

  try {
    if (command === 'generate') {
      const spec = args[1]
      if (!spec) { console.error('Missing spec argument'); process.exit(1) }

      const baseUrl = extractFlag(args, '--base-url') ?? extractFlag(args, '-u') ?? ''
      if (!baseUrl) { console.error('--base-url required'); process.exit(1) }

      const outputPath = extractFlag(args, '--output') ?? extractFlag(args, '-o') ?? `tests/generated-${Date.now()}.test.ts`
      const testName = extractFlag(args, '--name') ?? extractFlag(args, '-n')

      const code = await generateTest(spec, { baseUrl, testName })
      const { writeFileSync } = await import('fs')
      writeFileSync(outputPath, code)
      console.log(`✅ Test generated: ${outputPath}`)
    }

    else if (command === 'sitemap') {
      const sitemapUrl = args[1]
      if (!sitemapUrl?.startsWith('http')) { console.error('Invalid sitemap URL'); process.exit(1) }

      const testType = extractFlag(args, '--type') ?? extractFlag(args, '-t') ?? 'basic'
      const baseUrl = extractFlag(args, '--base-url') ?? extractFlag(args, '-u') ?? ''
      const outputPath = extractFlag(args, '--output') ?? extractFlag(args, '-o') ?? `tests/sitemap-${testType}.test.ts`

      if (!baseUrl) { console.error('--base-url required'); process.exit(1) }

      const result = await generateSitemapTestsToFile(sitemapUrl, { testType: testType as 'basic' | 'form' | 'navigation', baseUrl, outputPath })
      console.log(`✅ Generated ${result.urlCount} tests → ${result.filePath}`)
    }

    else if (command === '--version' || command === '-v') {
      const pkg = await import('../package.json').catch(() => ({ version: '0.1.0' }))
      console.log(`playwright-ai-step v${pkg}`)
    }

    else {
      console.error(`Unknown command: ${command}`)
      process.exit(1)
    }
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}

function extractFlag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name)
  if (idx === -1) return undefined
  return args.splice(idx, 2)[1]
}

main()