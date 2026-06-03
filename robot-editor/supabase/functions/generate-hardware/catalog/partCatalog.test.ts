import { readdirSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { catalogParts, buildCatalogPromptSummary } from './partCatalog.ts'

const partDirectories: Record<string, string> = {
  'adafruit-max98357a-i2s-mono-amp':
    'supabase/functions/generate-hardware/catalog/parts/adafruit_max98357a_i2s_mono_amp',
  'esp32-devkit-v1':
    'supabase/functions/generate-hardware/catalog/parts/esp32_devkit',
  'speaker-40mm-4ohm':
    'supabase/functions/generate-hardware/catalog/parts/speaker_40mm_4ohm',
}

describe('partCatalog', () => {
  test('all catalog parts are CAD-backed by a STEP file in their part folder', () => {
    for (const part of catalogParts) {
      const partDirectory = partDirectories[part.id]

      expect(partDirectory).toBeDefined()
      expect('cad' in part).toBe(false)
      expect(hasStepFile(partDirectory)).toBe(true)
    }
  })

  test('includes an ESP32 catalog part with attachment points', () => {
    const esp32 = catalogParts.find((part) => part.id === 'esp32-devkit-v1')

    expect(esp32).toMatchObject({
      id: 'esp32-devkit-v1',
      name: 'ESP32 DevKit-style development board',
    })

    expect(esp32?.attachmentPoints.map((point) => point.id)).toEqual([
      'mount-hole-front-left',
      'mount-hole-front-right',
      'mount-hole-back-left',
      'mount-hole-back-right',
    ])
  })

  test('describes ESP32 DevKitC electrical ports from Espressif documentation', () => {
    const esp32 = catalogParts.find((part) => part.id === 'esp32-devkit-v1')

    expect(esp32?.electricalPorts.map((port) => port.id)).toEqual([
      'micro-usb',
      '5v',
      '3v3',
      'gnd',
      'gpio-headers',
      'uart0',
      'adc',
      'dac',
      'i2c',
      'i2s',
      'spi',
      'pwm',
    ])
    expect(esp32?.electricalPorts.find((port) => port.id === '5v')).toEqual(
      expect.objectContaining({
        kind: 'power',
        voltage: '5V',
        notes: expect.stringContaining('mutually exclusive'),
      }),
    )
    expect(esp32?.electricalPorts.find((port) => port.id === 'micro-usb')).toEqual(
      expect.objectContaining({
        label: 'Micro-USB power/programming connector',
        notes: expect.stringContaining('communication'),
      }),
    )
    expect(esp32?.electricalPorts.find((port) => port.id === 'spi')).toEqual(
      expect.objectContaining({
        kind: 'spi',
        notes: expect.stringContaining('D0, D1, D2, D3, CMD and CLK'),
      }),
    )
  })

  test('includes speaker module parts', () => {
    const amp = catalogParts.find(
      (part) => part.id === 'adafruit-max98357a-i2s-mono-amp',
    )
    const speaker = catalogParts.find((part) => part.id === 'speaker-40mm-4ohm')

    expect(amp).toMatchObject({
      id: 'adafruit-max98357a-i2s-mono-amp',
      name: 'Adafruit MAX98357A I2S mono amplifier breakout',
    })
    expect(amp?.electricalPorts.map((port) => port.id)).toEqual([
      'vin',
      'gnd',
      'din',
      'bclk',
      'lrc',
      'gain',
      'sd-mode',
      'speaker-positive',
      'speaker-negative',
    ])
    expect(amp?.electricalPorts.find((port) => port.id === 'vin')).toEqual(
      expect.objectContaining({
        kind: 'power',
        voltage: '2.5V-5.5V',
      }),
    )
    expect(amp?.electricalPorts.find((port) => port.id === 'lrc')).toEqual(
      expect.objectContaining({
        label: 'LRC / LRCLK frame clock input',
        kind: 'i2s',
      }),
    )
    expect(amp?.electricalPorts.find((port) => port.id === 'gain')).toEqual(
      expect.objectContaining({
        kind: 'control',
        notes: expect.stringContaining('default 9dB'),
      }),
    )
    expect(amp?.electricalPorts.find((port) => port.id === 'sd-mode')).toEqual(
      expect.objectContaining({
        kind: 'control',
        notes: expect.stringContaining('shutdown and channel select'),
      }),
    )

    expect(speaker).toMatchObject({
      id: 'speaker-40mm-4ohm',
      name: '40 mm 4 ohm speaker driver',
      mechanical: {
        dimensionsMm: {
          speakerTopRadius: 20,
          speakerBottomRadius: 10,
          totalHeight: 25,
        },
        features: [
          {
            id: 'speaker-top',
            label: 'Speaker top circular face',
            kind: 'circular-face',
            dimensionsMm: {
              radius: 20,
              height: 3,
            },
            notes: 'Use as the main acoustic opening reference.',
          },
          {
            id: 'speaker-bottom',
            label: 'Speaker bottom circular face',
            kind: 'circular-face',
            dimensionsMm: {
              radius: 10,
              height: 8,
            },
          },
        ],
      },
    })
    expect(speaker?.attachmentPoints.map((point) => point.id)).toEqual([])
  })

  test('summarizes catalog parts for the component-selection prompt', () => {
    expect(buildCatalogPromptSummary()).toContain(
      'esp32-devkit-v1: ESP32 DevKit-style development board',
    )
    expect(buildCatalogPromptSummary()).toContain(
      'adafruit-max98357a-i2s-mono-amp: Adafruit MAX98357A I2S mono amplifier breakout',
    )
    expect(buildCatalogPromptSummary()).toContain(
      'speaker-40mm-4ohm: 40 mm 4 ohm speaker driver',
    )
    expect(buildCatalogPromptSummary()).not.toContain('cad:')
    expect(buildCatalogPromptSummary()).toContain(
      'attachment points: mount-hole-front-left, mount-hole-front-right, mount-hole-back-left, mount-hole-back-right',
    )
  })
})

function hasStepFile(partDirectory: string) {
  return readdirSync(partDirectory).some((fileName) =>
    /\.(step|stp)$/i.test(fileName),
  )
}
