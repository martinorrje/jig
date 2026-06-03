export type Vec3 = [number, number, number]

export type AttachmentPoint = {
  id: string
  label: string
  kind:
    | 'mounting-hole'
    | 'connector'
    | 'keepout'
    | 'origin'
    | 'acoustic-face'
    | 'mounting-rim'
  positionMm: Vec3
  normal: Vec3
  diameterMm?: number
  notes: string
}

export type ElectricalPort = {
  id: string
  label: string
  kind:
    | 'power'
    | 'ground'
    | 'gpio'
    | 'i2c'
    | 'spi'
    | 'uart'
    | 'adc'
    | 'dac'
    | 'pwm'
    | 'i2s'
    | 'speaker'
    | 'control'
  voltage: string
  notes: string
}

export type MechanicalFeature = {
  id: string
  label: string
  kind: 'circular-face' | 'cylindrical-body' | 'terminal-area'
  dimensionsMm: Record<string, number>
  notes?: string
}

export type MechanicalMetadata = {
  dimensionsMm: Record<string, number>
  features: MechanicalFeature[]
}

export type CatalogPart = {
  id: string
  name: string
  category: 'controller' | 'sensor' | 'actuator' | 'power' | 'ui' | 'mechanical'
  description: string
  tags: string[]
  mechanical?: MechanicalMetadata
  attachmentPoints: AttachmentPoint[]
  electricalPorts: ElectricalPort[]
}

export function isCatalogPart(value: unknown): value is CatalogPart {
  if (!value || typeof value !== 'object') return false

  const part = value as Record<string, unknown>

  return (
    typeof part.id === 'string' &&
    typeof part.name === 'string' &&
    typeof part.description === 'string' &&
    Array.isArray(part.tags) &&
    part.tags.every((tag) => typeof tag === 'string') &&
    (part.mechanical === undefined || isMechanicalMetadata(part.mechanical)) &&
    Array.isArray(part.attachmentPoints) &&
    part.attachmentPoints.every(isAttachmentPoint) &&
    Array.isArray(part.electricalPorts) &&
    part.electricalPorts.every(isElectricalPort)
  )
}

function isMechanicalMetadata(value: unknown) {
  if (!value || typeof value !== 'object') return false

  const mechanical = value as Record<string, unknown>

  return (
    isDimensionsMap(mechanical.dimensionsMm) &&
    Array.isArray(mechanical.features) &&
    mechanical.features.every(isMechanicalFeature)
  )
}

function isDimensionsMap(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  return Object.values(value).every((item) => typeof item === 'number')
}

function isMechanicalFeature(value: unknown) {
  if (!value || typeof value !== 'object') return false

  const feature = value as Record<string, unknown>

  return (
    typeof feature.id === 'string' &&
    typeof feature.label === 'string' &&
    typeof feature.kind === 'string' &&
    isDimensionsMap(feature.dimensionsMm) &&
    (feature.notes === undefined || typeof feature.notes === 'string')
  )
}

function isAttachmentPoint(value: unknown) {
  if (!value || typeof value !== 'object') return false

  const point = value as Record<string, unknown>

  return (
    typeof point.id === 'string' &&
    typeof point.label === 'string' &&
    typeof point.kind === 'string' &&
    isVec3(point.positionMm) &&
    isVec3(point.normal) &&
    (point.diameterMm === undefined || typeof point.diameterMm === 'number') &&
    typeof point.notes === 'string'
  )
}

function isElectricalPort(value: unknown) {
  if (!value || typeof value !== 'object') return false

  const port = value as Record<string, unknown>

  return (
    typeof port.id === 'string' &&
    typeof port.label === 'string' &&
    typeof port.kind === 'string' &&
    typeof port.voltage === 'string' &&
    typeof port.notes === 'string'
  )
}

function isVec3(value: unknown): value is Vec3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => typeof item === 'number')
  )
}
