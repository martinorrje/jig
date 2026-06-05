import { describe, expect, it } from 'vitest'
import {
  compareAdafruitParts,
  getPartDedupeKey,
  isAdafruitCatalogQueuePart,
  isStemmaPart,
  scoreUsefulness,
} from './adafruit'
import type { AdafruitCadFile } from '../types/catalog'

describe('adafruit part sorting', () => {
  it('scores common hardware modules above decorative parts', () => {
    expect(scoreUsefulness('ESP32 Feather sensor breakout')).toBeGreaterThan(
      scoreUsefulness('logo badge stand'),
    )
  })

  it('boosts in-stock useful parts ahead of similar out-of-stock parts', () => {
    const inStock = createPart({
      name: 'ESP32 Feather',
      path: '1234 ESP32 Feather.step',
      isInStock: true,
      productStock: 'in stock',
    })
    const outOfStock = createPart({
      name: 'ESP32 Feather variant',
      path: '5678 ESP32 Feather.step',
      isInStock: false,
      productStock: 'out of stock',
    })

    expect([outOfStock, inStock].sort(compareAdafruitParts)[0]).toBe(inStock)
  })

  it('keeps uncataloged Adafruit category 1005 CAD parts in the library filter', () => {
    expect(
      isAdafruitCatalogQueuePart(
        createPart({
          name: '5723 Feather RP2040 USB Host',
          path: '5723 Feather RP2040 USB Host/5723 Feather RP2040 USB Host.step',
        }),
      ),
    ).toBe(true)
    expect(
      isAdafruitCatalogQueuePart(
        createPart({
          name: 'ESP32 Feather',
          path: '3405 ESP32 Feather.step',
        }),
      ),
    ).toBe(false)
  })

  it('keeps the CAD-backed ESP32 Feather V2 default controller even when the CAD path omits STEMMA', () => {
    expect(
      isStemmaPart(
        createPart({
          name: '5400 ESP32 Feather V2',
          path: '5400 ESP32 Feather V2/5400 ESP32 Feather V2.step',
        }),
      ),
    ).toBe(true)
  })

  it('removes parts already imported into the robot-editor catalog', () => {
    expect(
      isAdafruitCatalogQueuePart(
        createPart({
          name: '5400 ESP32 Feather V2',
          path: '5400 ESP32 Feather V2/5400 ESP32 Feather V2.step',
        }),
      ),
    ).toBe(false)
    expect(
      isAdafruitCatalogQueuePart(
        createPart({
          name: '5743 Mini Gamepad STEMMA QT',
          path: '5743 Mini Gamepad STEMMA QT/5743 Mini Gamepad STEMMA QT.step',
        }),
      ),
    ).toBe(false)
    expect(
      isAdafruitCatalogQueuePart(
        createPart({
          name: 'STEMMA Soil Sensor',
          path: '4026 STEMMA Soil Sensor.step',
        }),
      ),
    ).toBe(false)
  })

  it('dedupes multiple CAD files for the same product id', () => {
    expect(
      getPartDedupeKey(
        createPart({
          name: 'STEMMA Soil Sensor STEP',
          path: '4026 STEMMA Soil Sensor.step',
          productId: '4026',
        }),
      ),
    ).toBe(
      getPartDedupeKey(
        createPart({
          name: 'STEMMA Soil Sensor STL',
          path: '4026 STEMMA Soil Sensor.stl',
          productId: '4026',
        }),
      ),
    )
  })

  it('dedupes noisy duplicate names when product ids are unavailable', () => {
    expect(
      getPartDedupeKey(
        createPart({
          name: 'Adafruit STEMMA Soil Sensor STEP',
          path: 'STEMMA Soil Sensor.step',
        }),
      ),
    ).toBe(
      getPartDedupeKey(
        createPart({
          name: 'STEMMA Soil Sensor STL',
          path: 'STEMMA Soil Sensor.stl',
        }),
      ),
    )
  })
})

function createPart(
  patch: Partial<AdafruitCadFile> & Pick<AdafruitCadFile, 'name' | 'path'>,
): AdafruitCadFile {
  const text = `${patch.name} ${patch.path}`

  return {
    name: patch.name,
    path: patch.path,
    rawUrl: '',
    format: patch.format ?? 'step',
    productId: patch.productId ?? null,
    isInStock: patch.isInStock ?? null,
    usefulnessScore: patch.usefulnessScore ?? scoreUsefulness(text),
    ...(patch.productUrl ? { productUrl: patch.productUrl } : {}),
    ...(patch.productName ? { productName: patch.productName } : {}),
    ...(patch.productStock ? { productStock: patch.productStock } : {}),
  }
}
