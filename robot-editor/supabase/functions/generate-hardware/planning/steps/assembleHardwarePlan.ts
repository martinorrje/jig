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
      power: composePowerPlan(connections),
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

function composePowerPlan(connections: HardwarePlan['connections']) {
  return {
    primarySource: 'User-provided power source appropriate for the selected modules.',
    inputVoltage: 'Confirm from the selected controller, modules, and loads.',
    regulatedRails: ['3.3V logic rail for STEMMA QT / Qwiic I2C modules.'],
    distribution:
      connections.powerNotes.length > 0
        ? connections.powerNotes
        : ['Route power through the selected controller and compatible connectorized modules.'],
    userInstructions: [
      'Confirm voltage and current requirements before connecting power.',
    ],
    safetyNotes: [
      'Use a current-limited supply during first bring-up.',
      'Do not power high-current loads directly from ESP32 GPIO.',
    ],
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
