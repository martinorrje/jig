import { existsSync, readdirSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { catalogParts, buildCatalogPromptSummary } from './partCatalog.ts'

const importedLabelerPartIds = [
  '5400-esp32-feather-v2',
  '5743-mini-gamepad-stemma-qt',
  '5664-pca9546-stemma-qt',
  '5626-pca9548-stemma',
  '5625-stemma-5-port-hub',
  '5295-neoslider-stemma',
  '5201-is31fl3741-stemma',
  '5027-mcp9808-stemma',
  '4918-tca8418-stemma',
  '4808-emc2101-stemma-qt',
  '4754-bno085-stemma-qt',
  '4646-bno055-stemma',
  '4469-mlx90640-stemma',
  '4431-stemma-buttons',
  '2652-bmp280-stemma-qt',
  '1982-mpr121q-qt',
  '1910-alphanumeric-backpack-stemma-qt',
  '5880-rotary-encoder-i2c-stemma-qt',
  '3885-stemma-speaker-rev-a',
  '938-mono-128x64-oled-stemma',
  '1911-alphanumberic-display-stemma-qt',
  '4097-adxl343-stemma-qt',
  '4026-stemma-soil-sensor',
]

describe('partCatalog', () => {
  test('all catalog parts are CAD-backed by a STEP file in their part folder', () => {
    for (const part of catalogParts) {
      const partDirectory = getPartDirectory(part.id)

      expect(partDirectory).toBeDefined()
      expect('cad' in part).toBe(false)
      expect(hasStepFile(partDirectory)).toBe(true)
    }
  })

  test('includes CAD labeler imports with mechanical metadata and labeled mount points', () => {
    expect(catalogParts.map((part) => part.id)).toEqual(
      expect.arrayContaining(importedLabelerPartIds),
    )

    const gamepad = catalogParts.find(
      (part) => part.id === '5743-mini-gamepad-stemma-qt',
    )

    expect(gamepad).toMatchObject({
      id: '5743-mini-gamepad-stemma-qt',
      name: '5743 Mini Gamepad STEMMA QT',
      category: 'ui',
      mechanical: {
        dimensionsMm: {
          width: 50.8,
          depth: 22.86,
          height: 13.07,
        },
      },
    })
    expect(gamepad?.attachmentPoints.map((point) => point.id)).toEqual([
      'front-left-mount',
      'front-right-mount',
      'back-left-mount',
      'back-right-mount',
    ])
    expect(gamepad?.attachmentPoints[0]).toEqual(
      expect.objectContaining({
        kind: 'mounting-hole',
        diameterMm: 2.5,
      }),
    )
    expect(gamepad?.connectorPorts).toEqual([
      expect.objectContaining({
        id: 'stemma-qt',
        standard: 'stemma-qt',
        compatibleStandards: ['stemma-qt', 'qwiic'],
      }),
    ])

    const esp32Feather = catalogParts.find(
      (part) => part.id === '5400-esp32-feather-v2',
    )

    expect(esp32Feather).toMatchObject({
      id: '5400-esp32-feather-v2',
      name: '5400 ESP32 Feather V2',
      category: 'controller',
      mechanical: {
        dimensionsMm: {
          width: 51.895,
          depth: 22.86,
          height: 6.37,
        },
      },
    })
    expect(esp32Feather?.attachmentPoints.map((point) => point.id)).toEqual([
      'front-left-mount',
      'front-right-mount',
      'back-left-mount',
      'back-right-mount',
    ])
    expect(esp32Feather?.attachmentPoints[0]).toEqual(
      expect.objectContaining({
        kind: 'mounting-hole',
        diameterMm: 2.54,
      }),
    )
    expect(esp32Feather?.connectorPorts).toEqual([
      expect.objectContaining({
        id: 'stemma-qt',
        standard: 'stemma-qt',
        compatibleStandards: ['stemma-qt', 'qwiic'],
      }),
    ])
  })

  test('summarizes catalog parts for the component-selection prompt', () => {
    expect(buildCatalogPromptSummary()).toContain(
      '5400-esp32-feather-v2: 5400 ESP32 Feather V2',
    )
    expect(buildCatalogPromptSummary()).not.toContain('cad:')
    expect(buildCatalogPromptSummary()).toContain(
      'attachment points: front-left-mount, front-right-mount, back-left-mount, back-right-mount',
    )
    expect(buildCatalogPromptSummary()).toContain(
      'connectors: stemma-qt (STEMMA QT, compatible: STEMMA QT, Qwiic)',
    )
    expect(buildCatalogPromptSummary()).toContain(
      'STEMMA QT/Qwiic connector standards use a 3.3V bus by default',
    )
  })
})

function getPartDirectory(partId: string) {
  const generatedDirectory = `supabase/functions/generate-hardware/catalog/parts/${partId.replaceAll('-', '_')}`
  return existsSync(generatedDirectory) ? generatedDirectory : undefined
}

function hasStepFile(partDirectory: string) {
  return readdirSync(partDirectory).some((fileName) =>
    /\.(step|stp)$/i.test(fileName),
  )
}
