import type { CatalogPart } from '../../_shared/partCatalogContract.ts'
import { adafruitMax98357aI2sMonoAmp } from './parts/adafruit_max98357a_i2s_mono_amp/adafruitMax98357aI2sMonoAmp.ts'
import { adafruitStemmaLabelerParts } from './parts/adafruitStemmaLabelerParts.ts'
import { esp32DevkitV1 } from './parts/esp32_devkit/esp32DevkitV1.ts'
import { speaker40mm4ohm } from './parts/speaker_40mm_4ohm/speaker40mm4ohm.ts'

export const catalogParts: CatalogPart[] = [
  esp32DevkitV1,
  adafruitMax98357aI2sMonoAmp,
  speaker40mm4ohm,
  ...adafruitStemmaLabelerParts,
]

export function buildCatalogPromptSummary() {
  return catalogParts
    .map(
      (part) =>
        [
          `${part.id}: ${part.name}`,
          `category: ${part.category}`,
          `description: ${part.description}`,
          `attachment points: ${part.attachmentPoints.map((point) => point.id).join(', ')}`,
          `electrical ports: ${part.electricalPorts.map((port) => port.id).join(', ')}`,
        ].join('\n'),
    )
    .join('\n\n')
}
