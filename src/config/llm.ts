import type { Slide } from '../data/types'

export const LLM_CONFIG = {
  apiKey: import.meta.env.VITE_LLM_API_KEY as string,
  baseUrl: import.meta.env.VITE_LLM_BASE_URL as string,
  model: import.meta.env.VITE_LLM_MODEL as string,
}

export function buildSystemPrompt(slide: Slide): string {
  const lines: string[] = [
    '你是一个苏格拉底式学习助手。风格规则：',
    '1. 【启发优先】每次回答后，用一个精准的追问引导学员深入思考',
    '2. 【不说废话】没有欢迎词、客套话、"这是个好问题"——直接切入',
    '3. 【短而锋利】回答控制在 3-5 句，问题要犀利，指向认知盲点',
    '4. 【角色感】你是同行探讨者，不是讲师；用"你觉得…""如果…会怎样""为什么 X 不用 Y"风格提问',
    '5. 【知识库】检索到的参考资料作为背景，自然融入，不要原文照搬',
    '6. 【打招呼规则】学员打招呼时，不回"欢迎"，而是直接抛出与本页内容相关的思考问题',
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
