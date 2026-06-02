import { FunctionsHttpError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HardwareSpec } from '../model/types'
import { supabase } from '../lib/supabase'
import { createProjectFromPrompt, loadProject } from './projectService'

vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

const invokeFunction = vi.mocked(supabase.functions.invoke)

const spec: HardwareSpec = {
  title: 'Desktop Filament Dryer',
  summary: 'A compact dryer for desktop 3D printing filament.',
  requirements: ['Dry filament at controlled temperatures.'],
  constraints: ['Keep the enclosure suitable for desktop use.'],
  assumptions: ['The user wants hobby-scale operation.'],
  risks: ['Poor thermal control could damage filament.'],
  nextSteps: ['Confirm target spool sizes.'],
}

describe('projectService', () => {
  beforeEach(() => {
    invokeFunction.mockReset()
    vi.stubGlobal('sessionStorage', createMemoryStorage())
  })

  it('generates a spec and stores it as a local draft project', async () => {
    invokeFunction.mockResolvedValue({
      data: { spec },
      error: null,
    })

    const project = await createProjectFromPrompt(' desktop filament dryer ')

    expect(invokeFunction).toHaveBeenCalledWith('generate-spec', {
      body: { prompt: 'desktop filament dryer' },
    })
    expect(project.title).toBe(spec.title)
    expect(project.prompt).toBe('desktop filament dryer')
    expect(project.spec).toEqual(spec)

    const loadedProject = await loadProject(project.id)
    expect(loadedProject).toEqual(project)
  })

  it('throws when a local draft project cannot be found', async () => {
    await expect(loadProject('missing-project')).rejects.toThrow(
      'Project not found.',
    )
  })

  it('surfaces edge function response errors', async () => {
    invokeFunction.mockResolvedValue({
      data: null,
      error: new FunctionsHttpError(
        new Response(JSON.stringify({ error: 'Not allowed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    })

    await expect(createProjectFromPrompt('dryer')).rejects.toThrow(
      'Not allowed',
    )
  })
})

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}
