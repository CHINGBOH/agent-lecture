import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import { buildSystemPrompt } from '../../config/llm'
import { useChat } from './useChat'
import MessageList from './MessageList'

interface Props {
  slide: Slide
  accent: string
  onClose: () => void
}

const MIN_W = 280
const MAX_W = 640

export default function AiAssistant({ slide, accent, onClose }: Props) {
  const systemPrompt = buildSystemPrompt(slide)
  const { messages, loading, send, stop, clear } = useChat(systemPrompt, slide)
  const [input, setInput] = useState('')
  const [width, setWidth] = useState(340)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevSlideId = useRef(slide.id)
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null)

  useEffect(() => {
    if (slide.id !== prevSlideId.current) {
      prevSlideId.current = slide.id
      clear()
    }
  }, [slide.id, clear])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      startX: e.clientX,
      startW: width,
    }

    const onMove = (ev: MouseEvent) => {
      const r = resizeRef.current
      if (!r) return
      const nextWidth = Math.max(MIN_W, Math.min(MAX_W, r.startW - (ev.clientX - r.startX)))
      setWidth(nextWidth)
    }

    const onUp = () => {
      resizeRef.current = null
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
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      style={{
        position: 'absolute',
        top: '12px',
        right: '18px',
        bottom: '64px',
        width,
        zIndex: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        onMouseDown={startResize}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'w-resize',
          pointerEvents: 'auto',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '6px',
          paddingTop: '2px',
          pointerEvents: 'auto',
        }}
      >
        {messages.length > 0 && (
          <button onClick={clear} style={ghostBtn}>
            清空
          </button>
        )}
        <button onClick={onClose} aria-label="关闭 AI 助手" style={ghostIconBtn}>
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '4px 0',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.14) transparent',
          pointerEvents: 'auto',
        }}
      >
        <MessageList messages={messages} accent={accent} />
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'flex-end',
          background: 'rgba(10,10,18,0.58)',
          backdropFilter: 'blur(24px)',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.18)',
          padding: '6px 8px',
          pointerEvents: 'auto',
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入问题…"
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
          <button
            onClick={stop}
            title="停止"
            style={{ ...sendBtn, background: 'rgba(255,60,60,0.25)', color: '#ff7070' }}
          >
            ⏹
          </button>
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
          >
            ↑
          </button>
        )}
      </div>
    </motion.div>
  )
}

const sendBtn: React.CSSProperties = {
  width: '32px',
  height: '32px',
  flexShrink: 0,
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.15s',
}

const ghostBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.46)',
  borderRadius: '999px',
  padding: '2px 8px',
  fontSize: '11px',
  cursor: 'pointer',
}

const ghostIconBtn: React.CSSProperties = {
  ...ghostBtn,
  width: '24px',
  height: '24px',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  lineHeight: 1,
}
