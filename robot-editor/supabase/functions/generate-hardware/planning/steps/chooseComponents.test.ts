import { describe, expect, test } from 'vitest'
import { buildComponentsPrompt } from './chooseComponents.ts'

describe('buildComponentsPrompt', () => {
  test('includes catalog ids and instructs the model to use part references', () => {
    const prompt = buildComponentsPrompt({
      prompt: 'Build a desk plant monitor.',
      overview: {
        title: 'Desk Plant Monitor',
        summary: 'A compact monitor for a desk plant.',
        requirements: ['Measure soil moisture.'],
        constraints: ['Use beginner-friendly modules.'],
        assumptions: ['The plant is indoors.'],
        risks: ['Moisture probes can corrode.'],
      },
      architecture: {
        subsystems: [
          {
            id: 'controller',
            name: 'Controller',
            purpose: 'Read sensors and report status.',
          },
        ],
      },
    })

    expect(prompt).toContain('partRef.kind to "catalog"')
    expect(prompt).toContain('partRef.kind to "unresolved"')
    expect(prompt).toContain('catalogPartId as an empty string')
    expect(prompt).toContain(
      'esp32-devkit-v1: ESP32 DevKit-style development board',
    )
    expect(prompt).toContain('mount-hole-front-left')
  })
})
