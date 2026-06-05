import {
  describeHardwarePlanValidationErrors,
  hardwarePlanSchema,
  type HardwarePlan,
  isHardwarePlan,
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

  const plan = value as HardwarePlan

  if (!Array.isArray(plan.components?.components)) return value

  return {
    ...plan,
    components: {
      ...plan.components,
      components: plan.components.components.map((component) => ({
        ...component,
        partRef: normalizePartRef(component.partRef, component.name),
      })),
    },
  }
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
- Prefer ESP32-compatible controller options when embedded control is applicable.
- Prefer connectorized physical methods such as Grove, Qwiic, STEMMA, or STEMMA QT before breadboards or loose jumpers.
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
