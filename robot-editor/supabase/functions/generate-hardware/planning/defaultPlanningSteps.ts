import { assembleHardwarePlan } from './steps/assembleHardwarePlan.ts'
import { chooseComponents } from './steps/chooseComponents.ts'
import { generateArchitecture } from './steps/generateArchitecture.ts'
import { generateConnections } from './steps/generateConnections.ts'
import { generateOverview } from './steps/generateOverview.ts'
import { reviewPlan } from './steps/reviewPlan.ts'
import type { PlanningStep } from './planningTypes.ts'

export const defaultPlanningSteps: PlanningStep[] = [
  generateOverview,
  generateArchitecture,
  chooseComponents,
  generateConnections,
  reviewPlan,
  assembleHardwarePlan,
]
