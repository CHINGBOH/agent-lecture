/**
 * layout.ts — 演示文稿布局与字体尺寸配置
 *
 * 字体分级参考 PPT 行业规范（标题 32–44pt, 正文 20–28pt, 说明 16–20pt）
 * 修改这里即可全局调整图示区大小和字体分级，无需逐个文件搜索。
 */

// ── 图示区域尺寸（ConceptSlide 图片出血布局） ─────────────────────────────────
export const DIAGRAM = {
  /** 右侧图片区宽度（出血布局） */
  imageWidth: '64%',
  /** 右侧图片区高度 */
  imageHeight: '90%',
  /** 左侧文字列宽度（出血布局）—— 略宽于旧值，为更大字体留空间 */
  textColumnWidth: '46%',
  /** 图表左边起始偏移（仅 Plotly 图表布局） */
  imageOffsetLeft: '46%',
  /** 图片上边起始偏移 */
  imageOffsetTop: '4%',
  /** 有 Plotly 图表时底部类比条宽度 */
  chartTextColumnWidth: '52%',
  /** 有流程图时底部类比条宽度 */
  graphTextColumnWidth: '62%',
} as const

// ── 前端字体分级（幻灯片内容区） ────────────────────────────────────────────────
export const FONT = {
  // ── 标题层（对标 PPT 36–44pt ≈ 48–58px CSS） ──────────────────────────────
  /** 幻灯片主标题 */
  slideTitle: 'clamp(28px, 3.2vw, 44px)',
  /** 幻灯片副标题 */
  slideSubtitle: 'clamp(16px, 1.8vw, 24px)',
  /** 总结页标题 */
  summaryTitle: 'clamp(24px, 3vw, 40px)',
  /** 总结页副标题 */
  summarySubtitle: '19px',

  // ── 正文层（对标 PPT 20–28pt ≈ 27–37px CSS） ──────────────────────────────
  /** 要点标题（紧凑模式，配图/图表页） */
  bulletTitleCompact: 'clamp(14px, 1.2vw, 19px)',
  /** 要点标题（完整模式，纯文字页） */
  bulletTitleFull: 'clamp(17px, 1.5vw, 23px)',
  /** 总结条目 */
  summaryItem: 'clamp(16px, 1.4vw, 21px)',
  /** 对比页条目标题 */
  comparisonLabel: '17px',

  // ── 说明层（对标 PPT 16–20pt ≈ 21–27px CSS） ──────────────────────────────
  /** 要点说明（紧凑模式） */
  bulletSubCompact: '13px',
  /** 要点说明（完整模式） */
  bulletSubFull: '15px',
  /** 对比页条目说明 */
  comparisonValue: '15px',
  /** 类比角色标签（"🎭 xxx："） */
  analogyLabel: '13px',
  /** 类比正文 */
  analogyText: '14px',
  /** 时间轴年份标签 */
  timelineYear: '13px',
  /** 时间轴事件文字 */
  timelineEvent: '15px',
  /** 时间轴展开详情 */
  timelineDetail: '13px',

  // ── 辅助层 ─────────────────────────────────────────────────────────────────
  /** 对比页列标题（"你以为 / 实际上"） */
  comparisonHeader: '13px',
  /** 章节/角标小字 */
  badge: '13px',
  /** 注脚、放大提示 */
  caption: '12px',

  // ── 图标 ──────────────────────────────────────────────────────────────────
  /** Emoji 图标（紧凑模式） */
  iconCompact: '20px',
  /** Emoji 图标（完整模式/标题行） */
  iconFull: '28px',

  // ── 封面页（CoverSlide） ───────────────────────────────────────────────────
  /** 封面大 Emoji */
  coverEmoji: '96px',
  /** 封面主标题 */
  coverTitle: 'clamp(36px, 6vw, 72px)',
  /** 封面副标题 */
  coverSubtitle: 'clamp(16px, 2.5vw, 24px)',
  /** 封面操作提示（"按 → 继续"） */
  coverHint: '13px',

  // ── 引言页（QuoteSlide） ───────────────────────────────────────────────────
  /** 引言页装饰 Emoji */
  quoteEmoji: '64px',
  /** 引言页装饰引号 "❝" */
  quoteMark: 'clamp(32px, 4.5vw, 60px)',
  /** 引言正文 */
  quoteText: 'clamp(24px, 3.5vw, 44px)',
  /** 引言出处 */
  quoteAuthor: '16px',

  // ── 悬念页（MysterySlide） ────────────────────────────────────────────────
  /** 悬念钩子阶段 Emoji */
  mysteryEmoji: '80px',
  /** 悬念钩子阶段标题（小字提示） */
  mysteryTitle: 'clamp(14px, 2vw, 22px)',
  /** 悬念大问题文字 */
  mysteryQuestion: 'clamp(32px, 5vw, 64px)',
  /** 悬念"点击揭晓"按钮文字 */
  mysteryButton: '15px',
  /** 揭晓后背景说明文字 */
  mysteryContext: 'clamp(16px, 2.2vw, 22px)',
} as const
