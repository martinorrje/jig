import type { HardwarePlan } from '../../_shared/hardwarePlanContract.ts'
import type {
  CompletedHardwarePlanningContext,
  HardwarePlanningContext,
  PlanningStep,
} from './planningTypes.ts'

export async function runHardwarePlanningPipeline(
  prompt: string,
  steps: PlanningStep[],
): Promise<HardwarePlan> {
  const context = assertCompletedPlanningContext(
    await runPlanningSteps({ prompt }, steps),
  )

  return context.plan
}

async function runPlanningSteps(
  initialContext: HardwarePlanningContext,
  steps: PlanningStep[],
) {
  let context = initialContext

  for (const step of steps) {
    context = await step(context)
  }

  return context
}

function assertCompletedPlanningContext(
  context: HardwarePlanningContext,
): CompletedHardwarePlanningContext {
  if (!context.plan) {
    throw new Error('Hardware planning pipeline did not produce a plan.')
  }

  return context as CompletedHardwarePlanningContext
}
