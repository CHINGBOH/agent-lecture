/**
 * layout.ts — 演示文稿布局与字体尺寸配置
 *
 * 修改这里即可全局调整图示区大小和字体分级，无需逐个文件搜索。
 */

// ── 图示区域尺寸（ConceptSlide 图片出血布局） ─────────────────────────────────
export const DIAGRAM = {
  /** 右侧图片区宽度（出血布局） */
  imageWidth: '66%',
  /** 右侧图片区高度 */
  imageHeight: '90%',
  /** 左侧文字列宽度 */
  textColumnWidth: '43%',
  /** 图片左边起始偏移 */
  imageOffsetLeft: '44%',
  /** 图片上边起始偏移 */
  imageOffsetTop: '4%',
  /** 有图表时文字列宽度 */
  chartTextColumnWidth: '50%',
  /** 有流程图时文字列宽度 */
  graphTextColumnWidth: '62%',
} as const

// ── 前端字体分级（幻灯片内容区） ────────────────────────────────────────────────
export const FONT = {
  /** 幻灯片主标题 */
  slideTitle: 'clamp(20px, 3vw, 34px)',
  /** 幻灯片副标题 */
  slideSubtitle: '15px',
  /** 要点标题（紧凑模式） */
  bulletTitleCompact: '14px',
  /** 要点标题（完整模式） */
  bulletTitleFull: '17px',
  /** 要点说明文字 */
  bulletSub: '12px',
  /** 章节/角标小字 */
  badge: '12px',
  /** 注脚 */
  caption: '11px',
  /** 图标（紧凑模式） */
  iconCompact: '17px',
  /** 图标（完整模式） */
  iconFull: '22px',
} as const
