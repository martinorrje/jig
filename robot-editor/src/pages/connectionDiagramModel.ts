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

export type DiagramNodeLayout = {
  nodeId: string
  column: number
  row: number
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

export function createDiagramNodeLayout(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
): DiagramNodeLayout[] {
  const nodeIds = nodes.map((node) => node.id)
  const nodeIdSet = new Set(nodeIds)
  const validEdges = edges.filter(
    (edge) => nodeIdSet.has(edge.fromNodeId) && nodeIdSet.has(edge.toNodeId),
  )
  const incoming = new Map<string, string[]>()
  const outgoing = new Map<string, string[]>()

  for (const nodeId of nodeIds) {
    incoming.set(nodeId, [])
    outgoing.set(nodeId, [])
  }

  for (const edge of validEdges) {
    incoming.get(edge.toNodeId)?.push(edge.fromNodeId)
    outgoing.get(edge.fromNodeId)?.push(edge.toNodeId)
  }

  const columns = createNodeColumns(nodes, validEdges, incoming, outgoing)

  return columns.flatMap((columnNodeIds, column) =>
    columnNodeIds.map((nodeId, row) => ({ nodeId, column, row })),
  )
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

function createNodeColumns(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  incoming: Map<string, string[]>,
  outgoing: Map<string, string[]>,
) {
  if (nodes.length === 0) return []

  const nodeIds = nodes.map((node) => node.id)
  const levels = new Map(nodeIds.map((nodeId) => [nodeId, 0]))
  const connectedNodeIds = new Set(
    edges.flatMap((edge) => [edge.fromNodeId, edge.toNodeId]),
  )
  const roots = nodeIds.filter(
    (nodeId) =>
      outgoing.get(nodeId)?.length && (incoming.get(nodeId)?.length ?? 0) === 0,
  )

  for (const root of roots.length > 0 ? roots : nodeIds) {
    levels.set(root, 0)
  }

  for (let pass = 0; pass < nodeIds.length; pass += 1) {
    for (const edge of edges) {
      const fromLevel = levels.get(edge.fromNodeId) ?? 0
      const toLevel = levels.get(edge.toNodeId) ?? 0
      const nextLevel = Math.min(fromLevel + 1, Math.max(0, nodeIds.length - 1))

      if (nextLevel > toLevel) {
        levels.set(edge.toNodeId, nextLevel)
      }
    }
  }

  const maxConnectedLevel = Math.max(
    0,
    ...nodeIds
      .filter((nodeId) => connectedNodeIds.has(nodeId))
      .map((nodeId) => levels.get(nodeId) ?? 0),
  )

  for (const nodeId of nodeIds) {
    if (!connectedNodeIds.has(nodeId)) {
      levels.set(nodeId, maxConnectedLevel + 1)
    }
  }

  const columns = new Map<number, string[]>()
  const nodeOrder = new Map(nodes.map((node, index) => [node.id, index]))

  for (const nodeId of nodeIds) {
    const level = levels.get(nodeId) ?? 0
    columns.set(level, [...(columns.get(level) ?? []), nodeId])
  }

  const orderedColumns = Array.from(columns.entries())
    .sort(([firstLevel], [secondLevel]) => firstLevel - secondLevel)
    .map(([, columnNodeIds], columnIndex, allColumns) => {
      const previousColumnNodeIds = allColumns[columnIndex - 1]?.[1] ?? []

      return sortColumnNodes(
        columnNodeIds,
        nodes,
        nodeOrder,
        incoming,
        previousColumnNodeIds,
      )
    })

  return orderedColumns
}

function sortColumnNodes(
  nodeIds: string[],
  nodes: DiagramNode[],
  nodeOrder: Map<string, number>,
  incoming: Map<string, string[]>,
  previousColumnNodeIds: string[],
) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const previousOrder = new Map(
    previousColumnNodeIds.map((nodeId, index) => [nodeId, index]),
  )

  return [...nodeIds].sort((firstNodeId, secondNodeId) => {
    const firstBarycenter = getIncomingBarycenter(
      incoming.get(firstNodeId) ?? [],
      previousOrder,
    )
    const secondBarycenter = getIncomingBarycenter(
      incoming.get(secondNodeId) ?? [],
      previousOrder,
    )

    if (firstBarycenter !== secondBarycenter) {
      return firstBarycenter - secondBarycenter
    }

    return (
      getNodePriority(nodeById.get(firstNodeId), nodeOrder.get(firstNodeId) ?? 0) -
      getNodePriority(nodeById.get(secondNodeId), nodeOrder.get(secondNodeId) ?? 0)
    )
  })
}

function getIncomingBarycenter(
  incomingNodeIds: string[],
  previousOrder: Map<string, number>,
) {
  const positions = incomingNodeIds
    .map((nodeId) => previousOrder.get(nodeId))
    .filter((position): position is number => position !== undefined)

  if (positions.length === 0) return Number.POSITIVE_INFINITY

  return positions.reduce((sum, position) => sum + position, 0) / positions.length
}

function getNodePriority(node: DiagramNode | undefined, fallback: number) {
  if (!node) return fallback

  const text = `${node.id} ${node.name} ${node.role} ${node.category}`.toLowerCase()

  if (
    text.includes('controller') ||
    text.includes('control') ||
    text.includes('esp32') ||
    text.includes('microcontroller')
  ) {
    return -100 + fallback
  }

  if (text.includes('power') || text.includes('battery') || text.includes('supply')) {
    return -50 + fallback
  }

  return fallback
}
