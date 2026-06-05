import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import type { HardwarePlan } from '../model/types'
import {
  createConnectionDiagramModel,
  type ConnectionDiagramModel,
} from './connectionDiagramModel'

type Point = {
  x: number
  y: number
}

type RenderedEdge = {
  id: string
  label: string
  physicalMethod: string
  from: Point
  to: Point
  labelPosition: Point
}

type DragState = {
  nodeId: string
  offset: Point
}

type ConnectionDiagramProps = {
  plan: HardwarePlan
}

export function ConnectionDiagram({ plan }: ConnectionDiagramProps) {
  const model = useMemo(() => createConnectionDiagramModel(plan), [plan])

  if (model.edges.length === 0 && model.issues.length === 0) return null

  return <ConnectionDiagramView model={model} />
}

function ConnectionDiagramView({ model }: { model: ConnectionDiagramModel }) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef(new Map<string, HTMLElement>())
  const dragRef = useRef<DragState | null>(null)
  const [renderedEdges, setRenderedEdges] = useState<RenderedEdge[]>([])
  const [nodePositions, setNodePositions] = useState<Record<string, Point>>({})
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const nodeKey = useMemo(
    () => model.nodes.map((node) => node.id).join('|'),
    [model.nodes],
  )

  const setNodeRef = useCallback(
    (nodeId: string) => (element: HTMLElement | null) => {
      if (element) {
        nodeRefs.current.set(nodeId, element)
      } else {
        nodeRefs.current.delete(nodeId)
      }
    },
    [],
  )

  const placeNodes = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    const stageRect = stage.getBoundingClientRect()
    setNodePositions((currentPositions) => {
      const nextPositions: Record<string, Point> = {}
      const missingNodeIds = model.nodes
        .map((node) => node.id)
        .filter((nodeId) => !currentPositions[nodeId])
      const initialPositions = createInitialNodePositions(
        model.nodes.map((node) => node.id),
        stageRect,
      )

      for (const node of model.nodes) {
        const currentPosition = currentPositions[node.id]
        nextPositions[node.id] = currentPosition
          ? clampNodePosition(currentPosition, stageRect)
          : initialPositions[node.id] ?? { x: 12, y: 12 }
      }

      if (
        missingNodeIds.length === 0 &&
        positionsMatch(currentPositions, nextPositions)
      ) {
        return currentPositions
      }

      return nextPositions
    })
  }, [model.nodes])

  const measureEdges = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    const stageRect = stage.getBoundingClientRect()
    const nextEdges = model.edges.flatMap((edge) => {
      const fromElement = nodeRefs.current.get(edge.fromNodeId)
      const toElement = nodeRefs.current.get(edge.toNodeId)

      if (!fromElement || !toElement) return []

      const fromRect = fromElement.getBoundingClientRect()
      const toRect = toElement.getBoundingClientRect()
      const endpoints = getConnectionEndpoints(fromRect, toRect, stageRect)

      return [
        {
          id: edge.id,
          label: edge.label,
          physicalMethod: edge.physicalMethod,
          ...endpoints,
        },
      ]
    })

    setRenderedEdges(nextEdges)
  }, [model.edges])

  useLayoutEffect(() => {
    placeNodes()
  }, [nodeKey, placeNodes])

  useLayoutEffect(() => {
    measureEdges()

    const resizeObserver = new ResizeObserver(measureEdges)

    if (stageRef.current) {
      resizeObserver.observe(stageRef.current)
    }

    for (const node of nodeRefs.current.values()) {
      resizeObserver.observe(node)
    }

    window.addEventListener('resize', measureEdges)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', measureEdges)
    }
  }, [measureEdges])

  useLayoutEffect(() => {
    measureEdges()
  }, [nodePositions, measureEdges])

  useEffect(() => {
    const handleWindowResize = () => {
      placeNodes()
    }

    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [placeNodes])

  const handleNodePointerDown = useCallback(
    (nodeId: string) => (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return

      const stage = stageRef.current
      const position = nodePositions[nodeId]
      if (!stage || !position) return

      const stageRect = stage.getBoundingClientRect()
      dragRef.current = {
        nodeId,
        offset: {
          x: event.clientX - stageRect.left - position.x,
          y: event.clientY - stageRect.top - position.y,
        },
      }
      setDraggingNodeId(nodeId)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [nodePositions],
  )

  const handleNodePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    const stage = stageRef.current
    if (!drag || !stage) return

    const stageRect = stage.getBoundingClientRect()
    const nextPosition = clampNodePosition(
      {
        x: event.clientX - stageRect.left - drag.offset.x,
        y: event.clientY - stageRect.top - drag.offset.y,
      },
      stageRect,
    )

    setNodePositions((positions) => ({
      ...positions,
      [drag.nodeId]: nextPosition,
    }))
  }, [])

  const handleNodePointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
    dragRef.current = null
    setDraggingNodeId(null)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  return (
    <section className="connection-diagram" aria-labelledby="connection-diagram-title">
      <header className="connection-diagram-header">
        <div>
          <p className="eyebrow">Wiring view</p>
          <h2 id="connection-diagram-title">Generated connections</h2>
        </div>
        <p>
          Catalog parts are shown with their product images. Lines represent
          generated connectorized relationships, not exact physical placement.
        </p>
      </header>

      <div className="connection-diagram-stage" ref={stageRef}>
        {model.edges.length > 0 ? (
          <svg className="connection-lines" aria-hidden="true">
            {renderedEdges.map((edge) => {
              const midX = (edge.from.x + edge.to.x) / 2
              const midY = (edge.from.y + edge.to.y) / 2
              const path = `M ${edge.from.x} ${edge.from.y} C ${midX} ${edge.from.y}, ${midX} ${edge.to.y}, ${edge.to.x} ${edge.to.y}`

              return (
                <g key={edge.id}>
                  <path className="connection-line-shadow" d={path} />
                  <path className="connection-line" d={path} />
                  <circle className="connection-terminal" cx={edge.from.x} cy={edge.from.y} r="5" />
                  <circle className="connection-terminal" cx={edge.to.x} cy={edge.to.y} r="5" />
                  <text className="connection-line-label" x={midX} y={midY - 12} textAnchor="middle">
                    {edge.label}
                  </text>
                </g>
              )
            })}
          </svg>
        ) : null}

        <div className="connection-node-grid">
          {model.nodes.map((node) => (
            <article
              className={`connection-node${draggingNodeId === node.id ? ' is-dragging' : ''}`}
              key={node.id}
              ref={setNodeRef(node.id)}
              style={{
                transform: `translate(${nodePositions[node.id]?.x ?? 0}px, ${nodePositions[node.id]?.y ?? 0}px)`,
              }}
              onPointerDown={handleNodePointerDown(node.id)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={handleNodePointerUp}
              onPointerCancel={handleNodePointerUp}
            >
              <div className="connection-node-image">
                {node.imageUrl ? (
                  <img src={node.imageUrl} alt={node.imageAlt ?? node.name} />
                ) : (
                  <span>{node.category.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="connection-node-copy">
                <h3>{node.name}</h3>
                <p>{node.role}</p>
                <small>{node.catalogPartId ?? 'Unresolved part'}</small>
              </div>
            </article>
          ))}
        </div>

        {renderedEdges.map((edge) => (
          <div
            className="connection-cable-label"
            key={`${edge.id}-label`}
            style={{
              left: edge.labelPosition.x,
              top: edge.labelPosition.y,
            }}
          >
            {edge.label}
          </div>
        ))}
      </div>

      {model.issues.length > 0 ? (
        <div className="connection-diagram-warning" role="status">
          Some generated connections could not be drawn because their component
          IDs do not match the selected component list.
        </div>
      ) : null}

      <ul className="connection-edge-list" aria-label="Generated connection list">
        {model.edges.map((edge) => (
          <li key={edge.id}>
            <span>{edge.label}</span>
            <small>
              {edge.fromNodeId}.{edge.fromPort} {'->'} {edge.toNodeId}.
              {edge.toPort}
              {' · '}
              {edge.physicalMethod}
            </small>
          </li>
        ))}
        {model.issues.map((issue) => (
          <li className="connection-edge-issue" key={issue.id}>
            <span>{issue.label}</span>
            <small>{issue.detail}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}

function getConnectionEndpoints(
  fromRect: DOMRect,
  toRect: DOMRect,
  stageRect: DOMRect,
) {
  const fromCenter = getRectCenter(fromRect, stageRect)
  const toCenter = getRectCenter(toRect, stageRect)
  const horizontal = Math.abs(fromCenter.x - toCenter.x) >= Math.abs(fromCenter.y - toCenter.y)

  if (horizontal) {
    const leftToRight = fromCenter.x <= toCenter.x
    const from = {
      x: (leftToRight ? fromRect.right : fromRect.left) - stageRect.left,
      y: fromRect.top + Math.min(fromRect.height * 0.34, 96) - stageRect.top,
    }
    const to = {
      x: (leftToRight ? toRect.left : toRect.right) - stageRect.left,
      y: toRect.top + Math.min(toRect.height * 0.34, 96) - stageRect.top,
    }

    return {
      from,
      to,
      labelPosition: {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2 - 28,
      },
    }
  }

  const topToBottom = fromCenter.y <= toCenter.y
  const from = {
    x: fromCenter.x,
    y: (topToBottom ? fromRect.bottom : fromRect.top) - stageRect.top,
  }
  const to = {
    x: toCenter.x,
    y: (topToBottom ? toRect.top : toRect.bottom) - stageRect.top,
  }

  return {
    from,
    to,
    labelPosition: {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2 - 18,
    },
  }
}

function getRectCenter(rect: DOMRect, stageRect: DOMRect): Point {
  return {
    x: rect.left + rect.width / 2 - stageRect.left,
    y: rect.top + rect.height / 2 - stageRect.top,
  }
}

function createInitialNodePositions(nodeIds: string[], stageRect: DOMRect) {
  const nodeWidth = getNodeWidth(stageRect)
  const nodeHeight = getNodeHeight(stageRect)
  const gap = 28
  const columns = Math.max(
    1,
    Math.floor((stageRect.width + gap) / (nodeWidth + gap)),
  )
  const rows = Math.ceil(nodeIds.length / columns)
  const totalWidth = Math.min(
    stageRect.width,
    columns * nodeWidth + (columns - 1) * gap,
  )
  const startX = Math.max(18, (stageRect.width - totalWidth) / 2)
  const totalHeight = rows * nodeHeight + (rows - 1) * gap
  const startY = Math.max(18, (stageRect.height - totalHeight) / 2)

  return Object.fromEntries(
    nodeIds.map((nodeId, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)

      return [
        nodeId,
        {
          x: startX + column * (nodeWidth + gap),
          y: startY + row * (nodeHeight + gap),
        },
      ]
    }),
  )
}

function clampNodePosition(position: Point, stageRect: DOMRect): Point {
  const nodeWidth = getNodeWidth(stageRect)
  const nodeHeight = getNodeHeight(stageRect)

  return {
    x: clamp(position.x, 12, Math.max(12, stageRect.width - nodeWidth - 12)),
    y: clamp(position.y, 12, Math.max(12, stageRect.height - nodeHeight - 12)),
  }
}

function positionsMatch(
  first: Record<string, Point>,
  second: Record<string, Point>,
) {
  const firstKeys = Object.keys(first)
  const secondKeys = Object.keys(second)

  return (
    firstKeys.length === secondKeys.length &&
    secondKeys.every(
      (key) =>
        first[key]?.x === second[key]?.x && first[key]?.y === second[key]?.y,
    )
  )
}

function getNodeWidth(stageRect: DOMRect) {
  return stageRect.width < 680 ? Math.min(stageRect.width - 24, 360) : 230
}

function getNodeHeight(stageRect: DOMRect) {
  return stageRect.width < 680 ? 134 : 256
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
