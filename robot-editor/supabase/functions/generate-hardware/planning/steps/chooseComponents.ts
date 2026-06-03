import {
  componentSelectionSchema,
  isComponentSelection,
} from '../../../_shared/hardwarePlanContract.ts'
import { buildCatalogPromptSummary } from '../../catalog/partCatalog.ts'
import { generateStructuredObject } from '../../providers/geminiStructured.ts'
import type {
  ComponentsInput,
  HardwarePlanningContext,
} from '../planningTypes.ts'

export async function chooseComponents(
  context: HardwarePlanningContext,
): Promise<HardwarePlanningContext> {
  if (!context.overview || !context.architecture) {
    throw new Error('Component step requires overview and architecture.')
  }

  const components = await generateStructuredObject({
    prompt: buildComponentsPrompt({
      prompt: context.prompt,
      overview: context.overview,
      architecture: context.architecture,
    }),
    schema: componentSelectionSchema,
    validate: isComponentSelection,
    invalidMessage: 'Gemini returned an invalid component selection.',
  })

  return { ...context, components }
}

export function buildComponentsPrompt(input: ComponentsInput) {
  return `
Choose beginner-friendly component categories for this hardware architecture.

Rules:
- Prefer connectorized modules for beginners when possible.
- Prefer catalog parts whenever possible.
- Set partRef.kind to "catalog" with a catalogPartId when a catalog part fits.
- Set partRef.kind to "unresolved" when no catalog part fits, with catalogPartId as an empty string and a clear description/reason.
- Prefer ESP32-compatible controller options when embedded control is applicable.
- Prefer Qwiic/STEMMA QT/Grove-style modules for simple sensors and displays.
- Use driver modules for motors, pumps, fans, heaters, solenoids, relays, and LED strips.
- Do not pretend unresolved parts have CAD assets.
- Do not invent exact distributor part numbers.
- Do not assign exact ESP32 GPIO pins yet.
- Return only the structured JSON object required by the schema.

User prompt:
${input.prompt}

Overview:
${JSON.stringify(input.overview)}

Architecture:
${JSON.stringify(input.architecture)}

Part catalog:
${buildCatalogPromptSummary()}
`.trim()
}
