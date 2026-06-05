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
- Only use STEMMA QT / Qwiic connectorized cable connections for v1.
- Use 3.3V for every STEMMA QT / Qwiic bus.
- Never use 5V for a Qwiic-compatible bus.
- Model each STEMMA QT / Qwiic connection as one cable that carries power, ground, SDA, and SCL.
- Do not create separate loose-wire power, ground, SDA, or SCL connections for STEMMA QT / Qwiic parts.
- Set connectorStandard to "stemma-qt" or "qwiic" and busVoltage to "3.3V" for every connection.
- fromComponentId and toComponentId must exactly match component ids from components.components.
- Do not drive high-current loads directly from ESP32 GPIO.
- Add a driver module between the ESP32 and motors, pumps, fans, heaters, solenoids, relays, or LED strips.
- Treat non-STEMMA/Qwiic peripherals as unresolved for v1 unless a compatible connectorized catalog module exists.
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
