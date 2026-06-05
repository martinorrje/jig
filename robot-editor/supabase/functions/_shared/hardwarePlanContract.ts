import {
  hardwareSpecSchema,
  isHardwareSpec,
  type HardwareSpec,
} from './hardwareSpecContract.ts'
import type { ConnectorStandardId } from './partCatalogContract.ts'

export type ProductOverview = HardwareSpec

export type SystemArchitecture = {
  subsystems: Array<{
    id: string
    name: string
    purpose: string
  }>
}

export type ComponentPartRef =
  | {
      kind: 'catalog'
      catalogPartId: string
      description: string
      reason: string
    }
  | {
      kind: 'unresolved'
      catalogPartId: ''
      description: string
      reason: string
    }

export type ComponentSelection = {
  components: Array<{
    id: string
    name: string
    role: string
    category: string
    partRef: ComponentPartRef
    interface: string
    voltage: string
    beginnerConnection: string
  }>
}

export type ConnectionPlan = {
  connections: Array<{
    id: string
    fromComponentId: string
    fromPort: string
    toComponentId: string
    toPort: string
    interface: string
    physicalMethod: string
    connectorStandard: ConnectorStandardId
    busVoltage: '3.3V'
  }>
  powerNotes: string[]
  warnings: string[]
}

export type PowerPlan = {
  primarySource: string
  inputVoltage: string
  regulatedRails: string[]
  distribution: string[]
  userInstructions: string[]
  safetyNotes: string[]
}

export type PlanReview = {
  summary: string
  warnings: string[]
  openQuestions: string[]
  nextSteps?: string[]
}

export type HardwarePlan = {
  overview: ProductOverview
  architecture: SystemArchitecture
  components: ComponentSelection
  connections: ConnectionPlan
  power: PowerPlan
  review: PlanReview
  spec: HardwareSpec
}

const stringProperty = { type: 'string' } as const
const stringArrayProperty = {
  type: 'array',
  items: stringProperty,
} as const
const partRefProperty = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: {
      type: 'string',
      enum: ['catalog', 'unresolved'],
    },
    catalogPartId: stringProperty,
    description: stringProperty,
    reason: stringProperty,
  },
  required: ['kind', 'catalogPartId', 'description', 'reason'],
} as const

export const productOverviewSchema = hardwareSpecSchema

export const systemArchitectureSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    subsystems: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: stringProperty,
          name: stringProperty,
          purpose: stringProperty,
        },
        required: ['id', 'name', 'purpose'],
      },
    },
  },
  required: ['subsystems'],
} as const

export const componentSelectionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    components: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: stringProperty,
          name: stringProperty,
          role: stringProperty,
          category: stringProperty,
          partRef: partRefProperty,
          interface: stringProperty,
          voltage: stringProperty,
          beginnerConnection: stringProperty,
        },
        required: [
          'id',
          'name',
          'role',
          'category',
          'partRef',
          'interface',
          'voltage',
          'beginnerConnection',
        ],
      },
    },
  },
  required: ['components'],
} as const

export const connectionPlanSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    connections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: stringProperty,
          fromComponentId: stringProperty,
          fromPort: stringProperty,
          toComponentId: stringProperty,
          toPort: stringProperty,
          interface: stringProperty,
          physicalMethod: stringProperty,
          connectorStandard: {
            type: 'string',
            enum: ['stemma-qt', 'qwiic'],
          },
          busVoltage: {
            type: 'string',
            enum: ['3.3V'],
          },
        },
        required: [
          'id',
          'fromComponentId',
          'fromPort',
          'toComponentId',
          'toPort',
          'interface',
          'physicalMethod',
          'connectorStandard',
          'busVoltage',
        ],
      },
    },
    powerNotes: stringArrayProperty,
    warnings: stringArrayProperty,
  },
  required: ['connections', 'powerNotes', 'warnings'],
} as const

export const planReviewSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: stringProperty,
    warnings: stringArrayProperty,
    openQuestions: stringArrayProperty,
    nextSteps: stringArrayProperty,
  },
  required: ['summary', 'warnings', 'openQuestions'],
} as const

export const powerPlanSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    primarySource: stringProperty,
    inputVoltage: stringProperty,
    regulatedRails: stringArrayProperty,
    distribution: stringArrayProperty,
    userInstructions: stringArrayProperty,
    safetyNotes: stringArrayProperty,
  },
  required: [
    'primarySource',
    'inputVoltage',
    'regulatedRails',
    'distribution',
    'userInstructions',
    'safetyNotes',
  ],
} as const

