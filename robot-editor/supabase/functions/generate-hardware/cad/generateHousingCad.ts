import type { HardwarePlan } from '../../_shared/hardwarePlanContract.ts'
import { generateStructuredObject } from '../providers/geminiStructured.ts'

type Build123dResponse = {
  build123dCode: string
}

const build123dSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    build123dCode: { type: 'string' },
  },
  required: ['build123dCode'],
} as const

export async function generateHousingCad(prompt: string, plan: HardwarePlan) {
  const { build123dCode } = await generateStructuredObject({
    prompt: buildHousingCadPrompt(prompt, plan),
    schema: build123dSchema,
    validate: isBuild123dResponse,
    invalidMessage: 'Gemini returned invalid build123d code.',
  })

  const workerUrl = Deno.env.get('CAD_WORKER_URL')

  if (!workerUrl) {
    return { status: 'skipped', reason: 'Missing CAD_WORKER_URL', build123dCode }
  }

  const workerToken = Deno.env.get('CAD_WORKER_TOKEN')?.trim()

  if (!workerToken) {
    return { status: 'skipped', reason: 'Missing CAD_WORKER_TOKEN', build123dCode }
  }

  const response = await fetch(`${workerUrl.replace(/\/$/, '')}/render-shell`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${workerToken}`,
    },
    body: JSON.stringify({
      description: prompt,
      build123dCode,
    }),
  })

  if (!response.ok) {
    throw new Error(`CAD worker failed: ${response.status} ${await response.text()}`)
  }

  return {
    status: 'succeeded',
    build123dCode,
    workerResult: await response.json(),
  }
}

export function buildHousingCadPrompt(prompt: string, plan: HardwarePlan) {
  return `
Generate pure Python build123d code for a simple printable housing shell.

Rules:
- Return only JSON with build123dCode.
- The Python code may import from build123d.
- Assign the final shape to a variable named shell.
- Keep the model simple and robust.
- Create a housing shell for the selected hardware parts.
- Use only simple build123d primitives and boolean operations: Box, Cylinder, Sphere, Location, Pos, add, subtract.
- Do not use Extrude, extrude, BuildSketch, BuildPart, Rectangle, Circle, make_face, or sweep-style APIs.
- Prefer a simple rectangular enclosure shell made from boxes and cylinders.
- Do not include markdown fences.

User prompt:
${prompt}

Hardware plan:
${JSON.stringify(plan)}
`.trim()
}

function isBuild123dResponse(value: unknown): value is Build123dResponse {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as { build123dCode?: unknown }).build123dCode === 'string'
  )
}
