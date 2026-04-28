import { useState, useCallback, useRef } from 'react'
import type { Slide } from '../../data/types'
import { LLM_CONFIG } from '../../config/llm'
import { TOOL_DEFINITIONS, executeTool, toolStatusText } from '../../config/tools'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  thinking?: boolean
  toolStatus?: string
}

// ── Types for protocol layer ───────────────────────────────────────────────────

interface ApiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content?: string | null
  reasoning_content?: string   // DeepSeek thinking mode — must be echoed back
  tool_calls?: {
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }[]
  tool_call_id?: string
}

interface ToolCallAccum {
  index: number
  id: string
  name: string
  argumentsBuffer: string
}

export function useChat(systemPrompt: string, slide: Slide) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const apiHistoryRef = useRef<ApiMessage[]>([])
  const requestIdRef = useRef(0)

  const send = useCallback(async (userMsg: string) => {
    if (loading) return

    const reqId = ++requestIdRef.current

    // ── Update UI immediately ────────────────────────────────────────────────
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: '', streaming: true, thinking: true },
    ])
    setLoading(true)

    // Append to API protocol history
    apiHistoryRef.current = [...apiHistoryRef.current, { role: 'user', content: userMsg }]

    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    // ── Inner: stream one LLM call ─────────────────────────────────────────────
    const streamAndCollect = async (): Promise<{ content: string; reasoningContent: string; toolCalls: ToolCallAccum[] }> => {
      const requestBody = {
        model: LLM_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...apiHistoryRef.current,
        ],
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        stream: true,
      }
      // Debug: log messages being sent (check reasoning_content is present)
      console.log('[useChat] API request messages:', JSON.stringify(requestBody.messages.map(m => ({
        role: m.role,
        has_reasoning: !!('reasoning_content' in m),
        has_tool_calls: !!('tool_calls' in m),
        content_len: typeof m.content === 'string' ? m.content.length : 0,
      })), null, 2))

      const res = await fetch(`${LLM_CONFIG.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_CONFIG.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal,
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('[useChat] API 400 error. Messages were:', JSON.stringify(requestBody.messages, null, 2))
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let lineBuffer = ''
      let content = ''
      let reasoningContent = ''
      const toolMap = new Map<number, ToolCallAccum>()
      let hasContent = false

      const processLine = (line: string) => {
        if (!line.startsWith('data: ')) return
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') return
        try {
          const parsed = JSON.parse(raw)
          const delta = parsed.choices?.[0]?.delta ?? {}

          // ── Content delta ────────────────────────────────────────
          const contentDelta: string = delta.content ?? ''
          const reasoningDelta: string = delta.reasoning_content ?? ''

          if (contentDelta) {
            hasContent = true
            content += contentDelta
            if (requestIdRef.current === reqId) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant', content, streaming: true,
                }
                return updated
              })
            }
          } else if (reasoningDelta && !hasContent) {
            reasoningContent += reasoningDelta
            if (requestIdRef.current === reqId) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant', content: '', streaming: true, thinking: true,
                }
                return updated
              })
            }
          }

          // ── Tool call deltas ─────────────────────────────────────
          const toolDeltas: {
            index: number; id?: string; type?: string
            function?: { name?: string; arguments?: string }
          }[] = delta.tool_calls ?? []

          for (const td of toolDeltas) {
            const idx = td.index ?? 0
            if (!toolMap.has(idx)) {
              toolMap.set(idx, { index: idx, id: td.id ?? '', name: '', argumentsBuffer: '' })
            }
            const tc = toolMap.get(idx)!
            if (td.id) tc.id = td.id
            if (td.function?.name) tc.name = td.function.name
            if (td.function?.arguments) tc.argumentsBuffer += td.function.arguments
          }
        } catch {
          // ignore malformed SSE chunks
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        lineBuffer += decoder.decode(value, { stream: true })
        const lines = lineBuffer.split('\n')
        lineBuffer = lines.pop() ?? ''
        for (const line of lines) processLine(line.trim())
      }
      if (lineBuffer.trim()) processLine(lineBuffer.trim())

      return { content, reasoningContent, toolCalls: Array.from(toolMap.values()) }
    }

    try {
      let finalContent = ''

      // ── Agent loop: up to 3 tool rounds ─────────────────────────────────────
      for (let round = 0; round < 3; round++) {
        const { content, reasoningContent, toolCalls } = await streamAndCollect()

        if (signal.aborted || requestIdRef.current !== reqId) break

        if (toolCalls.length === 0) {
          // No tool calls — this is the final answer
          finalContent = content
          // Push to protocol history, including reasoning_content if present
          const finalMsg: ApiMessage = { role: 'assistant', content: finalContent }
          if (reasoningContent) finalMsg.reasoning_content = reasoningContent
          apiHistoryRef.current.push(finalMsg)
          break
        }

        // ── Execute tools ──────────────────────────────────────────────────────
        // Push assistant "tool_calls" message into protocol history
        const toolCallMsg: ApiMessage = {
          role: 'assistant',
          content: content || null,
          tool_calls: toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.name, arguments: tc.argumentsBuffer },
          })),
        }
        if (reasoningContent) toolCallMsg.reasoning_content = reasoningContent
        apiHistoryRef.current.push(toolCallMsg)

        // Show tool status in the UI bubble
        const statusParts = toolCalls.map(tc => {
          try { return toolStatusText(tc.name, JSON.parse(tc.argumentsBuffer)) }
          catch { return '⚙️ 处理中…' }
        })
        if (requestIdRef.current === reqId) {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant', content: content, streaming: true,
              toolStatus: statusParts.join(' | '),
            }
            return updated
          })
        }

        // Execute all tools in parallel
        const toolResults = await Promise.all(
          toolCalls.map(async tc => {
            let args: Record<string, string> = {}
            try { args = JSON.parse(tc.argumentsBuffer) } catch {}
            const result = await executeTool(tc.name, args, slide, signal)
            return { id: tc.id, result }
          })
        )

        // Push tool results into protocol history
        for (const { id, result } of toolResults) {
          apiHistoryRef.current.push({ role: 'tool', tool_call_id: id, content: result })
        }

        // Reset placeholder bubble for next streaming round
        if (requestIdRef.current === reqId) {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant', content: '', streaming: true, thinking: true,
            }
            return updated
          })
        }
      }

      // ── Finalize ─────────────────────────────────────────────────────────────
      if (requestIdRef.current === reqId) {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: finalContent }
          return updated
        })
      }
    } catch (err) {
      const isAbort = (err as Error).name === 'AbortError'
      if (requestIdRef.current === reqId) {
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = {
              role: 'assistant',
              content: isAbort
                ? (last.content || '（已中断）')
                : `⚠️ 请求失败：${(err as Error).message}`,
            }
          }
          return updated
        })
      }
    } finally {
      if (requestIdRef.current === reqId) setLoading(false)
    }
  }, [messages, systemPrompt, slide, loading])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clear = useCallback(() => {
    abortRef.current?.abort()
    apiHistoryRef.current = []
    setMessages([])
    setLoading(false)
  }, [])

  return { messages, loading, send, stop, clear }
}
