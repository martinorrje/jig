import { FunctionsHttpError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HardwarePlan, HardwareSpec } from '../model/types'
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
}

const plan: HardwarePlan = {
  overview: spec,
  architecture: {
    subsystems: [
      {
        id: 'controller',
        name: 'Controller',
        purpose: 'Control temperature and timing.',
      },
    ],
  },
  components: {
    components: [
      {
        id: 'esp32',
        name: 'ESP32 dev board',
        role: 'controller',
        category: 'controller',
        partRef: {
          kind: 'catalog',
          catalogPartId: 'esp32-devkit-v1',
          description: '',
          reason: '',
        },
        interface: 'gpio',
        voltage: '3V3',
        beginnerConnection: 'Use a dev board with labeled headers.',
      },
    ],
  },
  connections: {
    connections: [],
    powerNotes: ['Use a suitable external power supply for heaters.'],
    warnings: ['Do not drive heaters directly from GPIO.'],
  },
  review: {
    summary: 'Needs thermal safety review.',
    warnings: ['Add a thermal cutoff.'],
    openQuestions: ['What heater power is required?'],
    nextSteps: ['Choose a specific heater module.'],
  },
  spec,
}

describe('projectService', () => {
  beforeEach(() => {
    invokeFunction.mockReset()
    vi.stubGlobal('sessionStorage', createMemoryStorage())
  })

  it('generates a spec and stores it as a local draft project', async () => {
    invokeFunction.mockResolvedValue({
      data: { plan },
      error: null,
    })

    const project = await createProjectFromPrompt(' desktop filament dryer ')

    expect(invokeFunction).toHaveBeenCalledWith('generate-hardware', {
      body: { prompt: 'desktop filament dryer' },
    })
    expect(project.title).toBe(spec.title)
    expect(project.prompt).toBe('desktop filament dryer')
    expect(project.spec).toEqual(spec)
    expect(project.plan).toEqual(plan)

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
