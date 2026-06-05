import type { HardwarePlan } from '../model/types'
import { catalogVisuals, type CatalogVisual } from './catalogVisuals'

type PlanComponent = HardwarePlan['components']['components'][number]
type PlanConnection = HardwarePlan['connections']['connections'][number]

export type DiagramNode = {
  id: string
  name: string
  role: string
  category: string
  catalogPartId?: string
  imageUrl?: string
  imageAlt?: string
}

export type DiagramEdge = {
  id: string
  fromNodeId: string
  fromPort: string
  toNodeId: string
  toPort: string
  label: string
  physicalMethod: string
}

export type DiagramConnectionIssue = {
  id: string
  label: string
  detail: string
}

export type ConnectionDiagramModel = {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  issues: DiagramConnectionIssue[]
}

export function createConnectionDiagramModel(
  plan: HardwarePlan,
  visuals: Record<string, CatalogVisual> = catalogVisuals,
): ConnectionDiagramModel {
  const nodes = plan.components.components.map((component) =>
    createDiagramNode(component, visuals),
  )
  const nodeIds = new Set(nodes.map((node) => node.id))
  const edges: DiagramEdge[] = []
  const issues: DiagramConnectionIssue[] = []

  for (const connection of plan.connections.connections) {
    if (hasRenderableEndpoints(connection, nodeIds)) {
      edges.push(createDiagramEdge(connection))
    } else {
      issues.push(createDiagramConnectionIssue(connection, nodeIds))
    }
  }

  return { nodes, edges, issues }
}

export function shouldShowConnectionDiagram(plan: HardwarePlan) {
  return plan.connections.connections.length > 0
}

function createDiagramNode(
  component: PlanComponent,
  visuals: Record<string, CatalogVisual>,
): DiagramNode {
  const baseNode = {
    id: component.id,
    name: component.name,
    role: component.role,
    category: component.category,
  }

  if (component.partRef.kind !== 'catalog') {
    return baseNode
  }

  const visual = visuals[component.partRef.catalogPartId]

  if (!visual) {
    return {
      ...baseNode,
      catalogPartId: component.partRef.catalogPartId,
    }
  }

  return {
    ...baseNode,
    catalogPartId: component.partRef.catalogPartId,
    imageUrl: visual.imageUrl,
    imageAlt: visual.imageAlt,
  }
}

function createDiagramEdge(connection: PlanConnection): DiagramEdge {
  return {
    id: connection.id,
    fromNodeId: connection.fromComponentId,
    fromPort: connection.fromPort,
    toNodeId: connection.toComponentId,
    toPort: connection.toPort,
    label: `${connection.interface} · ${connection.connectorStandard} · ${connection.busVoltage}`,
    physicalMethod: connection.physicalMethod,
  }
}

function createDiagramConnectionIssue(
  connection: PlanConnection,
  nodeIds: Set<string>,
): DiagramConnectionIssue {
  const missingEndpoints = [
    nodeIds.has(connection.fromComponentId)
      ? null
      : `from component "${connection.fromComponentId}"`,
    nodeIds.has(connection.toComponentId)
      ? null
      : `to component "${connection.toComponentId}"`,
  ].filter(Boolean)

  return {
    id: connection.id,
    label: `${connection.interface} · ${connection.connectorStandard} · ${connection.busVoltage}`,
    detail: `Could not draw ${connection.fromComponentId}.${connection.fromPort} -> ${connection.toComponentId}.${connection.toPort}; missing ${missingEndpoints.join(' and ')} in the component list.`,
  }
}

function hasRenderableEndpoints(
  connection: PlanConnection,
  nodeIds: Set<string>,
) {
  return (
    nodeIds.has(connection.fromComponentId) &&
    nodeIds.has(connection.toComponentId)
  )
}
