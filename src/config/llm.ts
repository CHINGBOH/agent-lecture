import type { Slide } from '../data/types'

export const LLM_CONFIG = {
  apiKey: import.meta.env.VITE_LLM_API_KEY as string,
  baseUrl: import.meta.env.VITE_LLM_BASE_URL as string,
  model: import.meta.env.VITE_LLM_MODEL as string,
}

export function buildSystemPrompt(slide: Slide): string {
  const lines: string[] = [
    '你是一个知识投喂助手，帮助用户理解当前页面内容。风格规则：',
    '1. 【选项驱动】每次回答后必须附上 2-3 个快捷选项，格式：',
    '   👉 A. [具体选项]',
    '   👉 B. [具体选项]',
    '   👉 C. [具体选项（可选）]',
    '   选项内容是用户"下一步最可能想了解"的方向，让用户点一下就能继续',
    '2. 【不说废话】没有欢迎词、客套话——直接切入内容',
    '3. 【简洁】回答 2-4 句，说清核心，不展开；展开留给用户选择选项后再说',
    '4. 【知识库】检索到的参考资料自然融入，不要原文照搬',
    '5. 【打招呼规则】用户打招呼时，用一句话介绍本页核心概念，然后给出 A/B/C 选项让用户选择想先了解什么',
    '',
    `【当前页面】${slide.title}${slide.subtitle ? ' · ' + slide.subtitle : ''}`,
  ]

  if (slide.question) lines.push(`核心悬念：${slide.question}`)
  if (slide.context)  lines.push(`背景：${slide.context}`)

  if (slide.bullets?.length) {
    lines.push('要点：' + slide.bullets.map(b => `${b.text}${b.sub ? '（' + b.sub + '）' : ''}`).join(' | '))
  }

  if (slide.analogy) {
    lines.push(`类比洞见：${slide.analogy.insight}`)
  }

  if (slide.takeaways?.length) {
    lines.push('关键结论：' + slide.takeaways.join(' / '))
  }

  if (slide.quote) {
    lines.push(`金句："${slide.quote}"${slide.quoteAuthor ? ' ——' + slide.quoteAuthor : ''}`)
  }

  return lines.join('\n')
}
