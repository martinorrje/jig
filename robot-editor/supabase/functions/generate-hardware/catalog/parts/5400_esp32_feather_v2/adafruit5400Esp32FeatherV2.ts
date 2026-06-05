import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit5400Esp32FeatherV2: CatalogPart = {
  id: '5400-esp32-feather-v2',
  name: '5400 ESP32 Feather V2',
  category: 'controller',
  description:
    'Adafruit ESP32 Feather V2 with STEMMA QT, USB-C, LiPo power, WiFi, and Bluetooth support.',
  tags: [
    'adafruit',
    'esp32',
    'feather',
    'controller',
    'stemma',
    'qwiic-compatible',
    'i2c',
    'wifi',
    'bluetooth',
  ],
  mechanical: {
    dimensionsMm: {
      width: 51.895,
      depth: 22.86,
      height: 6.37,
    },
    features: [],
  },
  attachmentPoints: [
    {
      id: 'front-left-mount',
      label: 'Front Left Mount',
      kind: 'mounting-hole',
      positionMm: [48.26, 20.32, 0],
      normal: [0, 0, -1],
      diameterMm: 2.54,
      notes: 'Selected center from #1092; radius 1.27 mm.',
    },
    {
      id: 'front-right-mount',
      label: 'Front Right Mount',
      kind: 'mounting-hole',
      positionMm: [48.26, 2.54, 0],
      normal: [0, 0, -1],
      diameterMm: 2.54,
      notes: 'Selected center from #1094; radius 1.27 mm.',
    },
    {
      id: 'back-left-mount',
      label: 'Back Left Mount',
      kind: 'mounting-hole',
      positionMm: [2.54, 20.32, 0],
      normal: [0, 0, 1],
      diameterMm: 2.5,
      notes: 'Selected center from #827; radius 1.25 mm.',
    },
    {
      id: 'back-right-mount',
      label: 'Back Right Mount',
      kind: 'mounting-hole',
      positionMm: [2.54, 2.54, 0],
      normal: [0, 0, 1],
      diameterMm: 2.5,
      notes: 'Selected center from #1051; radius 1.25 mm.',
    },
  ],
  electricalPorts: [
    {
      id: 'stemma-qt-i2c',
      label: 'STEMMA QT I2C connector',
      kind: 'i2c',
      voltage: '3.3V',
      notes:
        'Connectorized I2C port for plug-and-play STEMMA QT/Qwiic devices with switchable 3.3V power.',
    },
    {
      id: 'usb-c',
      label: 'USB-C power/programming connector',
      kind: 'power',
      voltage: '5V input',
      notes:
        'USB Type-C connector for board power, programming, and built-in LiPo charging.',
    },
    {
      id: 'lipo',
      label: 'LiPo battery connector',
      kind: 'power',
      voltage: '3.7V nominal',
      notes:
        'LiPo battery input with built-in battery charging and monitoring.',
    },
    {
      id: '3v3',
      label: '3.3V logic rail',
      kind: 'power',
      voltage: '3.3V',
      notes: 'Regulated board logic rail.',
    },
    {
      id: 'gnd',
      label: 'Ground',
      kind: 'ground',
      voltage: '0V',
      notes: 'Board ground reference.',
    },
    {
      id: 'gpio-headers',
      label: 'Feather GPIO headers',
      kind: 'gpio',
      voltage: '3.3V logic',
      notes:
        'Feather-format breakout pads for GPIO, ADC, UART, SPI, I2C, I2S, DAC, and PWM capabilities.',
    },
  ],
}
