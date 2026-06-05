import type { CircularFeature, Vec3 } from '../types/catalog'

type StepEntity = {
  type: string
  body: string
}

export function parseCircularFeatures(stepText: string): CircularFeature[] {
  const entities = parseStepEntities(stepText)
  const features: CircularFeature[] = []

  for (const [id, entity] of entities) {
    if (entity.type !== 'CIRCLE' && entity.type !== 'CYLINDRICAL_SURFACE') {
      continue
    }

    const args = splitTopLevel(entity.body)
    const placementRef = args[1]?.trim()
    const radius = Number(args[2])

    if (!placementRef?.startsWith('#') || !Number.isFinite(radius)) {
      continue
    }

    const placement = readAxisPlacement(entities, placementRef)
    if (!placement) continue

    const kind =
      entity.type === 'CIRCLE' ? 'circle' : 'cylindrical-surface'

    features.push({
      id: `${kind}-${id.slice(1)}`,
      label: `${kind === 'circle' ? 'Circle' : 'Cylinder'} ${id}`,
      sourceEntity: id,
      kind,
      centerMm: placement.center,
      normal: placement.normal,
      radiusMm: roundMm(radius),
    })
  }

  return dedupeFeatures(features)
}

function parseStepEntities(stepText: string): Map<string, StepEntity> {
  const entities = new Map<string, StepEntity>()
  const normalized = stepText.replace(/\r/g, '')
  const assignmentPattern = /(#\d+)\s*=\s*([A-Z0-9_]+)\s*\(([\s\S]*?)\)\s*;/g
  let match: RegExpExecArray | null

  while ((match = assignmentPattern.exec(normalized))) {
    const id = match[1]
    const type = match[2]
    const body = match[3]
    if (!id || !type || !body) continue

    entities.set(id, {
      type,
      body,
    })
  }

  return entities
}

function readAxisPlacement(
  entities: Map<string, StepEntity>,
  placementRef: string,
): { center: Vec3; normal: Vec3 } | null {
  const placement = entities.get(placementRef)
  if (!placement || placement.type !== 'AXIS2_PLACEMENT_3D') return null

  const args = splitTopLevel(placement.body)
  const pointRef = args[1]?.trim()
  const normalRef = args[2]?.trim()
  if (!pointRef?.startsWith('#')) return null

  const center = readVectorEntity(entities, pointRef, 'CARTESIAN_POINT')
  if (!center) return null

  const defaultNormal: Vec3 = [0, 0, 1]
  const normal: Vec3 = normalRef?.startsWith('#')
    ? readVectorEntity(entities, normalRef, 'DIRECTION') ?? defaultNormal
    : defaultNormal

  return {
    center: center.map(roundMm) as Vec3,
    normal: normalize(normal),
  }
}

function readVectorEntity(
  entities: Map<string, StepEntity>,
  ref: string,
  expectedType: string,
): Vec3 | null {
  const entity = entities.get(ref)
  if (!entity || entity.type !== expectedType) return null

  const tuple = splitTopLevel(entity.body).find((arg) => arg.trim().startsWith('('))
  if (!tuple) return null

  const values = tuple
    .replace(/^\(|\)$/g, '')
    .split(',')
    .map((value) => Number(value.trim()))

  if (values.length < 3 || values.some((value) => !Number.isFinite(value))) {
    return null
  }

  return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0]
}

function splitTopLevel(input: string): string[] {
  const parts: string[] = []
  let depth = 0
  let inString = false
  let current = ''

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]

    if (char === "'") {
      inString = !inString
    } else if (!inString && char === '(') {
      depth += 1
    } else if (!inString && char === ')') {
      depth -= 1
    }

    if (!inString && depth === 0 && char === ',') {
      parts.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  if (current.trim()) parts.push(current.trim())

  return parts
}

function dedupeFeatures(features: CircularFeature[]) {
  const seen = new Set<string>()

  return features.filter((feature) => {
    const key = [
      feature.kind,
      feature.radiusMm.toFixed(3),
      ...feature.centerMm.map((value) => value.toFixed(3)),
      ...feature.normal.map((value) => value.toFixed(3)),
    ].join(':')

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalize(vector: Vec3): Vec3 {
  const length = Math.hypot(vector[0], vector[1], vector[2])
  if (length === 0) return [0, 0, 1]

  return [
    roundMm(vector[0] / length),
    roundMm(vector[1] / length),
    roundMm(vector[2] / length),
  ]
}

function roundMm(value: number) {
  return Math.round(value * 1000) / 1000
}
