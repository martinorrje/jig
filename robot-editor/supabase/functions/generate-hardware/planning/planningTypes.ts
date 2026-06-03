import type {
  ComponentSelection,
  ConnectionPlan,
  HardwarePlan,
  PlanReview,
  ProductOverview,
  SystemArchitecture,
} from '../../_shared/hardwarePlanContract.ts'

export type OverviewInput = {
  prompt: string
}

export type ArchitectureInput = {
  prompt: string
  overview: ProductOverview
}

export type ComponentsInput = {
  prompt: string
  overview: ProductOverview
  architecture: SystemArchitecture
}

export type ConnectionsInput = {
  prompt: string
  overview: ProductOverview
  architecture: SystemArchitecture
  components: ComponentSelection
}

export type ReviewInput = {
  prompt: string
  overview: ProductOverview
  architecture: SystemArchitecture
  components: ComponentSelection
  connections: ConnectionPlan
}

export type HardwarePlanningContext = {
  prompt: string
  overview?: ProductOverview
  architecture?: SystemArchitecture
  components?: ComponentSelection
  connections?: ConnectionPlan
  review?: PlanReview
  plan?: HardwarePlan
}

export type CompletedHardwarePlanningContext = HardwarePlanningContext & {
  plan: HardwarePlan
}

export type PlanningStep = (
  context: HardwarePlanningContext,
) => Promise<HardwarePlanningContext>
