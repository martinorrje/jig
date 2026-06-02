export type HardwareSpec = {
  title: string
  summary: string
  requirements: string[]
  constraints: string[]
  assumptions: string[]
  risks: string[]
  nextSteps: string[]
}

export const hardwareSpecSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      description: 'Short product/spec title.',
    },
    summary: {
      type: 'string',
      description: 'Concise overview of the hardware being specified.',
    },
    requirements: {
      type: 'array',
      items: { type: 'string' },
      description: 'Functional and technical requirements.',
    },
    constraints: {
      type: 'array',
      items: { type: 'string' },
      description: 'Budget, size, manufacturing, material, safety, or environment constraints.',
    },
    assumptions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Reasonable assumptions made from the user prompt.',
    },
    risks: {
      type: 'array',
      items: { type: 'string' },
      description: 'Engineering risks, unknowns, or validation concerns.',
    },
    nextSteps: {
      type: 'array',
      items: { type: 'string' },
      description: 'Concrete next steps before design or build work.',
    },
  },
  required: [
    'title',
    'summary',
    'requirements',
    'constraints',
    'assumptions',
    'risks',
    'nextSteps',
  ],
} as const

export function isHardwareSpec(value: unknown): value is HardwareSpec {
  if (!value || typeof value !== 'object') return false

  const spec = value as Record<string, unknown>

  return (
    typeof spec.title === 'string' &&
    typeof spec.summary === 'string' &&
    isStringArray(spec.requirements) &&
    isStringArray(spec.constraints) &&
    isStringArray(spec.assumptions) &&
    isStringArray(spec.risks) &&
    isStringArray(spec.nextSteps)
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}