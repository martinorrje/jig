import { describe, expect, test } from 'vitest'
import { createCatalogJson, createPartId } from './catalogStorage'

describe('catalogStorage', () => {
  test('creates stable ids from part names', () => {
    expect(createPartId('2130 PAM8302 Amp')).toBe('2130-pam8302-amp')
  })

  test('exports readable catalog json', () => {
    const json = createCatalogJson({
      id: 'speaker',
      name: 'Speaker',
      source: { provider: 'local', path: 'speaker.stl', format: 'stl' },
      dimensionsMm: [1, 2, 3],
      attachmentPoints: [],
      updatedAt: '2026-06-04T00:00:00.000Z',
    })

    expect(json).toContain('"id": "speaker"')
    expect(json).toContain('"dimensionsMm"')
  })
})