export const hardwarePlanSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    overview: productOverviewSchema,
    architecture: systemArchitectureSchema,
    components: componentSelectionSchema,
    connections: connectionPlanSchema,
    power: powerPlanSchema,
    review: planReviewSchema,
    spec: hardwareSpecSchema,
  },
  required: [
    'overview',
    'architecture',
    'components',
    'connections',
    'power',
    'review',
    'spec',
  ],
} as const

export function isProductOverview(value: unknown): value is ProductOverview {
  return isHardwareSpec(value)
}

export function isSystemArchitecture(
  value: unknown,
): value is SystemArchitecture {
  if (!value || typeof value !== 'object') return false

  const architecture = value as Record<string, unknown>

  return (
    Array.isArray(architecture.subsystems) &&
    architecture.subsystems.every(isSubsystem)
  )
}

export function isComponentSelection(
  value: unknown,
): value is ComponentSelection {
  if (!value || typeof value !== 'object') return false

  const selection = value as Record<string, unknown>

  return (
    Array.isArray(selection.components) &&
    selection.components.every(isComponentCandidate)
  )
}

export function isConnectionPlan(value: unknown): value is ConnectionPlan {
  if (!value || typeof value !== 'object') return false

  const plan = value as Record<string, unknown>

  return (
    Array.isArray(plan.connections) &&
    plan.connections.every(isConnection) &&
    isStringArray(plan.powerNotes) &&
    isStringArray(plan.warnings)
  )
}

export function isPlanReview(value: unknown): value is PlanReview {
  if (!value || typeof value !== 'object') return false

  const review = value as Record<string, unknown>

  return (
    typeof review.summary === 'string' &&
    isStringArray(review.warnings) &&
    isStringArray(review.openQuestions) &&
    (review.nextSteps === undefined || isStringArray(review.nextSteps))
  )
}

export function isPowerPlan(value: unknown): value is PowerPlan {
  if (!value || typeof value !== 'object') return false

  const plan = value as Record<string, unknown>

  return (
    typeof plan.primarySource === 'string' &&
    typeof plan.inputVoltage === 'string' &&
    isStringArray(plan.regulatedRails) &&
    isStringArray(plan.distribution) &&
    isStringArray(plan.userInstructions) &&
    isStringArray(plan.safetyNotes)
  )
}

export function isHardwarePlan(value: unknown): value is HardwarePlan {
  if (!value || typeof value !== 'object') return false

  const plan = value as Record<string, unknown>

  return (
    isProductOverview(plan.overview) &&
    isSystemArchitecture(plan.architecture) &&
    isComponentSelection(plan.components) &&
    isConnectionPlan(plan.connections) &&
    isPowerPlan(plan.power) &&
    isPlanReview(plan.review) &&
    isHardwareSpec(plan.spec)
  )
}

export function normalizeHardwarePlan(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value

  const plan = value as Record<string, unknown>

  const connections =
    plan.connections && typeof plan.connections === 'object'
      ? (plan.connections as Record<string, unknown>)
      : null

  const normalizedConnections =
    connections && Array.isArray(connections.connections)
      ? {
          ...connections,
          connections: connections.connections.map(normalizeConnection),
        }
      : plan.connections

  return {
    ...plan,
    connections: normalizedConnections,
    power: isPowerPlan(plan.power)
      ? plan.power
      : createDefaultPowerPlan(connections),
  }
}

export function describeHardwarePlanValidationErrors(value: unknown) {
  const errors: string[] = []

  if (!value || typeof value !== 'object') {
    return ['plan must be an object']
  }

  const plan = value as Record<string, unknown>

  if (!isProductOverview(plan.overview)) errors.push('overview is invalid')
  if (!isSystemArchitecture(plan.architecture)) {
    errors.push('architecture is invalid')
  }
  if (!isComponentSelection(plan.components)) {
    errors.push(...describeComponentSelectionErrors(plan.components))
  }
  if (!isConnectionPlan(plan.connections)) errors.push('connections is invalid')
  if (!isPowerPlan(plan.power)) errors.push('power is invalid')
  if (!isPlanReview(plan.review)) errors.push('review is invalid')
  if (!isHardwareSpec(plan.spec)) errors.push('spec is invalid')

  return errors.length > 0 ? errors : ['unknown validation error']
}

