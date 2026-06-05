import type { CatalogPartDraft } from '../types/catalog'

const storageKey = 'cadPartLabeler.catalogParts'

export function loadCatalogParts(): CatalogPartDraft[] {
  const raw = localStorage.getItem(storageKey)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter(isCatalogPartDraft) : []
  } catch {
    return []
  }
}

export function saveCatalogPart(part: CatalogPartDraft) {
  const parts = loadCatalogParts()
  const nextParts = [
    part,
    ...parts.filter((existingPart) => existingPart.id !== part.id),
  ]

  localStorage.setItem(storageKey, JSON.stringify(nextParts, null, 2))
  return nextParts
}

export function createCatalogJson(part: CatalogPartDraft) {
  return JSON.stringify(part, null, 2)
}

export function createCatalogListJson(parts: CatalogPartDraft[]) {
  return JSON.stringify(parts, null, 2)
}

export function createPartId(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || 'catalog-part'
}

function isCatalogPartDraft(value: unknown): value is CatalogPartDraft {
  if (!value || typeof value !== 'object') return false

  const part = value as Record<string, unknown>

  return (
    typeof part.id === 'string' &&
    typeof part.name === 'string' &&
    Array.isArray(part.attachmentPoints) &&
    typeof part.updatedAt === 'string'
  )
}
