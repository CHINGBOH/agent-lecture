/**
 * FlowDiagram — native React flow diagram renderer
 *
 * Layout: @dagrejs/dagre (from dagre-d3-es)
 * Nodes:  absolute-positioned <div> elements (full CSS/theme support)
 * Edges:  SVG <path> with arrowhead markers
 * No interactivity, no external viewport library.
 */
import { useEffect, useRef, useState } from 'react'
import { graphlib, layout } from '@dagrejs/dagre'
import type { FlowGraph, FlowNode, FlowEdge, FlowGroup } from '../data/types'
import type { ChapterTheme } from '../data/themes'

// ─── constants ───────────────────────────────────────────────────────────────
const NODE_W = 110
const NODE_H = 46
const DIAMOND_W = 90
const DIAMOND_H = 52
const RANK_SEP_LR = 68
const RANK_SEP_TD = 64
const NODE_SEP = 28

interface PositionedNode {
  id: string
  x: number; y: number; w: number; h: number
  def: FlowNode
}

interface PositionedEdge {
  from: string; to: string
  label?: string
  dashed?: boolean
  points: { x: number; y: number }[]
}

interface PositionedGroup {
  def: FlowGroup
  x: number; y: number; w: number; h: number
}

interface Layout {
  nodes: PositionedNode[]
  edges: PositionedEdge[]
  groups: PositionedGroup[]
  totalW: number
  totalH: number
}

// ─── helper: run dagre layout ─────────────────────────────────────────────────
function computeLayout(graph: FlowGraph): Layout {
  const g = new graphlib.Graph({ compound: true, multigraph: true })
  g.setGraph({
    rankdir: graph.direction,
    nodesep: NODE_SEP,
    ranksep: graph.direction === 'LR' ? RANK_SEP_LR : RANK_SEP_TD,
    marginx: 20,
    marginy: 20,
  })
  g.setDefaultEdgeLabel(() => ({}))

  // nodes
  graph.nodes.forEach(n => {
    const isDiamond = n.shape === 'diamond'
    g.setNode(n.id, {
      label: n.id,
      width: isDiamond ? DIAMOND_W : NODE_W,
      height: isDiamond ? DIAMOND_H : NODE_H,
    })
  })

  // groups (compound nodes)
  if (graph.groups) {
    graph.groups.forEach(grp => {
      g.setNode(grp.id, { label: grp.id, width: 0, height: 0 })
      grp.nodeIds.forEach(nid => g.setParent(nid, grp.id))
    })
  }

  // edges — use unique key for multigraph
  graph.edges.forEach((e, i) => {
    g.setEdge({ v: e.from, w: e.to, name: String(i) }, {
      label: e.label ?? '',
      labeloffset: 6,
    })
  })

  layout(g)

  // extract node positions
  const nodes: PositionedNode[] = graph.nodes.map(def => {
    const n = g.node(def.id)
    return {
      id: def.id, def,
      x: n.x - n.width / 2,
      y: n.y - n.height / 2,
      w: n.width,
      h: n.height,
    }
  })

  // extract edge points
  const edges: PositionedEdge[] = graph.edges.map((def, i) => {
    const e = g.edge({ v: def.from, w: def.to, name: String(i) })
    return {
      from: def.from, to: def.to,
      label: def.label,
      dashed: def.dashed,
      points: (e?.points ?? []) as { x: number; y: number }[],
    }
  })

  // extract group bounds
  const groups: PositionedGroup[] = (graph.groups ?? []).map(def => {
    const n = g.node(def.id)
    return {
      def,
      x: n.x - n.width / 2,
      y: n.y - n.height / 2,
      w: n.width,
      h: n.height,
    }
  })

  const graphObj = g.graph() as { width: number; height: number }
  return {
    nodes, edges, groups,
    totalW: graphObj.width ?? 400,
    totalH: graphObj.height ?? 300,
  }
}

// ─── cubic bezier through dagre points ───────────────────────────────────────
function pointsToPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  const [p0, ...rest] = pts
  let d = `M${p0.x},${p0.y}`
  for (let i = 0; i < rest.length; i++) {
    const prev = i === 0 ? p0 : rest[i - 1]
    const curr = rest[i]
    const mx = (prev.x + curr.x) / 2
    const my = (prev.y + curr.y) / 2
    if (i === 0) d += ` Q${mx},${my} ${curr.x},${curr.y}`
    else d += ` T${curr.x},${curr.y}`
  }
  return d
}

