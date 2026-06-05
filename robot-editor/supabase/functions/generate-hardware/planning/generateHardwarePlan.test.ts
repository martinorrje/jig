import { describe, expect, test } from 'vitest'
import { buildHardwarePlanPrompt, normalizeHardwarePlan } from './generateHardwarePlan.ts'

describe('buildHardwarePlanPrompt', () => {
  test('asks for one complete plan while keeping catalog and wiring rules', () => {
    const prompt = buildHardwarePlanPrompt('Build a speaker module.')

    expect(prompt).toContain('Generate a complete beginner-friendly hardware plan')
    expect(prompt).toContain('Prefer catalog parts whenever possible')
    expect(prompt).toContain('ESP32-compatible')
    expect(prompt).toContain('Only choose connectorized STEMMA QT / Qwiic parts for v1')
    expect(prompt).toContain('Never use 5V for a Qwiic-compatible bus')
    expect(prompt).toContain('Always include a power section')
    expect(prompt).toContain('primary source, input voltage, regulated rails')
    expect(prompt).not.toContain('Grove')
    expect(prompt).toContain('Part catalog:')
  })
})

describe('normalizeHardwarePlan', () => {
  test('normalizes invalid component part refs into unresolved refs', () => {
    const plan = normalizeHardwarePlan({
      overview: {
        title: 'Speaker Module',
        summary: 'A small speaker module.',
        requirements: [],
        constraints: [],
        assumptions: [],
        risks: [],
      },
      architecture: { subsystems: [] },
      components: {
        components: [
          {
            id: 'battery',
            name: 'Battery pack',
            role: 'power',
            category: 'power',
            partRef: {
              kind: 'none',
              catalogPartId: '',
              description: '',
              reason: '',
            },
            interface: 'power',
            voltage: '5V',
            beginnerConnection: 'Use a connectorized battery pack.',
          },
        ],
      },
      connections: { connections: [], powerNotes: [], warnings: [] },
      review: { summary: '', warnings: [], openQuestions: [], nextSteps: [] },
      spec: {
        title: 'Speaker Module',
        summary: 'A small speaker module.',
        requirements: [],
        constraints: [],
        assumptions: [],
        risks: [],
      },
    })

    expect(plan.components.components[0].partRef).toEqual({
      kind: 'unresolved',
      catalogPartId: '',
      description: 'Battery pack',
      reason: 'No matching catalog part was selected.',
    })
    expect(plan.power).toEqual(
      expect.objectContaining({
        primarySource:
          'User-provided external power source appropriate for the selected modules.',
        regulatedRails: ['3.3V logic rail for STEMMA QT / Qwiic I2C modules.'],
      }),
    )
  })
})
