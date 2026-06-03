import { describe, expect, test } from 'vitest'
import { buildConnectionsPrompt } from './generateConnections.ts'

describe('buildConnectionsPrompt', () => {
  test('defines connectorized physical methods with beginner module ecosystems', () => {
    const prompt = buildConnectionsPrompt({
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
    })

    expect(prompt).toContain('Grove')
    expect(prompt).toContain('Qwiic')
    expect(prompt).toContain('STEMMA')
    expect(prompt).toContain('STEMMA QT')
  })
})
