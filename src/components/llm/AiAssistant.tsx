import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import { buildSystemPrompt } from '../../config/llm'
import { useChat } from './useChat'
import MessageList from './MessageList'

interface Props {
  slide: Slide
  accent: string
}

const MIN_W = 280, MAX_W = 580

export default function AiAssistant({ slide, accent }: Props) {
  const systemPrompt = buildSystemPrompt(slide)
  const { messages, loading, send, stop, clear } = useChat(systemPrompt, slide)
  const [input, setInput] = useState('')
  const [width, setWidth] = useState(360)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevSlideId = useRef(slide.id)
  const dragRef = useRef<{ startX: number; startW: number } | null>(null)

  useEffect(() => {
    if (slide.id !== prevSlideId.current) {
      prevSlideId.current = slide.id
      clear()
    }
  }, [slide.id, clear])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Left-edge drag to resize width ────────────────────────────────────────
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startW: width }
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const w = Math.max(MIN_W, Math.min(MAX_W, d.startW - (ev.clientX - d.startX)))
      setWidth(w)
    }
    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [width])

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
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      style={{
        position: 'absolute',
        right: 0, top: 0, bottom: 72,
        width,
        zIndex: 18,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(6,6,14,0.78)',
        backdropFilter: 'blur(28px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.45)',
      }}
    >
      {/* ── Left resize handle ───────────────────────────── */}
      <div
        onMouseDown={startResize}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px',
          cursor: 'ew-resize', zIndex: 10,
        }}
      />

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: accent, letterSpacing: '0.04em' }}>
          🤖 AI 助手
        </span>
        {messages.length > 0 && (
          <button onClick={clear} style={{
            background: 'none', border: 'none',
            fontSize: '11px', color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer', padding: '2px 6px',
          }}>清空</button>
        )}
      </div>

      {/* ── Messages ──────────────────────────────────────── */}
      <div style={{
        flex: 1, minHeight: 0,
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        padding: '8px 4px 4px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.12) transparent',
      }}>
        <MessageList messages={messages} accent={accent} />
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '6px', alignItems: 'flex-end',
        padding: '8px 12px 12px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
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
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '7px 10px',
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
  width: '34px', height: '34px', flexShrink: 0,
  border: 'none', borderRadius: '8px',
  fontSize: '15px', fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'background 0.15s',
}
