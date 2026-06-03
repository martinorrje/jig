import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const esp32DevkitV1: CatalogPart = {
  id: 'esp32-devkit-v1',
  name: 'ESP32 DevKit-style development board',
  category: 'controller',
  description:
    'Beginner-friendly ESP32 development board for Wi-Fi, BLE, GPIO, I2C, SPI, UART, ADC, and PWM control.',
  tags: ['esp32', 'microcontroller', 'wifi', 'ble', 'controller'],
  attachmentPoints: [
    {
      id: 'mount-hole-front-left',
      label: 'Front left mounting hole',
      kind: 'mounting-hole',
      positionMm: [-11.775, 49.0, 0.0],
      normal: [0, 0, -1],
      diameterMm: 3,
      notes: 'Use for standoffs or printed shell bosses.',
    },
    {
      id: 'mount-hole-front-right',
      label: 'Front right mounting hole',
      kind: 'mounting-hole',
      positionMm: [11.775, 49.0, 0.0],
      normal: [0, 0, -1],
      diameterMm: 3,
      notes: 'Use for standoffs or printed shell bosses.',
    },
    {
      id: 'mount-hole-back-left',
      label: 'Back left mounting hole',
      kind: 'mounting-hole',
      positionMm: [-11.775, 2.5, 0.0],
      normal: [0, 0, -1],
      diameterMm: 3,
      notes: 'Use for standoffs or printed shell bosses.',
    },
    {
      id: 'mount-hole-back-right',
      label: 'Back right mounting hole',
      kind: 'mounting-hole',
      positionMm: [11.775, 2.5, 0.0],
      normal: [0, 0, -1],
      diameterMm: 3,
      notes: 'Use for standoffs or printed shell bosses.',
    },
  ],
  electricalPorts: [
    {
      id: 'micro-usb',
      label: 'Micro-USB power/programming connector',
      kind: 'power',
      voltage: '5V input',
      notes:
        'Default power supply and communication path between a computer and the ESP32 module.',
    },
    {
      id: '5v',
      label: '5V header power rail',
      kind: 'power',
      voltage: '5V',
      notes:
        'Header power option. Espressif documents Micro-USB, 5V/GND, and 3V3/GND power inputs as mutually exclusive.',
    },
    {
      id: '3v3',
      label: '3.3V header power rail',
      kind: 'power',
      voltage: '3V3',
      notes:
        'Header power option. Use only with 3.3V-compatible modules and do not combine with other board power inputs.',
    },
    {
      id: 'gnd',
      label: 'Ground header pins',
      kind: 'ground',
      voltage: '0V',
      notes: 'Shared signal reference and power return on the board headers.',
    },
    {
      id: 'gpio-headers',
      label: 'I/O header pins',
      kind: 'gpio',
      voltage: '3V3 logic',
      notes:
        'Most ESP32 module I/O pins are broken out to the side headers. Assign exact GPIO pins in a later wiring step.',
    },
    {
      id: 'uart0',
      label: 'UART0 programming serial',
      kind: 'uart',
      voltage: '3V3 logic',
      notes:
        'TX is GPIO1/U0TXD and RX is GPIO3/U0RXD through the USB-to-UART bridge.',
    },
    {
      id: 'adc',
      label: 'ADC-capable header pins',
      kind: 'adc',
      voltage: '0-3V3 input',
      notes:
        'ADC functions are available on documented GPIO header pins including VP/VN and IO34, IO35, IO32, IO33, IO25, IO26, IO27, IO14, IO12, IO13, IO4, IO0, IO2, and IO15.',
    },
    {
      id: 'dac',
      label: 'DAC-capable header pins',
      kind: 'dac',
      voltage: '0-3V3 output',
      notes: 'DAC outputs are available on IO25/GPIO25 and IO26/GPIO26.',
    },
    {
      id: 'i2c',
      label: 'I2C-capable GPIO',
      kind: 'i2c',
      voltage: '3V3 logic',
      notes:
        'I2C is a programmable ESP32 peripheral on suitable GPIO. Assign exact pins in the wiring step.',
    },
    {
      id: 'i2s',
      label: 'I2S-capable GPIO',
      kind: 'i2s',
      voltage: '3V3 logic',
      notes:
        'I2S is a programmable ESP32 peripheral for audio modules such as MAX98357A. Assign exact pins in the wiring step.',
    },
    {
      id: 'spi',
      label: 'SPI-capable GPIO',
      kind: 'spi',
      voltage: '3V3 logic',
      notes:
        'SPI is available on suitable GPIO. Avoid D0, D1, D2, D3, CMD and CLK because Espressif documents them as internally used for SPI flash memory.',
    },
    {
      id: 'pwm',
      label: 'PWM-capable GPIO',
      kind: 'pwm',
      voltage: '3V3 logic',
      notes:
        'PWM can be enabled on suitable GPIO through ESP32 firmware. Do not drive high-current loads directly from GPIO.',
    },
  ],
}
