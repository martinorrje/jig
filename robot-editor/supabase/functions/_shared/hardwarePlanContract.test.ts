import { describe, expect, test } from 'vitest'
import {
  describeHardwarePlanValidationErrors,
  isComponentSelection,
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
