import {
  hardwareSpecSchema,
  isHardwareSpec,
  type HardwareSpec,
} from './hardwareSpecContract.ts'

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
      description: ''
      reason: ''
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
  }>
  powerNotes: string[]
  warnings: string[]
}

export type PlanReview = {
  summary: string
  warnings: string[]
  openQuestions: string[]
  nextSteps: string[]
}

export type HardwarePlan = {
  overview: ProductOverview
  architecture: SystemArchitecture
  components: ComponentSelection
  connections: ConnectionPlan
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
        },
        required: [
          'id',
          'fromComponentId',
          'fromPort',
          'toComponentId',
          'toPort',
          'interface',
          'physicalMethod',
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
  required: ['summary', 'warnings', 'openQuestions', 'nextSteps'],
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
    isStringArray(review.nextSteps)
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
    isPlanReview(plan.review) &&
    isHardwareSpec(plan.spec)
  )
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
    return (
      partRef.catalogPartId.trim().length > 0 &&
      partRef.description === '' &&
      partRef.reason === ''
    )
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
    typeof connection.physicalMethod === 'string'
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}
