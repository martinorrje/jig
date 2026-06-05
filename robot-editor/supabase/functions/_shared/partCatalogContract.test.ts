import { describe, expect, test } from 'vitest'
import {
  connectorStandards,
  isCatalogPart,
  type CatalogPart,
} from './partCatalogContract.ts'

describe('connectorStandards', () => {
  test('defaults STEMMA QT and Qwiic-compatible buses to 3.3V', () => {
    expect(connectorStandards['stemma-qt']).toMatchObject({
      nominalVoltage: '3.3V',
      maxBusVoltage: 3.3,
      carries: ['power', 'ground', 'i2c-sda', 'i2c-scl'],
    })
    expect(connectorStandards.qwiic).toMatchObject({
      nominalVoltage: '3.3V',
      maxBusVoltage: 3.3,
      carries: ['power', 'ground', 'i2c-sda', 'i2c-scl'],
    })
  })
})

describe('isCatalogPart', () => {
  test('accepts catalog parts with connector ports that reference standards', () => {
    const part: CatalogPart = {
      id: 'stemma-test-part',
      name: 'STEMMA test part',
      category: 'sensor',
      description: 'Test part.',
      tags: ['stemma'],
      attachmentPoints: [],
      connectorPorts: [
        {
          id: 'stemma-qt',
          label: 'STEMMA QT connector',
          standard: 'stemma-qt',
          compatibleStandards: ['stemma-qt', 'qwiic'],
          notes: 'Use this as a 3.3V connectorized I2C cable.',
        },
      ],
      electricalPorts: [],
    }

    expect(isCatalogPart(part)).toBe(true)
  })
})
