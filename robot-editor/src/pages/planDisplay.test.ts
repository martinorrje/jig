import { describe, expect, test } from 'vitest'
import type { HardwarePlan } from '../model/types'
import { createPlanDisplaySections } from './planDisplay'

const plan: HardwarePlan = {
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
  connections: {
    connections: [
      {
        id: 'esp32-ground',
        fromComponentId: 'esp32',
        fromPort: 'stemma-qt',
        toComponentId: 'sensor',
        toPort: 'stemma-qt',
        interface: 'i2c',
        physicalMethod: 'STEMMA QT / Qwiic cable',
        connectorStandard: 'stemma-qt',
        busVoltage: '3.3V',
      },
    ],
    powerNotes: ['Use a shared ground.'],
    warnings: ['Do not drive high-current loads from GPIO.'],
  },
  power: {
    primarySource: 'USB power bank',
    inputVoltage: '5V USB input',
    regulatedRails: ['3.3V logic rail from the ESP32 board regulator.'],
    distribution: [
      'USB power feeds the ESP32 board.',
      'The ESP32 STEMMA QT port powers the I2C sensor bus at 3.3V.',
    ],
    userInstructions: ['Plug the USB cable into the power bank after assembly.'],
    safetyNotes: ['Use a current-limited USB source for first power-up.'],
  },
  review: {
    summary: 'Safe for a beginner prototype.',
    warnings: ['Use a corrosion-resistant probe.'],
    openQuestions: ['Should this be battery powered?'],
    nextSteps: ['Choose a specific ESP32 board.'],
  },
  spec: {
    title: 'Desk Plant Monitor',
    summary: 'A compact monitor for a desk plant.',
    requirements: ['Measure soil moisture.'],
    constraints: ['Use beginner-friendly modules.'],
    assumptions: ['The plant is indoors.'],
    risks: ['Moisture probes can corrode.'],
  },
}

describe('createPlanDisplaySections', () => {
  test('includes every planning stage that should be shown on the spec page', () => {
    expect(createPlanDisplaySections(plan)).toEqual([
      {
        title: 'Product overview',
        items: [
          'Title: Desk Plant Monitor',
          'Summary: A compact monitor for a desk plant.',
          'Requirement: Measure soil moisture.',
          'Constraint: Use beginner-friendly modules.',
          'Assumption: The plant is indoors.',
          'Risk: Moisture probes can corrode.',
        ],
      },
      {
        title: 'Architecture',
        items: ['Controller (controller): Read sensors and report status.'],
      },
      {
        title: 'Components',
        items: [
          'ESP32 dev board (esp32, catalog: esp32-devkit-v1): controller; controller; gpio; 3V3; Use a dev board with labeled headers.',
        ],
      },
      {
        title: 'Connections',
        items: [
          'esp32-ground: esp32.stemma-qt -> sensor.stemma-qt (i2c, STEMMA QT / Qwiic cable, stemma-qt, 3.3V)',
        ],
      },
      {
        title: 'Power notes',
        items: ['Use a shared ground.'],
      },
      {
        title: 'Power',
        items: [
          'Primary source: USB power bank',
          'Input voltage: 5V USB input',
          'Rail: 3.3V logic rail from the ESP32 board regulator.',
          'Distribution: USB power feeds the ESP32 board.',
          'Distribution: The ESP32 STEMMA QT port powers the I2C sensor bus at 3.3V.',
          'Instruction: Plug the USB cable into the power bank after assembly.',
          'Safety: Use a current-limited USB source for first power-up.',
        ],
      },
      {
        title: 'Connection warnings',
        items: ['Do not drive high-current loads from GPIO.'],
      },
      {
        title: 'Review warnings',
        items: ['Use a corrosion-resistant probe.'],
      },
      {
        title: 'Open questions',
        items: ['Should this be battery powered?'],
      },
      {
        title: 'Next steps',
        items: ['Choose a specific ESP32 board.'],
      },
    ])
  })
})
