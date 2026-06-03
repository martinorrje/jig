import {
  connectionPlanSchema,
  isConnectionPlan,
} from '../../../_shared/hardwarePlanContract.ts'
import { generateStructuredObject } from '../../providers/geminiStructured.ts'
import type {
  ConnectionsInput,
  HardwarePlanningContext,
} from '../planningTypes.ts'

export async function generateConnections(
  context: HardwarePlanningContext,
): Promise<HardwarePlanningContext> {
  if (!context.overview || !context.architecture || !context.components) {
    throw new Error(
      'Connection step requires overview, architecture, and components.',
    )
  }

  const connections = await generateStructuredObject({
    prompt: buildConnectionsPrompt({
      prompt: context.prompt,
      overview: context.overview,
      architecture: context.architecture,
      components: context.components,
    }),
    schema: connectionPlanSchema,
    validate: isConnectionPlan,
    invalidMessage: 'Gemini returned an invalid connection plan.',
  })

  return { ...context, connections }
}

export function buildConnectionsPrompt(input: ConnectionsInput) {
  return `
Create a beginner-friendly logical connection plan for these components.

Rules:
- Prefer connectorized physical methods such as Grove, Qwiic, STEMMA, or STEMMA QT before breadboards or loose jumpers.
- Use explicit power and ground connections.
- Do not drive high-current loads directly from ESP32 GPIO.
- Add a driver module between the ESP32 and motors, pumps, fans, heaters, solenoids, relays, or LED strips.
- Treat 5V peripherals as needing level shifting or a compatible driver unless explicitly 3.3V-compatible.
- Do not assign exact ESP32 GPIO pins yet.
- Return only the structured JSON object required by the schema.

User prompt:
${input.prompt}

Overview:
${JSON.stringify(input.overview)}

Architecture:
${JSON.stringify(input.architecture)}

Components:
${JSON.stringify(input.components)}
`.trim()
}
