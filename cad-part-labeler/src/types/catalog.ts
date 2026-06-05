export type Vec3 = [number, number, number]

export type CadFormat = 'step' | 'stl'

export type AdafruitCadFile = {
  name: string
  path: string
  rawUrl: string
  format: CadFormat
  productId: string | null
  productName?: string
  productUrl?: string
  productStock?: string
  isInStock: boolean | null
  usefulnessScore: number
}

export type CircularFeature = {
  id: string
  label: string
  sourceEntity: string
  kind: 'circle' | 'cylindrical-surface'
  centerMm: Vec3
  normal: Vec3
  radiusMm: number
}

export type AttachmentPoint = {
  id: string
  label: string
  kind: string
  positionMm: Vec3
  normal: Vec3
  notes: string
}

export type CatalogPartDraft = {
  id: string
  name: string
  source: {
    provider: 'adafruit' | 'local'
    path: string
    format: CadFormat
    url?: string
  }
  dimensionsMm: Vec3
  attachmentPoints: AttachmentPoint[]
  updatedAt: string
}
