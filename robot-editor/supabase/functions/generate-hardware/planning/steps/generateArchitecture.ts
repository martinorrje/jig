import {
  isSystemArchitecture,
  systemArchitectureSchema,
} from '../../../_shared/hardwarePlanContract.ts'
import { generateStructuredObject } from '../../providers/geminiStructured.ts'
import type {
  ArchitectureInput,
  HardwarePlanningContext,
} from '../planningTypes.ts'

export async function generateArchitecture(
  context: HardwarePlanningContext,
): Promise<HardwarePlanningContext> {
  if (!context.overview) {
    throw new Error('Architecture step requires overview.')
  }

  const architecture = await generateStructuredObject({
    prompt: buildArchitecturePrompt({
      prompt: context.prompt,
      overview: context.overview,
    }),
    schema: systemArchitectureSchema,
    validate: isSystemArchitecture,
    invalidMessage: 'Gemini returned an invalid system architecture.',
  })

  return { ...context, architecture }
}

export function buildArchitecturePrompt(input: ArchitectureInput) {
  return `
Break this hardware product into major subsystems.

Rules:
- Use stable lowercase ids such as "controller", "power", "sensing", "actuation", "ui", "connectivity", or "enclosure".
- Include only subsystems that are relevant to the requested product.
- If embedded control is applicable, include a controller subsystem and prefer an ESP32-class controller unless requirements imply otherwise.
- Do not choose exact components or pin assignments in this step.
- Return only the structured JSON object required by the schema.

User prompt:
${input.prompt}

Overview:
${JSON.stringify(input.overview)}
`.trim()
}
