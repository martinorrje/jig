import { afterEach, describe, expect, test, vi } from 'vitest'
import type { HardwarePlan } from '../../_shared/hardwarePlanContract.ts'
import { buildHousingCadPrompt, generateHousingCad } from './generateHousingCad.ts'

vi.mock('../providers/geminiStructured.ts', () => ({
  generateStructuredObject: vi.fn(async () => ({ build123dCode: 'shell = Box(1, 1, 1)' })),
}))

const globalWithDeno = globalThis as typeof globalThis & {
  Deno?: {
    env: {
      get: (key: string) => string | undefined
    }
  }
}

const originalDeno = globalWithDeno.Deno
const originalFetch = globalThis.fetch

const plan: HardwarePlan = {
  overview: {
    title: 'Speaker Module',
    summary: 'A small ESP32 speaker module.',
    requirements: [],
    constraints: [],
    assumptions: [],
    risks: [],
  },
  architecture: { subsystems: [] },
  components: { components: [] },
  connections: { connections: [], powerNotes: [], warnings: [] },
  review: { summary: '', warnings: [], openQuestions: [], nextSteps: [] },
  spec: {
    title: 'Speaker Module',
    summary: 'A small ESP32 speaker module.',
    requirements: [],
    constraints: [],
    assumptions: [],
    risks: [],
  },
}

describe('buildHousingCadPrompt', () => {
  afterEach(() => {
    globalWithDeno.Deno = originalDeno
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  test('asks Gemini for pure build123d code with a shell output variable', () => {
    const prompt = buildHousingCadPrompt('Build a speaker module.', plan)

    expect(prompt).toContain('pure Python build123d code')
    expect(prompt).toContain('Assign the final shape to a variable named shell')
    expect(prompt).toContain('Do not use Extrude')
    expect(prompt).toContain('Box, Cylinder, Sphere')
    expect(prompt).toContain('Do not include markdown fences')
    expect(prompt).toContain('"title":"Speaker Module"')
  })

  test('sends the CAD worker bearer token when one is configured', async () => {
    globalWithDeno.Deno = {
      env: {
        get: (key) => {
          if (key === 'CAD_WORKER_URL') return 'https://cad-worker.example'
          if (key === 'CAD_WORKER_TOKEN') return 'test-worker-token'
          return undefined
        },
      },
    }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true })))
    globalThis.fetch = fetchMock

    await generateHousingCad('Build a speaker module.', plan)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://cad-worker.example/render-shell',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-worker-token',
        },
      }),
    )
  })
})
