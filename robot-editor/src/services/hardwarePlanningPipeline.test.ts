import { describe, expect, test } from 'vitest'
import { runHardwarePlanningPipeline } from '../../supabase/functions/generate-hardware/planning/runHardwarePlanningPipeline.ts'
import { assembleHardwarePlan } from '../../supabase/functions/generate-hardware/planning/steps/assembleHardwarePlan.ts'
import type { PlanningStep } from '../../supabase/functions/generate-hardware/planning/planningTypes.ts'

describe('runHardwarePlanningPipeline', () => {
  test('returns the plan produced by the configured steps', async () => {
    const plan = {
      overview: {
        title: 'Minimal Plan',
        summary: 'A minimal assembled plan.',
        requirements: [],
        constraints: [],
        assumptions: [],
        risks: [],
      },
      architecture: { subsystems: [] },
      components: { components: [] },
      connections: { connections: [], powerNotes: [], warnings: [] },
      review: {
        summary: 'No review notes.',
        warnings: [],
        openQuestions: [],
        nextSteps: [],
      },
      spec: {
        title: 'Minimal Plan',
        summary: 'A minimal assembled plan.',
        requirements: [],
        constraints: [],
        assumptions: [],
        risks: [],
      },
    }

    await expect(
      runHardwarePlanningPipeline('Build anything.', [
        async (context) => ({ ...context, plan }),
      ]),
    ).resolves.toEqual(plan)
  })

  test('runs planning steps in order and returns a composed hardware plan', async () => {
    const calls: string[] = []

    const steps: PlanningStep[] = [
      async ({ prompt }) => {
        calls.push(`overview:${prompt}`)
        return {
          prompt,
          overview: {
            title: 'Desk Plant Monitor',
            summary: 'A compact monitor for a desk plant.',
            requirements: ['Measure soil moisture.'],
            constraints: ['Use beginner-friendly modules.'],
            assumptions: ['The plant is indoors.'],
            risks: ['Moisture probes can corrode.'],
          },
        }
      },
      async ({ prompt, overview }) => {
        if (!overview) throw new Error('Missing overview')
        calls.push(`architecture:${overview.title}`)
        return {
          prompt,
          overview,
          architecture: {
            subsystems: [
              {
                id: 'controller',
                name: 'Controller',
                purpose: 'Read sensors and report status.',
              },
            ],
          },
        }
      },
      async ({ prompt, overview, architecture }) => {
        if (!overview || !architecture) {
          throw new Error('Missing architecture input')
        }
        calls.push(`components:${architecture.subsystems[0]?.id}`)
        return {
          prompt,
          overview,
          architecture,
          components: {
            components: [
              {
                id: 'esp32',
                name: 'ESP32 dev board',
                role: 'controller',
                category: 'controller',
                interface: 'gpio',
                voltage: '3V3',
                beginnerConnection: 'Use a dev board with labeled headers.',
              },
            ],
          },
        }
      },
      async ({ prompt, overview, architecture, components }) => {
        if (!overview || !architecture || !components) {
          throw new Error('Missing connection input')
        }
        calls.push(`connections:${components.components[0]?.id}`)
        return {
          prompt,
          overview,
          architecture,
          components,
          connections: {
            connections: [
              {
                id: 'esp32-ground',
                fromComponentId: 'esp32',
                fromPort: 'GND',
                toComponentId: 'sensor',
                toPort: 'GND',
                interface: 'power',
                physicalMethod: 'jumper-wire',
              },
            ],
            powerNotes: ['Use a shared ground.'],
            warnings: ['Do not connect high-current loads to GPIO.'],
          },
        }
      },
      async ({ prompt, overview, architecture, components, connections }) => {
        if (!overview || !architecture || !components || !connections) {
          throw new Error('Missing review input')
        }
        calls.push(`review:${connections.connections[0]?.id}`)
        return {
          prompt,
          overview,
          architecture,
          components,
          connections,
          review: {
            summary: 'Safe for a beginner prototype.',
            warnings: ['Use a corrosion-resistant probe.'],
            openQuestions: ['Should the monitor be battery powered?'],
            nextSteps: ['Choose a specific ESP32 board.'],
          },
        }
      },
      assembleHardwarePlan,
    ]

    const plan = await runHardwarePlanningPipeline(
      'Build a desk plant monitor.',
      steps,
    )

    expect(calls).toEqual([
      'overview:Build a desk plant monitor.',
      'architecture:Desk Plant Monitor',
      'components:controller',
      'connections:esp32',
      'review:esp32-ground',
    ])

    expect(plan.spec).toEqual({
      title: 'Desk Plant Monitor',
      summary: 'A compact monitor for a desk plant.',
      requirements: ['Measure soil moisture.', 'Controller: Read sensors and report status.'],
      constraints: ['Use beginner-friendly modules.'],
      assumptions: ['The plant is indoors.'],
      risks: [
        'Moisture probes can corrode.',
        'Do not connect high-current loads to GPIO.',
        'Use a corrosion-resistant probe.',
      ],
    })
  })
})
