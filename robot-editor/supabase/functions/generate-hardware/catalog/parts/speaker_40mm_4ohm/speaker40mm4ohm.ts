import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const speaker40mm4ohm: CatalogPart = {
  id: 'speaker-40mm-4ohm',
  name: '40 mm 4 ohm speaker driver',
  category: 'actuator',
  description:
    'Small round speaker driver for compact mono audio output. Useful for testing enclosures with a grille, acoustic opening, wire routing, and speaker retention.',
  tags: ['audio', 'speaker', '4ohm', '40mm', 'mono'],
  mechanical: {
    dimensionsMm: {
      speakerTopRadius: 20.0,
      speakerBottomRadius: 10.0,
      totalHeight: 25.0,
    },
    features: [
      {
        id: 'speaker-top',
        label: 'Speaker top circular face',
        kind: 'circular-face',
        dimensionsMm: {
          radius: 20.0,
          height: 3.0,
        },
        notes: 'Use as the main acoustic opening reference.',
      },
      {
        id: 'speaker-bottom',
        label: 'Speaker bottom circular face',
        kind: 'circular-face',
        dimensionsMm: {
          radius: 10.0,
          height: 8.0,
        },
      },
    ],
  },
  attachmentPoints: [],
  electricalPorts: [
    {
      id: 'positive',
      label: 'Positive speaker terminal',
      kind: 'speaker',
      voltage: 'Amplified audio input',
      notes: 'Connect to the amplifier speaker-positive output.',
    },
    {
      id: 'negative',
      label: 'Negative speaker terminal',
      kind: 'speaker',
      voltage: 'Amplified audio input',
      notes: 'Connect to the amplifier speaker-negative output.',
    },
  ],
}
