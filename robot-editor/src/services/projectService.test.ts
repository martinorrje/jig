import { FunctionsHttpError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HardwarePlan, HardwareSpec } from '../model/types'
import { supabase } from '../lib/supabase'
import {
  createProjectFromPrompt,
  generateCadForProject,
  loadProject,
} from './projectService'

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
  power: {
    primarySource: 'External DC power supply',
    inputVoltage: 'To be selected for the heater module.',
    regulatedRails: ['3.3V logic rail from the ESP32 board regulator.'],
    distribution: [
      'External supply powers heater circuitry through a suitable driver.',
      'ESP32 board powers low-current logic and connectorized modules.',
    ],
    userInstructions: ['Confirm heater voltage and current before connecting power.'],
    safetyNotes: ['Use a fused or current-limited supply during bring-up.'],
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
      body: { mode: 'plan', prompt: 'desktop filament dryer' },
    })
    expect(project.title).toBe(spec.title)
    expect(project.prompt).toBe('desktop filament dryer')
    expect(project.spec).toEqual(spec)
    expect(project.plan).toEqual(plan)
    expect(project.cad).toEqual({ status: 'loading' })

    const loadedProject = await loadProject(project.id)
    expect(loadedProject).toEqual(project)
  })

  it('generates CAD for a stored project and updates the local draft', async () => {
    invokeFunction
      .mockResolvedValueOnce({
        data: { plan },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          cad: {
            status: 'succeeded',
            build123dCode: 'shell = Box(1, 1, 1)',
            workerResult: {
              storage: {
                step: { bucket: 'cad-artifacts', path: 'cad/project/shell.step' },
                stl: { bucket: 'cad-artifacts', path: 'cad/project/shell.stl' },
              },
            },
          },
        },
        error: null,
      })

    const project = await createProjectFromPrompt('desktop filament dryer')
    const updatedProject = await generateCadForProject(project.id)

    expect(invokeFunction).toHaveBeenLastCalledWith('generate-hardware', {
      body: {
        mode: 'cad',
        prompt: 'desktop filament dryer',
        plan,
      },
    })
    expect(updatedProject.cad).toEqual({
      status: 'ready',
      build123dCode: 'shell = Box(1, 1, 1)',
      workerResult: {
        storage: {
          step: { bucket: 'cad-artifacts', path: 'cad/project/shell.step' },
          stl: { bucket: 'cad-artifacts', path: 'cad/project/shell.stl' },
        },
      },
    })
    await expect(loadProject(project.id)).resolves.toEqual(updatedProject)
  })

  it('throws when a local draft project cannot be found', async () => {
    await expect(loadProject('missing-project')).rejects.toThrow(
      'Project not found.',
    )
  })

  it('keeps a stored legacy connection plan by adding default connector metadata', async () => {
    const now = '2026-06-05T00:00:00.000Z'
    const legacyPlan = {
      ...plan,
      connections: {
        connections: [
          {
            id: 'old-connection',
            fromComponentId: 'esp32',
            fromPort: 'stemma',
            toComponentId: 'sensor',
            toPort: 'stemma',
            interface: 'i2c',
            physicalMethod: 'STEMMA QT cable',
          },
        ],
        powerNotes: [],
        warnings: [],
      },
    }

    sessionStorage.setItem(
      'jig.localProject.old-plan',
      JSON.stringify({
        id: 'old-plan',
        title: spec.title,
        prompt: 'desktop filament dryer',
        spec,
        plan: legacyPlan,
        cad: { status: 'loading' },
        createdAt: now,
        updatedAt: now,
      }),
    )

    await expect(loadProject('old-plan')).resolves.toEqual({
      id: 'old-plan',
      title: spec.title,
      prompt: 'desktop filament dryer',
      spec,
      plan: {
        ...legacyPlan,
        connections: {
          connections: [
            {
              id: 'old-connection',
              fromComponentId: 'esp32',
              fromPort: 'stemma',
              toComponentId: 'sensor',
              toPort: 'stemma',
              interface: 'i2c',
              physicalMethod: 'STEMMA QT cable',
              connectorStandard: 'stemma-qt',
              busVoltage: '3.3V',
            },
          ],
          powerNotes: [],
          warnings: [],
        },
      },
      cad: { status: 'loading' },
      createdAt: now,
      updatedAt: now,
    })
  })

  it('keeps a stored plan when review nextSteps is absent', async () => {
    const now = '2026-06-05T00:00:00.000Z'
    const reviewWithoutNextSteps = { ...plan.review }
    delete reviewWithoutNextSteps.nextSteps
    const planWithoutNextSteps = {
      ...plan,
      review: reviewWithoutNextSteps,
    }

    sessionStorage.setItem(
      'jig.localProject.no-review-next-steps',
      JSON.stringify({
        id: 'no-review-next-steps',
        title: spec.title,
        prompt: 'desktop filament dryer',
        spec,
        plan: planWithoutNextSteps,
        cad: { status: 'loading' },
        createdAt: now,
        updatedAt: now,
      }),
    )

    await expect(loadProject('no-review-next-steps')).resolves.toEqual({
      id: 'no-review-next-steps',
      title: spec.title,
      prompt: 'desktop filament dryer',
      spec,
      plan: planWithoutNextSteps,
      cad: { status: 'loading' },
      createdAt: now,
      updatedAt: now,
    })
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
