import { afterEach, describe, expect, test, vi } from 'vitest'
import { generateStructuredObject } from './geminiStructured.ts'

const globalWithDeno = globalThis as typeof globalThis & {
  Deno?: {
    env: {
      get: (key: string) => string | undefined
    }
  }
}

const originalDeno = globalWithDeno.Deno
const originalFetch = globalThis.fetch

describe('generateStructuredObject', () => {
  afterEach(() => {
    globalWithDeno.Deno = originalDeno
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  test('retries temporary Gemini overloads before returning a valid object', async () => {
    globalWithDeno.Deno = createDenoEnv()
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: 503,
              message: 'This model is currently experiencing high demand.',
              status: 'UNAVAILABLE',
            },
          }),
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify({ value: 'ok' }) }],
                },
              },
            ],
          }),
        ),
      )
    globalThis.fetch = fetchMock

    const result = await generateStructuredObject({
      prompt: 'prompt',
      schema: { type: 'object' },
      validate: (value): value is { value: string } =>
        Boolean(value) &&
        typeof value === 'object' &&
        typeof (value as { value?: unknown }).value === 'string',
      invalidMessage: 'Invalid object.',
      retryDelayMs: 0,
    })

    expect(result).toEqual({ value: 'ok' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  test('uses a concise retry-later error after Gemini overload retries are exhausted', async () => {
    globalWithDeno.Deno = createDenoEnv()
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 503,
            message: 'This model is currently experiencing high demand.',
            status: 'UNAVAILABLE',
          },
        }),
        { status: 503 },
      ),
    )

    await expect(
      generateStructuredObject({
        prompt: 'prompt',
        schema: { type: 'object' },
        validate: (value): value is { value: string } =>
          Boolean(value) &&
          typeof value === 'object' &&
          typeof (value as { value?: unknown }).value === 'string',
        invalidMessage: 'Invalid object.',
        retryDelayMs: 0,
      }),
    ).rejects.toThrow(
      'Gemini is temporarily unavailable. Please try again in a minute.',
    )
  })
})

function createDenoEnv() {
  return {
    env: {
      get: (key: string) => {
        if (key === 'GEMINI_API_KEY') return 'test-key'
        if (key === 'GEMINI_MODEL') return 'test-model'
        return undefined
      },
    },
  }
}
