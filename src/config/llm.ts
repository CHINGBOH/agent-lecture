import type { Slide } from '../data/types'

export const LLM_CONFIG = {
  apiKey: import.meta.env.VITE_LLM_API_KEY as string,
  baseUrl: import.meta.env.VITE_LLM_BASE_URL as string,
  model: import.meta.env.VITE_LLM_MODEL as string,
}

export function buildSystemPrompt(slide: Slide): string {
  const lines: string[] = [
    '你是一个 AI 讲师助手，帮助学员理解当前幻灯片的内容。请用简洁的中文回答，回答要针对性强。',
    '',
    `【当前幻灯片】`,
    `标题：${slide.title}`,
  ]
  if (slide.subtitle) lines.push(`副标题：${slide.subtitle}`)
  if (slide.emoji) lines.push(`主题：${slide.emoji}`)
  if (slide.question) lines.push(`核心问题：${slide.question}`)
  if (slide.context) lines.push(`背景：${slide.context}`)

  if (slide.bullets?.length) {
    lines.push('\n要点：')
    slide.bullets.forEach(b => {
      lines.push(`- ${b.icon} ${b.text}${b.sub ? '：' + b.sub : ''}`)
    })
  }

  if (slide.analogy) {
    lines.push('\n类比：')
    lines.push(`- 场景：${slide.analogy.scene}`)
    lines.push(`- 洞见：${slide.analogy.insight}`)
  }

  if (slide.takeaways?.length) {
    lines.push('\n总结要点：')
    slide.takeaways.forEach(t => lines.push(`- ${t}`))
  }

  if (slide.quote) {
    lines.push(`\n金句："${slide.quote}"`)
    if (slide.quoteAuthor) lines.push(`——${slide.quoteAuthor}`)
  }

  lines.push('\n请根据以上内容回答学员的问题。若学员的问题超出本页范围，可适当联系上下文。')
  return lines.join('\n')
}
