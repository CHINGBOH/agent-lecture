import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Slide } from '../../data/types'
import { buildSystemPrompt } from '../../config/llm'
import { useChat } from './useChat'
import MessageList from './MessageList'

interface Props {
  slide: Slide
  accent: string
  onClose: () => void
}


export default function AiAssistant({ slide, accent, onClose }: Props) {
  const systemPrompt = buildSystemPrompt(slide)
  const { messages, loading, send, stop, clear } = useChat(systemPrompt)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevSlideId = useRef(slide.id)

  useEffect(() => {
    if (slide.id !== prevSlideId.current) {
      prevSlideId.current = slide.id
      clear()
    }
  }, [slide.id, clear])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    send(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 16, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      style={{
        position: 'absolute',
        right: '16px',
        bottom: '88px',
        width: '360px',
        maxHeight: '520px',
        zIndex: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        // fully transparent — no background, no border
        pointerEvents: 'none', // let clicks through except on children
      }}
    >
      {/* Messages — float transparently */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
        pointerEvents: 'auto',
      }}>
        {messages.length === 0 ? null : (
          <>
            <MessageList messages={messages} accent={accent} />
            {messages.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button onClick={clear} style={{
                  background: 'none', border: 'none',
                  fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer', padding: '2px 6px',
                }}>清空</button>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar — only visible element */}
      <div style={{
        display: 'flex',
        gap: '6px',
        alignItems: 'flex-end',
        background: 'rgba(8,8,16,0.6)',
        backdropFilter: 'blur(24px)',
        borderRadius: '14px',
        border: `1px solid rgba(255,255,255,0.1)`,
        padding: '6px 8px',
        pointerEvents: 'auto',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="问 AI 助手…"
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            padding: '5px 8px',
            fontSize: '13px',
            color: '#fff',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            maxHeight: '80px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
          onInput={e => {
            const el = e.target as HTMLTextAreaElement
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 80)}px`
          }}
        />
        {loading ? (
          <button onClick={stop} title="停止" style={{ ...sendBtn, background: 'rgba(255,60,60,0.25)', color: '#ff7070' }}>⏹</button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            title="发送"
            style={{
              ...sendBtn,
              background: input.trim() ? accent : 'rgba(255,255,255,0.1)',
              color: input.trim() ? '#000' : 'rgba(255,255,255,0.25)',
              cursor: input.trim() ? 'pointer' : 'default',
            }}
          >↑</button>
        )}
      </div>
    </motion.div>
  )
}

const sendBtn: React.CSSProperties = {
  width: '32px', height: '32px', flexShrink: 0,
  border: 'none', borderRadius: '8px',
  fontSize: '15px', fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'background 0.15s',
}
