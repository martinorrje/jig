import { describe, expect, test } from 'vitest'
import { buildConnectionsPrompt } from './generateConnections.ts'

describe('buildConnectionsPrompt', () => {
  test('restricts v1 wiring to 3.3V STEMMA QT and Qwiic cables', () => {
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
    })

    expect(prompt).toContain('Qwiic')
    expect(prompt).toContain('STEMMA QT')
    expect(prompt).toContain('Only use STEMMA QT / Qwiic connectorized cable connections')
    expect(prompt).toContain('Use 3.3V for every STEMMA QT / Qwiic bus')
    expect(prompt).toContain('Never use 5V for a Qwiic-compatible bus')
    expect(prompt).toContain(
      'fromComponentId and toComponentId must exactly match component ids',
    )
    expect(prompt).not.toContain('Grove')
  })
})
