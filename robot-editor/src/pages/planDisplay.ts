import type { HardwarePlan } from '../model/types'

export type PlanDisplaySection = {
  title: string
  items: string[]
}

export function createPlanDisplaySections(
  plan: HardwarePlan,
): PlanDisplaySection[] {
  return [
    {
      title: 'Product overview',
      items: [
        `Title: ${plan.overview.title}`,
        `Summary: ${plan.overview.summary}`,
        ...plan.overview.requirements.map((item) => `Requirement: ${item}`),
        ...plan.overview.constraints.map((item) => `Constraint: ${item}`),
        ...plan.overview.assumptions.map((item) => `Assumption: ${item}`),
        ...plan.overview.risks.map((item) => `Risk: ${item}`),
      ],
    },
    {
      title: 'Architecture',
      items: plan.architecture.subsystems.map(
        (subsystem) =>
          `${subsystem.name} (${subsystem.id}): ${subsystem.purpose}`,
      ),
    },
    {
      title: 'Components',
      items: plan.components.components.map(
        (component) =>
          `${component.name} (${component.id}, ${formatPartRef(component.partRef)}): ${component.role}; ${component.category}; ${component.interface}; ${component.voltage}; ${component.beginnerConnection}`,
      ),
    },
    {
      title: 'Connections',
      items: plan.connections.connections.map(
        (connection) =>
          `${connection.id}: ${connection.fromComponentId}.${connection.fromPort} -> ${connection.toComponentId}.${connection.toPort} (${connection.interface}, ${connection.physicalMethod})`,
      ),
    },
    {
      title: 'Power notes',
      items: plan.connections.powerNotes,
    },
    {
      title: 'Connection warnings',
      items: plan.connections.warnings,
    },
    {
      title: 'Review warnings',
      items: plan.review.warnings,
    },
    {
      title: 'Open questions',
      items: plan.review.openQuestions,
    },
    {
      title: 'Next steps',
      items: plan.review.nextSteps,
    },
  ].filter((section) => section.items.length > 0)
}

function formatPartRef(partRef: HardwarePlan['components']['components'][number]['partRef']) {
  if (partRef.kind === 'catalog') {
    return `catalog: ${partRef.catalogPartId}`
  }

  return `unresolved: ${partRef.description}`
}