function describeComponentSelectionErrors(value: unknown) {
  if (!value || typeof value !== 'object') return ['components is invalid']

  const selection = value as Record<string, unknown>

  if (!Array.isArray(selection.components)) {
    return ['components.components must be an array']
  }

  const errors = selection.components.flatMap((component, index) =>
    describeComponentCandidateErrors(component, `components.components[${index}]`),
  )

  return errors.length > 0 ? errors : ['components is invalid']
}

function describeComponentCandidateErrors(value: unknown, path: string) {
  if (!value || typeof value !== 'object') return [`${path} must be an object`]

  const component = value as Record<string, unknown>
  const errors: string[] = []

  for (const field of [
    'id',
    'name',
    'role',
    'category',
    'interface',
    'voltage',
    'beginnerConnection',
  ]) {
    if (typeof component[field] !== 'string') {
      errors.push(`${path}.${field} must be a string`)
    }
  }

  if (!isComponentPartRef(component.partRef)) {
    errors.push(`${path}.partRef is invalid`)
  }

  return errors
}

function isSubsystem(value: unknown) {
  if (!value || typeof value !== 'object') return false

  const subsystem = value as Record<string, unknown>

  return (
    typeof subsystem.id === 'string' &&
    typeof subsystem.name === 'string' &&
    typeof subsystem.purpose === 'string'
  )
}

function isComponentCandidate(value: unknown) {
  if (!value || typeof value !== 'object') return false

  const component = value as Record<string, unknown>

  return (
    typeof component.id === 'string' &&
    typeof component.name === 'string' &&
    typeof component.role === 'string' &&
    typeof component.category === 'string' &&
    isComponentPartRef(component.partRef) &&
    typeof component.interface === 'string' &&
    typeof component.voltage === 'string' &&
    typeof component.beginnerConnection === 'string'
  )
}

function isComponentPartRef(value: unknown): value is ComponentPartRef {
  if (!value || typeof value !== 'object') return false

  const partRef = value as Record<string, unknown>

  if (
    typeof partRef.kind !== 'string' ||
    typeof partRef.catalogPartId !== 'string' ||
    typeof partRef.description !== 'string' ||
    typeof partRef.reason !== 'string'
  ) {
    return false
  }

  if (partRef.kind === 'catalog') {
    return partRef.catalogPartId.trim().length > 0
  }

  if (partRef.kind === 'unresolved') {
    return (
      partRef.catalogPartId === '' &&
      partRef.description.trim().length > 0 &&
      partRef.reason.trim().length > 0
    )
  }

  return false
}

function isConnection(value: unknown) {
  if (!value || typeof value !== 'object') return false

  const connection = value as Record<string, unknown>

  return (
    typeof connection.id === 'string' &&
    typeof connection.fromComponentId === 'string' &&
    typeof connection.fromPort === 'string' &&
    typeof connection.toComponentId === 'string' &&
    typeof connection.toPort === 'string' &&
    typeof connection.interface === 'string' &&
    typeof connection.physicalMethod === 'string' &&
    isConnectorStandardId(connection.connectorStandard) &&
    connection.busVoltage === '3.3V'
  )
}

function normalizeConnection(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value

  const connection = value as Record<string, unknown>

  if (
    isConnectorStandardId(connection.connectorStandard) &&
    connection.busVoltage === '3.3V'
  ) {
    return value
  }

  return {
    ...connection,
    connectorStandard: inferConnectorStandard(connection.physicalMethod),
    busVoltage: '3.3V',
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isConnectorStandardId(value: unknown): value is ConnectorStandardId {
  return value === 'stemma-qt' || value === 'qwiic'
}

function inferConnectorStandard(value: unknown): ConnectorStandardId {
  if (typeof value === 'string' && value.toLowerCase().includes('qwiic')) {
    return 'qwiic'
  }

  return 'stemma-qt'
}

function createDefaultPowerPlan(connections: Record<string, unknown> | null) {
  const powerNotes = isStringArray(connections?.powerNotes)
    ? connections.powerNotes
    : []

  return {
    primarySource: 'User-provided external power source appropriate for the selected modules.',
    inputVoltage: 'To be confirmed from selected component requirements.',
    regulatedRails: ['3.3V logic rail for STEMMA QT / Qwiic I2C modules.'],
    distribution:
      powerNotes.length > 0
        ? powerNotes
        : ['Power distribution must be confirmed before fabrication or assembly.'],
    userInstructions: [
      'Do not connect power until the required input voltage and current rating are confirmed.',
    ],
    safetyNotes: [
      'Use a current-limited supply during first bring-up.',
      'Do not power high-current loads directly from ESP32 GPIO.',
    ],
  }
}