// ─── node label: split on \n ──────────────────────────────────────────────────
function NodeLabel({ label, small }: { label: string; small?: boolean }) {
  const lines = label.split('\n')
  return (
    <>
      {lines.map((l, i) => (
        <div key={i} style={{
          lineHeight: 1.35,
          fontWeight: i === 0 ? 700 : 400,
          fontSize: i === 0 ? (small ? '11px' : '13px') : (small ? '10px' : '11.5px'),
          opacity: i === 0 ? 1 : 0.82,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>{l}</div>
      ))}
    </>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function FlowDiagram({
  graph, theme,
}: {
  graph: FlowGraph
  theme: ChapterTheme
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lyt, setLyt] = useState<Layout | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const l = computeLayout(graph)
    setLyt(l)
  }, [graph])

  // scale to fit container
  useEffect(() => {
    if (!lyt || !containerRef.current) return
    const el = containerRef.current
    const onResize = () => {
      const cw = el.clientWidth || 600
      const ch = el.clientHeight || 400
      const sx = cw / lyt.totalW
      const sy = ch / lyt.totalH
      setScale(Math.min(sx, sy, 2.0))
    }
    onResize()
    const ro = new ResizeObserver(onResize)
    ro.observe(el)
    return () => ro.disconnect()
  }, [lyt])

  if (!lyt) return null

  const markerId = `arr-${graph.direction}-${graph.nodes[0]?.id ?? 'x'}`

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* scaled diagram canvas */}
      <div style={{
        position: 'relative',
        width: lyt.totalW,
        height: lyt.totalH,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        flexShrink: 0,
      }}>

        {/* ── SVG layer: edges ── */}
        <svg
          style={{ position: 'absolute', inset: 0, overflow: 'visible', width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9" refY="5"
              markerWidth="6" markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={`${theme.accent}cc`} />
            </marker>
          </defs>

          {/* group outlines */}
          {lyt.groups.map(grp => (
            <rect
              key={grp.def.id}
              x={grp.x - 8} y={grp.y - 22}
              width={grp.w + 16} height={grp.h + 30}
              rx={10} ry={10}
              fill={`${theme.accent}08`}
              stroke={`${theme.accent}30`}
              strokeWidth={1.5}
              strokeDasharray="6 3"
            />
          ))}
          {lyt.groups.map(grp => (
            <text
              key={`${grp.def.id}-label`}
              x={grp.x} y={grp.y - 8}
              fill={`${theme.accent}99`}
              fontSize={11}
              fontWeight={600}
              fontFamily="-apple-system, PingFang SC, sans-serif"
            >
              {grp.def.label}
            </text>
          ))}

          {/* edges */}
          {lyt.edges.map((e, i) => {
            const path = pointsToPath(e.points)
            if (!path) return null
            // midpoint for label
            const mid = e.points[Math.floor(e.points.length / 2)]
            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={`${theme.accent}99`}
                  strokeWidth={1.8}
                  strokeDasharray={e.dashed ? '6 4' : undefined}
                  markerEnd={`url(#${markerId})`}
                />
                {e.label && mid && (
                  <text
                    x={mid.x} y={mid.y - 5}
                    textAnchor="middle"
                    fill={`${theme.accent}cc`}
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="-apple-system, PingFang SC, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* ── HTML layer: nodes ── */}
        {lyt.nodes.map(n => {
          const isAccent = n.def.accent
          const isDiamond = n.def.shape === 'diamond'
          const isDim = n.def.dim

          if (isDiamond) {
            return (
              <div key={n.id} style={{
                position: 'absolute',
                left: n.x, top: n.y,
                width: n.w, height: n.h,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* rotated square background */}
                <div style={{
                  position: 'absolute',
                  width: n.w * 0.72,
                  height: n.w * 0.72,
                  transform: 'rotate(45deg)',
                  background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}11)`,
                  border: `1.5px solid ${theme.accent}70`,
                  borderRadius: 4,
                }} />
                <div style={{
                  position: 'relative', zIndex: 1,
                  color: theme.accent, fontSize: '12px', fontWeight: 700,
                  textAlign: 'center', lineHeight: 1.3,
                  fontFamily: '-apple-system, PingFang SC, sans-serif',
                }}>
                  <NodeLabel label={n.def.label} small />
                </div>
              </div>
            )
          }

          return (
            <div key={n.id} style={{
              position: 'absolute',
              left: n.x, top: n.y,
              width: n.w, height: n.h,
              borderRadius: n.def.shape === 'circle' ? '50%' : n.def.shape === 'rect' ? 6 : 10,
              background: isAccent
                ? `linear-gradient(135deg, ${theme.accent}55, ${theme.accent}30)`
                : `linear-gradient(135deg, ${theme.accent}1a, ${theme.accent}0a)`,
              border: `1.5px solid ${isAccent ? theme.accent + 'aa' : theme.accent + '40'}`,
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px 10px',
              boxSizing: 'border-box',
              opacity: isDim ? 0.55 : 1,
            }}>
              <div style={{
                color: isAccent ? theme.accent : theme.textPrimary,
                textAlign: 'center',
                fontFamily: '-apple-system, PingFang SC, sans-serif',
              }}>
                <NodeLabel label={n.def.label} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
