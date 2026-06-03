import {
  isPlanReview,
  planReviewSchema,
} from '../../../_shared/hardwarePlanContract.ts'
import { generateStructuredObject } from '../../providers/geminiStructured.ts'
import type { HardwarePlanningContext, ReviewInput } from '../planningTypes.ts'

export async function reviewPlan(
  context: HardwarePlanningContext,
): Promise<HardwarePlanningContext> {
  if (
    !context.overview ||
    !context.architecture ||
    !context.components ||
    !context.connections
  ) {
    throw new Error(
      'Review step requires overview, architecture, components, and connections.',
    )
  }

  const review = await generateStructuredObject({
    prompt: buildReviewPrompt({
      prompt: context.prompt,
      overview: context.overview,
      architecture: context.architecture,
      components: context.components,
      connections: context.connections,
    }),
    schema: planReviewSchema,
    validate: isPlanReview,
    invalidMessage: 'Gemini returned an invalid plan review.',
  })

  return { ...context, review }
}

export function buildReviewPrompt(input: ReviewInput) {
  return `
Review this hardware plan for beginner accessibility and obvious electrical risks.

Rules:
- Flag unsafe or ambiguous power, voltage, current, and wiring assumptions.
- Confirm that high-current loads use drivers and external power where needed.
- Prefer open questions over pretending unknown details are known.
- Keep warnings and next steps concise.
- Return only the structured JSON object required by the schema.

User prompt:
${input.prompt}

Overview:
${JSON.stringify(input.overview)}

Architecture:
${JSON.stringify(input.architecture)}

Components:
${JSON.stringify(input.components)}

Connections:
${JSON.stringify(input.connections)}
`.trim()
}
