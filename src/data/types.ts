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
  diagram?: string
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
