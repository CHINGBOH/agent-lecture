import type { Slide } from '../data/types'

const RAG_URL = 'http://127.0.0.1:8765/query'

// ── Tool definitions (OpenAI function-calling format) ──────────────────────────

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'search_knowledge_base',
      description:
        '搜索课程知识库，获取与问题相关的参考资料。当需要解释具体概念、算法细节、历史数据或课程背景知识时调用。',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词，中英文均可',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_slide_detail',
      description:
        '获取当前幻灯片的详细内容（类比故事、完整要点、总结、背景等）。当需要深入讲解当前页某个部分时调用。',
      parameters: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['bullets', 'analogy', 'takeaways', 'context', 'quote', 'graph_nodes'],
            description: '要获取的字段',
          },
        },
        required: ['field'],
      },
    },
  },
]

// ── Tool executor ──────────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  args: Record<string, string>,
  slide: Slide,
  signal: AbortSignal,
): Promise<string> {
  if (name === 'search_knowledge_base') {
    try {
      const url = `${RAG_URL}?q=${encodeURIComponent(args.query ?? '')}&top_k=3&max_chars=1200`
      const res = await fetch(url, { signal })
      if (!res.ok) return '（知识库检索失败）'
      const data = await res.json()
      return (data.context as string) || '（未检索到相关内容）'
    } catch {
      return '（知识库暂不可用）'
    }
  }

  if (name === 'get_slide_detail') {
    switch (args.field) {
      case 'bullets':
        return slide.bullets?.map(b => `• ${b.icon ?? ''} ${b.text}${b.sub ? '：' + b.sub : ''}`).join('\n') ?? '无'
      case 'analogy':
        if (!slide.analogy) return '（本页无类比）'
        return `角色：${slide.analogy.character}\n场景：${slide.analogy.scene}\n洞见：${slide.analogy.insight}`
      case 'takeaways':
        return slide.takeaways?.join('\n') ?? '无'
      case 'context':
        return slide.context ?? '无'
      case 'quote':
        return slide.quote
          ? `"${slide.quote}"${slide.quoteAuthor ? ' ——' + slide.quoteAuthor : ''}`
          : '（本页无金句）'
      case 'graph_nodes':
        return slide.graph?.nodes?.map(n => n.label ?? n.id).join('\n') ?? '无'
      default:
        return '（未知字段）'
    }
  }

  return `（未知工具: ${name}）`
}

// ── Human-readable tool status messages ────────────────────────────────────────

export function toolStatusText(toolName: string, args: Record<string, string>): string {
  if (toolName === 'search_knowledge_base') {
    return `🔍 搜索知识库：${args.query ?? ''}…`
  }
  if (toolName === 'get_slide_detail') {
    const labels: Record<string, string> = {
      bullets: '详细要点', analogy: '类比故事', takeaways: '关键结论',
      context: '背景说明', quote: '金句', graph_nodes: '图表内容',
    }
    return `📖 读取${labels[args.field] ?? args.field}…`
  }
  return '⚙️ 处理中…'
}
