// Parallel execution — run multiple ai() calls concurrently with a semaphore

import { ai } from './ai.js'
import type { AiOptions } from './types.js'

export interface ParallelResult {
  instruction: string
  result: boolean | string | number
  error?: string
  durationMs: number
}

interface Task {
  instruction: string
  resolve: (value: ParallelResult) => void
}

/**
 * Execute multiple ai() instructions concurrently.
 * Uses a semaphore to limit max concurrent LLM calls.
 */
export async function aiParallel(
  instructions: string[],
  options: AiOptions,
  maxConcurrency = 3,
): Promise<ParallelResult[]> {
  const results: ParallelResult[] = new Array(instructions.length)
  const queue: Task[] = []
  let running = 0

  async function startNext(): Promise<void> {
    while (queue.length > 0 && running < maxConcurrency) {
      const task = queue.shift()
      if (!task) break
      running++

      const start = Date.now()
      try {
        const result = await ai(task.instruction, options)
        task.resolve({ instruction: task.instruction, result, durationMs: Date.now() - start })
      } catch (err) {
        task.resolve({
          instruction: task.instruction,
          result: false as unknown as boolean | string | number,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - start,
        })
      } finally {
        running--
        startNext() // pick up next task
      }
    }
  }

  // Enqueue all tasks
  const promises = instructions.map((instruction, index) =>
    new Promise<ParallelResult>((resolve) => {
      queue.push({
        instruction,
        resolve: (result) => {
          results[index] = result
          resolve(result)
        },
      })
    })
  )

  // Start the concurrent workers
  startNext()

  return Promise.all(promises)
}

/**
 * Execute a batch of independent assertions concurrently.
 * Returns only results that succeeded (false positives filtered out).
 */
export async function aiAssertAll(
  assertions: string[],
  options: AiOptions,
): Promise<{ passed: string[]; failed: { assertion: string; error: string }[] }> {
  const results = await aiParallel(assertions.map(a => `assert ${a}`), options, 3)

  const passed: string[] = []
  const failed: { assertion: string; error: string }[] = []

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const assertion = assertions[i]
    if (result.error) {
      failed.push({ assertion, error: result.error })
    } else if (result.result === true) {
      passed.push(assertion)
    }
  }

  return { passed, failed }
}

/**
 * Monitor page stability — run concurrent checks for element presence.
 * Useful for ensuring a page is fully loaded before continuing.
 */
export async function aiWaitForAll(
  locators: string[],
  options: AiOptions,
  _timeoutMs = 5000,
): Promise<boolean> {
  const instructions = locators.map(loc => `wait for ${loc} to be visible`)
  const results = await aiParallel(instructions, options, locators.length)

  return results.every(r => !r.error && r.result === true)
}