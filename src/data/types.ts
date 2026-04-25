// ============================================================
// 幻灯片数据类型定义
// ============================================================

export type SlideType =
  | 'cover'       // 章节封面（全屏冲击）
  | 'mystery'     // 悬念提问（大字黑底）
  | 'concept'     // 概念讲解（左技术+右类比）
  | 'timeline'    // 历史时间线
  | 'comparison'  // 反直觉对比（你以为 vs 实际上）
  | 'diagram'     // Mermaid 图表
  | 'quote'       // 金句卡（可截图）
  | 'summary'     // 章节总结

export interface Bullet {
  icon: string
  text: string
  sub?: string
}

export interface Analogy {
  character: string   // 比喻人物/场景
  scene: string       // 具体情境
  insight: string     // 类比揭示的洞见
}

export interface TimelineItem {
  year: string
  event: string
  detail: string
  icon: string
  highlight?: boolean
}

export interface ComparisonItem {
  label: string
  value: string
  icon?: string
}

// ── Native flow diagram types ─────────────────────────────────────────────────

export type FlowNodeShape = 'rect' | 'rounded' | 'diamond' | 'circle'

export interface FlowNode {
  id: string
  label: string            // supports \n for line breaks
  shape?: FlowNodeShape    // default: 'rounded'
  accent?: boolean         // highlight with theme.accent background
  dim?: boolean            // de-emphasize node
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
  dashed?: boolean
}

/** Subgraph / cluster for grouping nodes (e.g. RLHF steps, RAG pipeline) */
export interface FlowGroup {
  id: string
  label: string
  nodeIds: string[]        // nodes that belong to this group
  direction?: 'LR' | 'TD' // override direction inside the group
}

export interface FlowGraph {
  direction: 'LR' | 'TD'
  nodes: FlowNode[]
  edges: FlowEdge[]
  groups?: FlowGroup[]
}

// ── Slide ────────────────────────────────────────────────────────────────────

export interface Slide {
  id: string
  type: SlideType
  chapter: number        // 0=序章, 1-5=各章

  // 通用字段
  title: string
  subtitle?: string
  emoji?: string

  // 内容
  bullets?: Bullet[]
  analogy?: Analogy
  graph?: FlowGraph       // native React diagram (preferred)
  diagram?: string        // legacy Mermaid string (fallback)
  image?: string          // PNG 图片路径（如 /diagrams/xxx.png）
  chart?: string          // Plotly 图表 ID（如 'c1-timeline'），优先于 image
  timeline?: TimelineItem[]

  // comparison 专用
  before?: ComparisonItem[]  // 「你以为」
  after?: ComparisonItem[]   // 「实际上」

  // quote 专用
  quote?: string
  quoteAuthor?: string

  // mystery 专用
  question?: string          // 悬念大问题
  context?: string           // 补充背景

  // summary 专用
  takeaways?: string[]

  // 演讲者备注
  speakerNote?: string
}

export interface Chapter {
  id: number
  title: string
  subtitle: string
  emoji: string
  slides: Slide[]
}
