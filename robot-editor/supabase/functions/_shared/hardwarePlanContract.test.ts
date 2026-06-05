import { describe, expect, test } from 'vitest'
import {
  describeHardwarePlanValidationErrors,
  isHardwarePlan,
  isConnectionPlan,
  isComponentSelection,
  isPowerPlan,
  normalizeHardwarePlan,
} from './hardwarePlanContract.ts'

const baseComponent = {
  id: 'esp32',
  name: 'ESP32 dev board',
  role: 'controller',
  category: 'controller',
  interface: 'gpio',
  voltage: '3V3',
  beginnerConnection: 'Use a dev board with labeled headers.',
}

describe('isComponentSelection', () => {
  test('accepts catalog-backed component references', () => {
    expect(
      isComponentSelection({
        components: [
          {
            ...baseComponent,
            partRef: {
              kind: 'catalog',
              catalogPartId: 'esp32-devkit-v1',
              description: '',
              reason: '',
            },
          },
        ],
      }),
    ).toBe(true)
  })

  test('accepts catalog-backed component references with explanatory text', () => {
    expect(
      isComponentSelection({
        components: [
          {
            ...baseComponent,
            partRef: {
              kind: 'catalog',
              catalogPartId: 'esp32-devkit-v1',
              description: 'ESP32 DevKit-style development board.',
              reason: 'A good beginner controller for Wi-Fi hardware.',
            },
          },
        ],
      }),
    ).toBe(true)
  })

  test('accepts unresolved component references', () => {
    expect(
      isComponentSelection({
        components: [
          {
            ...baseComponent,
            name: 'Small 5V fan',
            role: 'air circulation',
            category: 'actuator',
            partRef: {
              kind: 'unresolved',
              catalogPartId: '',
              description: 'A small 5V fan, approximately 40 mm square.',
              reason: 'No matching fan exists in the current catalog.',
            },
          },
        ],
      }),
    ).toBe(true)
  })

  test('rejects components that only use the old flat catalogPartId field', () => {
    expect(
      isComponentSelection({
        components: [
          {
            ...baseComponent,
            catalogPartId: 'esp32-devkit-v1',
          },
        ],
      }),
    ).toBe(false)
  })

  test('describes invalid component validation failures', () => {
    expect(
      describeHardwarePlanValidationErrors({
        overview: {},
        architecture: {},
        components: {
          components: [
            {
              ...baseComponent,
              partRef: {
                kind: 'made-up-kind',
                catalogPartId: '',
                description: '',
                reason: '',
              },
            },
          ],
        },
        connections: {},
        review: {},
        spec: {},
      }),
    ).toContain('components.components[0].partRef is invalid')
  })
})

describe('isConnectionPlan', () => {
  test('accepts 3.3V STEMMA QT / Qwiic connectorized connections', () => {
    expect(
      isConnectionPlan({
        connections: [
          {
            id: 'controller-to-sensor',
            fromComponentId: 'controller',
            fromPort: 'stemma-qt',
            toComponentId: 'sensor',
            toPort: 'stemma-qt',
            interface: 'i2c',
            physicalMethod: 'STEMMA QT / Qwiic cable',
            connectorStandard: 'stemma-qt',
            busVoltage: '3.3V',
          },
        ],
        powerNotes: [],
        warnings: [],
      }),
    ).toBe(true)
  })

  test('rejects Qwiic-compatible connections without an explicit 3.3V bus', () => {
    expect(
      isConnectionPlan({
        connections: [
          {
            id: 'controller-to-sensor',
            fromComponentId: 'controller',
            fromPort: 'stemma-qt',
            toComponentId: 'sensor',
            toPort: 'stemma-qt',
            interface: 'i2c',
            physicalMethod: 'STEMMA QT / Qwiic cable',
            connectorStandard: 'qwiic',
            busVoltage: '5V',
          },
        ],
        powerNotes: [],
        warnings: [],
      }),
    ).toBe(false)
  })
})

