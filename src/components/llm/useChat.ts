import { useState, useCallback, useRef } from 'react'
import { LLM_CONFIG } from '../../config/llm'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  thinking?: boolean  // reasoning model is still in chain-of-thought phase
}

export function useChat(systemPrompt: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bufferRef = useRef('')

  const send = useCallback(async (userMsg: string) => {
    if (loading) return

    const history: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages([...history, { role: 'assistant', content: '', streaming: true }])
    setLoading(true)
    bufferRef.current = ''

    abortRef.current = new AbortController()

    try {
      const res = await fetch(`${LLM_CONFIG.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LLM_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: LLM_CONFIG.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map(m => ({ role: m.role, content: m.content })),
          ],
          stream: true,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let lineBuffer = ''
      let hasContent = false

      const processLine = (line: string) => {
        if (!line.startsWith('data: ')) return
        const data = line.slice(6).trim()
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta ?? {}
          const contentDelta: string = delta.content ?? ''
          const reasoningDelta: string = delta.reasoning_content ?? ''

          if (contentDelta) {
            hasContent = true
            bufferRef.current += contentDelta
            const content = bufferRef.current
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content, streaming: true }
              return updated
            })
          } else if (reasoningDelta && !hasContent) {
            // Still in reasoning/thinking phase — show spinner, no content yet
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: '', streaming: true, thinking: true }
              return updated
            })
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
        for (const line of lines) {
          processLine(line.trim())
        }
      }
      // Process any remaining data
      if (lineBuffer.trim()) processLine(lineBuffer.trim())

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: bufferRef.current }
        return updated
      })
    } catch (err) {
      const isAbort = (err as Error).name === 'AbortError'
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
    } finally {
      setLoading(false)
    }
  }, [messages, systemPrompt, loading])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clear = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setLoading(false)
  }, [])

  return { messages, loading, send, stop, clear }
}
