import {
  describeHardwarePlanValidationErrors,
  hardwarePlanSchema,
  type HardwarePlan,
  isHardwarePlan,
  normalizeHardwarePlan as normalizeHardwarePlanContract,
} from '../../_shared/hardwarePlanContract.ts'
import { buildCatalogPromptSummary } from '../catalog/partCatalog.ts'
import { generateStructuredObject } from '../providers/geminiStructured.ts'

export async function generateHardwarePlan(prompt: string) {
  return generateStructuredObject({
    prompt: buildHardwarePlanPrompt(prompt),
    schema: hardwarePlanSchema,
    normalize: normalizeHardwarePlan,
    validate: isHardwarePlan,
    invalidMessage: (value) =>
      `Gemini returned an invalid hardware plan: ${describeHardwarePlanValidationErrors(value).join('; ')}`,
  })
}

export function normalizeHardwarePlan(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value

  const plan = normalizeHardwarePlanContract(value) as HardwarePlan

  if (!Array.isArray(plan.components?.components)) return value

  return normalizeHardwarePlanContract({
    ...plan,
    components: {
      ...plan.components,
      components: plan.components.components.map((component) => ({
        ...component,
        partRef: normalizePartRef(component.partRef, component.name),
      })),
    },
  })
}

function normalizePartRef(partRef: unknown, componentName: string) {
  if (!partRef || typeof partRef !== 'object') {
    return createUnresolvedPartRef(componentName)
  }

  const ref = partRef as Record<string, unknown>
  const kind = ref.kind === 'catalog' ? 'catalog' : 'unresolved'
  const catalogPartId =
    typeof ref.catalogPartId === 'string' ? ref.catalogPartId.trim() : ''

  if (kind === 'catalog' && catalogPartId) {
    return {
      kind: 'catalog',
      catalogPartId,
      description: typeof ref.description === 'string' ? ref.description : '',
      reason: typeof ref.reason === 'string' ? ref.reason : '',
    }
  }

  return createUnresolvedPartRef(
    typeof ref.description === 'string' && ref.description.trim()
      ? ref.description
      : componentName,
    typeof ref.reason === 'string' && ref.reason.trim()
      ? ref.reason
      : undefined,
  )
}

function createUnresolvedPartRef(description: string, reason?: string) {
  return {
    kind: 'unresolved',
    catalogPartId: '',
    description: description.trim() || 'Unspecified component',
    reason: reason ?? 'No matching catalog part was selected.',
  }
}

export function buildHardwarePlanPrompt(prompt: string) {
  return `
Generate a complete beginner-friendly hardware plan.

Rules:
- Return only the structured JSON object required by the schema.
- Keep the plan concise enough to review quickly.
- Prefer catalog parts whenever possible.
- Only choose connectorized STEMMA QT / Qwiic parts for v1.
- Use a 3.3V STEMMA QT / Qwiic bus for every connectorized connection.
- Never use 5V for a Qwiic-compatible bus.
- Set connection connectorStandard to "stemma-qt" or "qwiic" and busVoltage to "3.3V".
- Always include a power section that specifies exactly how the created hardware configuration should be powered.
- The power section must name the primary source, input voltage, regulated rails, distribution path, user power-up instructions, and safety notes.
- If the correct power source is unknown, say what must be confirmed instead of guessing a dangerous supply.
- Prefer ESP32-compatible controller options with a STEMMA QT/Qwiic connector when embedded control is applicable.
- If no connectorized catalog part fits, mark the component unresolved instead of inventing loose wiring.
- Use driver modules for motors, pumps, fans, heaters, solenoids, relays, and LED strips.
- Do not drive high-current loads directly from ESP32 GPIO.
- Do not pretend unresolved parts have CAD assets.
- Do not assign exact ESP32 GPIO pins yet.
- Make spec a concise summary of the same plan.

User prompt:
${prompt}

Part catalog:
${buildCatalogPromptSummary()}
`.trim()
}
