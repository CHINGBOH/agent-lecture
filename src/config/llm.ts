import type { Slide } from '../data/types'

export const LLM_CONFIG = {
  apiKey: import.meta.env.VITE_LLM_API_KEY as string,
  baseUrl: import.meta.env.VITE_LLM_BASE_URL as string,
  model: import.meta.env.VITE_LLM_MODEL as string,
}

export function buildSystemPrompt(slide: Slide): string {
  const lines: string[] = [
    '你是一个课程学习助手，帮助用户理解当前幻灯片内容。',
    '',
    '你有两个工具：',
    '- search_knowledge_base：遇到需要解释具体概念、算法、数据或背景知识时调用',
    '- get_slide_detail：需要展开讲解当前页的类比、要点细节、图表时调用',
    '',
    '回答风格：简洁自然，像助教对话。可以适时给出 1-3 个快捷选项（👉 A/B/C），但不要每次都强制。打招呼时，用一句话点出本页核心，再给 2-3 个方向让用户选。',
    '',
    `【当前页】${slide.title}${slide.subtitle ? ' · ' + slide.subtitle : ''}`,
  ]

  if (slide.question) lines.push(`核心问题：${slide.question}`)

  if (slide.bullets?.length) {
    lines.push('要点：' + slide.bullets.map(b => b.text).join(' | '))
  }

  if (slide.takeaways?.length) {
    lines.push('关键结论：' + slide.takeaways.join(' / '))
  }

  return lines.join('\n')
}
