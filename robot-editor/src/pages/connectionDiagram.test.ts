import { describe, expect, test } from 'vitest'
import type { HardwarePlan } from '../model/types'
import {
  createConnectionDiagramModel,
  createDiagramNodeLayout,
  shouldShowConnectionDiagram,
} from './connectionDiagramModel'

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
        id: 'control',
        name: 'Control',
        purpose: 'Read the sensor.',
      },
    ],
  },
  components: {
    components: [
      {
        id: 'esp32',
        name: 'ESP32 Feather',
        role: 'controller',
        category: 'controller',
        partRef: {
          kind: 'catalog',
          catalogPartId: '5400-esp32-feather-v2',
          description: '',
          reason: '',
        },
        interface: 'i2c',
        voltage: '3.3V',
        beginnerConnection: 'Use the STEMMA QT port.',
      },
      {
        id: 'sensor',
        name: 'Unknown sensor',
        role: 'measurement',
        category: 'sensor',
        partRef: {
          kind: 'unresolved',
          catalogPartId: '',
          description: 'A connectorized soil sensor',
          reason: 'No exact catalog match selected',
        },
        interface: 'i2c',
        voltage: '3.3V',
        beginnerConnection: 'Use a STEMMA QT compatible cable.',
      },
    ],
  },
  connections: {
    connections: [
      {
        id: 'i2c-bus',
        fromComponentId: 'esp32',
        fromPort: 'stemma-qt-i2c',
        toComponentId: 'sensor',
        toPort: 'stemma-qt',
        interface: 'i2c',
        physicalMethod: 'STEMMA QT / Qwiic cable',
        connectorStandard: 'stemma-qt',
        busVoltage: '3.3V',
      },
      {
        id: 'missing-target',
        fromComponentId: 'esp32',
        fromPort: 'stemma-qt-i2c',
        toComponentId: 'missing',
        toPort: 'stemma-qt',
        interface: 'i2c',
        physicalMethod: 'STEMMA QT / Qwiic cable',
        connectorStandard: 'stemma-qt',
        busVoltage: '3.3V',
      },
    ],
    powerNotes: [],
    warnings: [],
  },
  power: {
    primarySource: 'USB power bank',
    inputVoltage: '5V USB input',
    regulatedRails: ['3.3V logic rail for STEMMA QT modules.'],
    distribution: ['USB powers the ESP32 board and STEMMA QT bus.'],
    userInstructions: ['Connect USB power after checking cable orientation.'],
    safetyNotes: ['Use a current-limited source for first power-up.'],
  },
  review: {
    summary: 'Review summary',
    warnings: [],
    openQuestions: [],
    nextSteps: [],
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

describe('connection diagram model', () => {
  test('resolves catalog images and keeps unresolved nodes as placeholders', () => {
    const model = createConnectionDiagramModel(plan)

    expect(model.nodes).toEqual([
      expect.objectContaining({
        id: 'esp32',
        catalogPartId: '5400-esp32-feather-v2',
        imageAlt: '5400 ESP32 Feather V2',
      }),
      expect.objectContaining({
        id: 'sensor',
      }),
    ])
    expect(model.nodes[0]?.imageUrl).toContain('adafruit_5400')
    expect(model.nodes[1]).not.toHaveProperty('imageUrl')
    expect(model.nodes[1]).not.toHaveProperty('catalogPartId')
  })

  test('creates edges for valid generated connections and reports missing endpoints', () => {
    const model = createConnectionDiagramModel(plan)

    expect(model.edges).toEqual([
      {
        id: 'i2c-bus',
        fromNodeId: 'esp32',
        fromPort: 'stemma-qt-i2c',
        toNodeId: 'sensor',
        toPort: 'stemma-qt',
        label: 'i2c · stemma-qt · 3.3V',
        physicalMethod: 'STEMMA QT / Qwiic cable',
      },
    ])
    expect(model.issues).toEqual([
      {
        id: 'missing-target',
        label: 'i2c · stemma-qt · 3.3V',
        detail:
          'Could not draw esp32.stemma-qt-i2c -> missing.stemma-qt; missing to component "missing" in the component list.',
      },
    ])
  })

  test('shows the diagram when a plan has generated connections', () => {
    expect(shouldShowConnectionDiagram(plan)).toBe(true)
    expect(
      shouldShowConnectionDiagram({
        ...plan,
        connections: {
          connections: [plan.connections.connections[1]!],
          powerNotes: [],
          warnings: [],
        },
      }),
    ).toBe(true)
    expect(
      shouldShowConnectionDiagram({
        ...plan,
        connections: { connections: [], powerNotes: [], warnings: [] },
      }),
    ).toBe(false)
  })

  test('lays connected components out by graph direction instead of input order', () => {
    const layout = createDiagramNodeLayout(
      [
        { id: 'light', name: 'Light', role: 'load', category: 'actuator' },
        {
          id: 'controller',
          name: 'ESP32 Controller',
          role: 'controller',
          category: 'controller',
        },
        { id: 'driver', name: 'LED Driver', role: 'driver', category: 'driver' },
        { id: 'knob', name: 'Knob', role: 'input', category: 'input' },
      ],
      [
        {
          id: 'controller-knob',
          fromNodeId: 'controller',
          fromPort: 'stemma',
          toNodeId: 'knob',
          toPort: 'stemma',
          label: 'i2c · stemma-qt · 3.3V',
          physicalMethod: 'STEMMA QT cable',
        },
        {
          id: 'knob-driver',
          fromNodeId: 'knob',
          fromPort: 'stemma',
          toNodeId: 'driver',
          toPort: 'stemma',
          label: 'i2c · stemma-qt · 3.3V',
          physicalMethod: 'STEMMA QT cable',
        },
        {
          id: 'driver-light',
          fromNodeId: 'driver',
          fromPort: 'out',
          toNodeId: 'light',
          toPort: 'in',
          label: 'power · stemma-qt · 3.3V',
          physicalMethod: 'STEMMA QT cable',
        },
      ],
    )

    expect(layout).toEqual([
      { nodeId: 'controller', column: 0, row: 0 },
      { nodeId: 'knob', column: 1, row: 0 },
      { nodeId: 'driver', column: 2, row: 0 },
      { nodeId: 'light', column: 3, row: 0 },
    ])
  })
})
