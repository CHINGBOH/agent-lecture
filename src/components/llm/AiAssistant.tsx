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

const MIN_W = 280, MAX_W = 700
const MIN_H = 180, MAX_H = 900

export default function AiAssistant({ slide, accent, onClose }: Props) {
  const systemPrompt = buildSystemPrompt(slide)
  const { messages, loading, send, stop, clear } = useChat(systemPrompt, slide)
  const [input, setInput] = useState('')
  const [size, setSize] = useState({ w: 360, h: 560 })
  // pos=null → use default CSS right:16/top:16; once dragged, use absolute left/top
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevSlideId = useRef(slide.id)
  const resizeRef = useRef<{
    type: 'w' | 'h' | 'both'
    startX: number; startY: number
    startW: number; startH: number
  } | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; startPX: number; startPY: number } | null>(null)

  useEffect(() => {
    if (slide.id !== prevSlideId.current) {
      prevSlideId.current = slide.id
      clear()
    }
  }, [slide.id, clear])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Resize logic ───────────────────────────────────────────────────────────
  const startResize = useCallback((e: React.MouseEvent, type: 'w' | 'h' | 'both') => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      type, startX: e.clientX, startY: e.clientY,
      startW: size.w, startH: size.h,
    }

    const onMove = (ev: MouseEvent) => {
      const r = resizeRef.current
      if (!r) return
      const dx = ev.clientX - r.startX  // left edge: drag left = positive grow
      const dy = ev.clientY - r.startY  // bottom edge: drag down = positive grow
      setSize(prev => {
        let w = prev.w, h = prev.h
        if (r.type === 'w' || r.type === 'both') {
          w = Math.max(MIN_W, Math.min(MAX_W, r.startW - dx))
        }
        if (r.type === 'h' || r.type === 'both') {
          h = Math.max(MIN_H, Math.min(MAX_H, r.startH + dy))
        }
        return { w, h }
      })
    }

    const onUp = () => {
      resizeRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [size])

  // ── Drag to reposition ─────────────────────────────────────────────────────
  const startDrag = useCallback((e: React.MouseEvent) => {
    // get current rendered position of the panel
    const el = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-panel]')
    if (!el) return
    const rect = el.getBoundingClientRect()
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPX: rect.left, startPY: rect.top }

    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const x = Math.max(0, d.startPX + ev.clientX - d.startX)
      const y = Math.max(0, d.startPY + ev.clientY - d.startY)
      setPos({ x, y })
    }
    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

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
      data-panel
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 16, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      style={{
        position: 'absolute',
        ...(pos ? { left: pos.x, top: pos.y } : { right: '16px', top: '16px' }),
        width: size.w,
        height: size.h,
        zIndex: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        pointerEvents: 'none',
      }}
    >
      {/* ── Drag handle (title bar) ──────────────────────── */}
      <div
        onMouseDown={startDrag}
        style={{
          height: '28px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 10px',
          background: 'rgba(8,8,16,0.55)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'grab',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>AI 助手</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
          cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '0 2px',
        }}>✕</button>
      </div>
      {/* ── Bottom resize edge ──────────────────────────── */}
      <div
        onMouseDown={e => startResize(e, 'h')}
        style={{
          position: 'absolute', bottom: 0, left: 12, right: 12, height: '8px',
          cursor: 's-resize', zIndex: 10, pointerEvents: 'auto',
        }}
      />

      {/* ── Left resize edge ────────────────────────────── */}
      <div
        onMouseDown={e => startResize(e, 'w')}
        style={{
          position: 'absolute', left: 0, top: 12, bottom: 12, width: '8px',
          cursor: 'w-resize', zIndex: 10, pointerEvents: 'auto',
        }}
      />

      {/* ── Bottom-left corner handle ────────────────────── */}
      <div
        onMouseDown={e => startResize(e, 'both')}
        title="拖动调整大小"
        style={{
          position: 'absolute', bottom: 0, left: 0, width: '16px', height: '16px',
          cursor: 'sw-resize', zIndex: 11, pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ opacity: 0.35 }}>
          <circle cx="2" cy="2" r="1.2" fill="#fff"/>
          <circle cx="6" cy="2" r="1.2" fill="#fff"/>
          <circle cx="2" cy="6" r="1.2" fill="#fff"/>
          <circle cx="6" cy="6" r="1.2" fill="#fff"/>
        </svg>
      </div>

      {/* ── Messages ──────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '4px',
        paddingTop: '8px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.15) transparent',
        pointerEvents: 'auto',
        minHeight: 0,
      }}>
        {messages.length > 0 && (
          <>
            <MessageList messages={messages} accent={accent} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button onClick={clear} style={{
                background: 'none', border: 'none',
                fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer', padding: '2px 6px',
              }}>清空</button>
            </div>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ─────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '6px',
        alignItems: 'flex-end',
        background: 'rgba(8,8,16,0.6)',
        backdropFilter: 'blur(24px)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.1)',
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
