import {
  connectorStandards,
  type CatalogPart,
} from '../../_shared/partCatalogContract.ts'
import { adafruitStemmaLabelerParts } from './parts/adafruitStemmaLabelerParts.ts'

export const catalogParts: CatalogPart[] = [
  ...adafruitStemmaLabelerParts.map(withStemmaQtConnector),
]

export function buildCatalogPromptSummary() {
  return [
    'Connector standards:',
    ...Object.values(connectorStandards).map(
      (standard) =>
        `${standard.label}: carries ${standard.carries.join(', ')}; nominal ${standard.nominalVoltage}; max bus ${standard.maxBusVoltage}V. ${standard.notes}`,
    ),
    'STEMMA QT/Qwiic connector standards use a 3.3V bus by default in v1.',
    '',
    ...catalogParts
    .map(
      (part) =>
        [
          `${part.id}: ${part.name}`,
          `category: ${part.category}`,
          `description: ${part.description}`,
          `attachment points: ${part.attachmentPoints.map((point) => point.id).join(', ')}`,
          `connectors: ${formatConnectorPorts(part)}`,
          `electrical ports: ${part.electricalPorts.map((port) => port.id).join(', ')}`,
        ].join('\n'),
    ),
  ].join('\n\n')
}

function withStemmaQtConnector(part: CatalogPart): CatalogPart {
  return {
    ...part,
    connectorPorts: [
      {
        id: 'stemma-qt',
        label: 'STEMMA QT',
        standard: 'stemma-qt',
        compatibleStandards: ['stemma-qt', 'qwiic'],
        notes:
          'Use as a 3.3V STEMMA QT/Qwiic-compatible connectorized I2C cable in v1.',
      },
    ],
  }
}

function formatConnectorPorts(part: CatalogPart) {
  if (!part.connectorPorts || part.connectorPorts.length === 0) return 'none'

  return part.connectorPorts
    .map((port) => {
      const standard = connectorStandards[port.standard]
      const compatibleLabels = port.compatibleStandards
        .map((standardId) => connectorStandards[standardId].label)
        .join(', ')

      return `${port.id} (${standard.label}, compatible: ${compatibleLabels})`
    })
    .join(', ')
}
