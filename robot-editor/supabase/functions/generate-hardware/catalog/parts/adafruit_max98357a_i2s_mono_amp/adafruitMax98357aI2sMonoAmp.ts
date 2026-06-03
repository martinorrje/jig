import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruitMax98357aI2sMonoAmp: CatalogPart = {
  id: 'adafruit-max98357a-i2s-mono-amp',
  name: 'Adafruit MAX98357A I2S mono amplifier breakout',
  category: 'actuator',
  description:
    'Beginner-friendly I2S class-D mono amplifier breakout for driving a small 4 ohm or 8 ohm speaker from an ESP32-class controller.',
  tags: ['audio', 'amplifier', 'i2s', 'speaker', 'max98357a'],
  attachmentPoints: [],
  electricalPorts: [
    {
      id: 'vin',
      label: 'VIN / VDD amplifier supply input',
      kind: 'power',
      voltage: '2.5V-5.5V',
      notes:
        'MAX98357A VDD supply input. The Adafruit breakout can be powered from 2.5V to 5.5V; 5V is recommended for higher speaker power.',
    },
    {
      id: 'gnd',
      label: 'Ground',
      kind: 'ground',
      voltage: '0V',
      notes:
        'MAX98357A ground. Share ground with the controller and amplifier supply.',
    },
    {
      id: 'din',
      label: 'DIN digital audio input',
      kind: 'i2s',
      voltage: '3.3V-5V logic',
      notes:
        'MAX98357A DIN digital input signal. Connect to the controller I2S data output.',
    },
    {
      id: 'bclk',
      label: 'BCLK bit clock input',
      kind: 'i2s',
      voltage: '3.3V-5V logic',
      notes:
        'MAX98357A BCLK bit clock input. Tells the amplifier when to read DIN.',
    },
    {
      id: 'lrc',
      label: 'LRC / LRCLK frame clock input',
      kind: 'i2s',
      voltage: '3.3V-5V logic',
      notes:
        'MAX98357A LRCLK frame clock. On the breakout this is labeled LRC and selects left/right audio timing.',
    },
    {
      id: 'gain',
      label: 'GAIN / GAIN_SLOT control',
      kind: 'control',
      voltage: 'Configuration pin',
      notes:
        'MAX98357A GAIN_SLOT control. On the breakout, floating GAIN gives default 9dB gain; resistor or direct connections to VIN/GND select other gains.',
    },
    {
      id: 'sd-mode',
      label: 'SD / SD_MODE shutdown and channel select',
      kind: 'control',
      voltage: 'Configuration pin',
      notes:
        'MAX98357A SD_MODE control for shutdown and channel select. Pull low for shutdown; breakout biasing can select stereo average, right, or left output.',
    },
    {
      id: 'speaker-positive',
      label: 'Speaker positive output / OUTP',
      kind: 'speaker',
      voltage: 'Amplified audio output',
      notes: 'MAX98357A OUTP positive speaker amplifier output.',
    },
    {
      id: 'speaker-negative',
      label: 'Speaker negative output / OUTN',
      kind: 'speaker',
      voltage: 'Amplified audio output',
      notes: 'MAX98357A OUTN negative speaker amplifier output.',
    },
  ],
}
