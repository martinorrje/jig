import {
  isProductOverview,
  productOverviewSchema,
} from '../../../_shared/hardwarePlanContract.ts'
import { generateStructuredObject } from '../../providers/geminiStructured.ts'
import type { HardwarePlanningContext, OverviewInput } from '../planningTypes.ts'

export async function generateOverview(
  context: HardwarePlanningContext,
): Promise<HardwarePlanningContext> {
  const overview = await generateStructuredObject({
    prompt: buildOverviewPrompt(context),
    schema: productOverviewSchema,
    validate: isProductOverview,
    invalidMessage: 'Gemini returned an invalid product overview.',
  })

  return { ...context, overview }
}

export function buildOverviewPrompt({ prompt }: OverviewInput) {
  return `
Create a practical first-pass hardware overview from the user prompt.

Rules:
- Describe what is being designed, not exact implementation details.
- Do not invent exact dimensions, prices, certifications, or part numbers.
- Prefer clear assumptions over hidden guesses.
- Keep each list item concise.
- Return only the structured JSON object required by the schema.

User prompt:
${prompt}
`.trim()
}