describe('isPowerPlan', () => {
  test('accepts explicit hardware power instructions', () => {
    expect(
      isPowerPlan({
        primarySource: 'USB-C wall adapter',
        inputVoltage: '5V USB input',
        regulatedRails: ['3.3V logic rail from the controller regulator.'],
        distribution: ['USB-C powers the controller and STEMMA QT bus.'],
        userInstructions: ['Plug in USB-C after all modules are connected.'],
        safetyNotes: ['Use a current-limited supply during first bring-up.'],
      }),
    ).toBe(true)
  })
})

describe('isHardwarePlan', () => {
  test('accepts plans without review nextSteps', () => {
    expect(
      isHardwarePlan({
        overview: {
          title: 'Desk Plant Monitor',
          summary: 'A compact monitor for a desk plant.',
          requirements: ['Measure soil moisture.'],
          constraints: ['Use connectorized parts.'],
          assumptions: ['The plant is indoors.'],
          risks: ['Moisture probes can corrode.'],
        },
        architecture: { subsystems: [] },
        components: {
          components: [
            {
              ...baseComponent,
              partRef: {
                kind: 'catalog',
                catalogPartId: '5400-esp32-feather-v2',
                description: '',
                reason: '',
              },
            },
          ],
        },
        connections: { connections: [], powerNotes: [], warnings: [] },
        power: {
          primarySource: 'USB-C wall adapter',
          inputVoltage: '5V USB input',
          regulatedRails: ['3.3V logic rail from the controller regulator.'],
          distribution: ['USB-C powers the controller and STEMMA QT bus.'],
          userInstructions: ['Plug in USB-C after all modules are connected.'],
          safetyNotes: ['Use a current-limited supply during first bring-up.'],
        },
        review: {
          summary: 'Ready for review.',
          warnings: [],
          openQuestions: [],
        },
        spec: {
          title: 'Desk Plant Monitor',
          summary: 'A compact monitor for a desk plant.',
          requirements: ['Measure soil moisture.'],
          constraints: ['Use connectorized parts.'],
          assumptions: ['The plant is indoors.'],
          risks: ['Moisture probes can corrode.'],
        },
      }),
    ).toBe(true)
  })

  test('normalizes legacy connections into current connectorized connections', () => {
    const normalized = normalizeHardwarePlan({
      overview: {
        title: 'Desk Plant Monitor',
        summary: 'A compact monitor for a desk plant.',
        requirements: ['Measure soil moisture.'],
        constraints: ['Use connectorized parts.'],
        assumptions: ['The plant is indoors.'],
        risks: ['Moisture probes can corrode.'],
      },
      architecture: { subsystems: [] },
      components: {
        components: [
          {
            ...baseComponent,
            partRef: {
              kind: 'catalog',
              catalogPartId: '5400-esp32-feather-v2',
              description: '',
              reason: '',
            },
          },
        ],
      },
      connections: {
        connections: [
          {
            id: 'controller-to-sensor',
            fromComponentId: 'controller',
            fromPort: 'stemma-qt',
            toComponentId: 'sensor',
            toPort: 'stemma-qt',
            interface: 'i2c',
            physicalMethod: 'STEMMA QT cable',
          },
        ],
        powerNotes: ['USB-C powers the controller.'],
        warnings: [],
      },
      review: {
        summary: 'Ready for review.',
        warnings: [],
        openQuestions: [],
      },
      spec: {
        title: 'Desk Plant Monitor',
        summary: 'A compact monitor for a desk plant.',
        requirements: ['Measure soil moisture.'],
        constraints: ['Use connectorized parts.'],
        assumptions: ['The plant is indoors.'],
        risks: ['Moisture probes can corrode.'],
      },
    })

    expect(isHardwarePlan(normalized)).toBe(true)
    const normalizedPlan = normalized as {
      connections: { connections: Array<Record<string, unknown>> }
      power: Record<string, unknown>
    }
    expect(normalizedPlan.connections.connections[0]).toEqual(
      expect.objectContaining({
        connectorStandard: 'stemma-qt',
        busVoltage: '3.3V',
      }),
    )
    expect(normalizedPlan.power).toEqual(
      expect.objectContaining({
        primarySource:
          'User-provided external power source appropriate for the selected modules.',
        distribution: ['USB-C powers the controller.'],
      }),
    )
  })
})
