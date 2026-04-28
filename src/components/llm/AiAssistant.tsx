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

const QUICK_QUESTIONS = [
  '解释这页内容',
  '举个具体例子',
  '和上一技术有什么区别？',
  '为什么这很重要？',
]

export default function AiAssistant({ slide, accent, onClose }: Props) {
  const systemPrompt = buildSystemPrompt(slide)
  const { messages, loading, send, stop, clear } = useChat(systemPrompt)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevSlideId = useRef(slide.id)

  // Clear conversation when slide changes
  useEffect(() => {
    if (slide.id !== prevSlideId.current) {
      prevSlideId.current = slide.id
      clear()
    }
  }, [slide.id, clear])

  // Auto-scroll to bottom on new messages
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
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: '75px',
        width: '380px',
        zIndex: 18,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,10,16,0.92)',
        backdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '18px' }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>AI 解说助手</div>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '240px',
          }}>
            {slide.emoji} {slide.title}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clear}
            title="清空对话"
            style={iconBtnStyle}
          >
            🗑
          </button>
        )}
        <button onClick={onClose} title="关闭" style={iconBtnStyle}>✕</button>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}>
        {messages.length === 0 ? (
          <WelcomeView accent={accent} onQuick={q => send(q)} />
        ) : (
          <MessageList messages={messages} accent={accent} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions (when no messages) */}
      <AnimatePresence>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              padding: '0 12px 10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              flexShrink: 0,
            }}
          >
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  ;(e.target as HTMLButtonElement).style.borderColor = accent
                  ;(e.target as HTMLButtonElement).style.color = '#fff'
                }}
                onMouseLeave={e => {
                  ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
                  ;(e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'
                }}
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="有什么问题？（Enter 发送，Shift+Enter 换行）"
          rows={1}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '9px 12px',
            fontSize: '13px',
            color: '#fff',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            maxHeight: '100px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
          onInput={e => {
            const el = e.target as HTMLTextAreaElement
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 100)}px`
          }}
          onFocus={e => { e.target.style.borderColor = accent }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
        {loading ? (
          <button
            onClick={stop}
            title="停止生成"
            style={{
              ...sendBtnBase,
              background: 'rgba(255,60,60,0.2)',
              border: '1px solid rgba(255,60,60,0.4)',
              color: '#ff6060',
            }}
          >
            ⏹
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            title="发送 (Enter)"
            style={{
              ...sendBtnBase,
              background: input.trim() ? accent : 'rgba(255,255,255,0.08)',
              color: input.trim() ? '#000' : 'rgba(255,255,255,0.3)',
              cursor: input.trim() ? 'pointer' : 'default',
              border: 'none',
            }}
          >
            ↑
          </button>
        )}
      </div>
    </motion.div>
  )
}

function WelcomeView({ accent, onQuick }: {
  accent: string
  onQuick: (q: string) => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '12px',
      textAlign: 'center',
      padding: '0 16px',
    }}>
      <div style={{ fontSize: '36px' }}>🤖</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
        我来帮你理解这页内容
      </div>
      <div style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        lineHeight: '1.6',
        maxWidth: '280px',
      }}>
        点击下方快速提问，或者直接输入你的问题
      </div>
      <button
        onClick={() => onQuick('解释这页内容')}
        style={{
          marginTop: '8px',
          background: accent,
          border: 'none',
          borderRadius: '20px',
          padding: '8px 20px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#000',
          cursor: 'pointer',
        }}
      >
        ✨ 解释这页内容
      </button>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  color: 'rgba(255,255,255,0.5)',
  padding: '4px 6px',
  borderRadius: '6px',
  lineHeight: 1,
}

const sendBtnBase: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.15s',
  cursor: 'pointer',
}
