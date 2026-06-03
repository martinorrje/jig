import type { HardwarePlan } from '../../../_shared/hardwarePlanContract.ts'
import type { HardwareSpec } from '../../../_shared/hardwareSpecContract.ts'
import type { HardwarePlanningContext } from '../planningTypes.ts'

export async function assembleHardwarePlan(
  context: HardwarePlanningContext,
): Promise<HardwarePlanningContext> {
  const { overview, architecture, components, connections, review } = context

  if (!overview || !architecture || !components || !connections || !review) {
    throw new Error(
      'Plan assembly requires overview, architecture, components, connections, and review.',
    )
  }

  return {
    ...context,
    plan: {
      overview,
      architecture,
      components,
      connections,
      review,
      spec: composeHardwareSpec({
        overview,
        architecture,
        connections,
        review,
      }),
    },
  }
}

function composeHardwareSpec({
  overview,
  architecture,
  connections,
  review,
}: Pick<
  HardwarePlan,
  'overview' | 'architecture' | 'connections' | 'review'
>): HardwareSpec {
  return {
    title: overview.title,
    summary: overview.summary,
    requirements: [
      ...overview.requirements,
      ...architecture.subsystems.map(
        (subsystem) => `${subsystem.name}: ${subsystem.purpose}`,
      ),
    ],
    constraints: overview.constraints,
    assumptions: overview.assumptions,
    risks: [
      ...overview.risks,
      ...connections.warnings,
      ...review.warnings,
    ],
  }
}
