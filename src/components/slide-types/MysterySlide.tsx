import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'
import TypeWriter from '../animations/TypeWriter'
import { FONT } from '../../config/layout'

// 打字机完成后触发 onDone 回调
function TypeWriterWithDone({
  text, speed = 28, style, onDone,
}: {
  text: string; speed?: number; style?: React.CSSProperties; onDone?: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const [idx, setIdx] = useState(0)

  useEffect(() => { setDisplayed(''); setIdx(0) }, [text])
  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed(p => p + text[idx])
        setIdx(p => p + 1)
      }, speed)
      return () => clearTimeout(t)
    } else if (idx === text.length && text.length > 0) {
      onDone?.()
    }
  }, [idx, text, speed, onDone])

  return (
    <span style={style}>
      {displayed}
      {idx < text.length && <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  )
}

export default function MysterySlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  // 三阶段：hook(钩子) → question(打字机) → revealed(揭晓)
  const [phase, setPhase] = useState<'hook' | 'question' | 'revealed'>('hook')

  // 复位（换幻灯片时）
  useEffect(() => { setPhase('hook') }, [slide.id])

  // hook 阶段 1.2s 后自动进入 question 阶段
  useEffect(() => {
    if (phase !== 'hook') return
    const t = setTimeout(() => setPhase('question'), 1200)
    return () => clearTimeout(t)
  }, [phase])

  const questionLen = slide.question?.length ?? 0
  const typingDuration = questionLen * 28 + 600 // ms

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: '40px 60px',
        position: 'relative', overflow: 'hidden',
        cursor: phase === 'question' && slide.context ? 'default' : 'default',
      }}
    >
      {/* 动态背景光晕 */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '700px', height: '500px',
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(ellipse, ${theme.accent}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── 阶段1：钩子 ── */}
      <AnimatePresence>
        {phase === 'hook' && (
          <motion.div
            key="hook"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '24px', textAlign: 'center', padding: '40px',
            }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: FONT.mysteryEmoji }}
            >
              {slide.emoji ?? '❓'}
            </motion.div>
            <div style={{
              fontSize: FONT.mysteryTitle,
              color: theme.textSecondary,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              {slide.title}
            </div>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                fontSize: FONT.badge, color: theme.accent,
                letterSpacing: '0.25em', marginTop: '8px',
              }}
            >
              ▼ 即将揭晓一个问题
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 阶段2/3：问题 + 揭晓 ── */}
      <AnimatePresence>
        {(phase === 'question' || phase === 'revealed') && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', width: '100%', maxWidth: '960px',
              gap: '0', position: 'relative', zIndex: 1,
            }}
          >
            {/* 章节标签 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: FONT.badge, color: theme.accent,
                letterSpacing: '0.2em', marginBottom: '28px',
                textTransform: 'uppercase', fontWeight: 700,
              }}
            >
              {slide.title}
            </motion.div>

            {/* 大问题 */}
            <div style={{
              fontSize: FONT.mysteryQuestion,
              fontWeight: 900,
              color: theme.textPrimary,
              lineHeight: 1.35,
              textAlign: 'center',
              textShadow: `0 0 80px ${theme.accent}70, 0 2px 40px rgba(0,0,0,0.5)`,
              marginBottom: '48px',
              letterSpacing: '-0.01em',
            }}>
              <TypeWriterWithDone
                text={slide.question ?? ''}
                speed={28}
                onDone={() => {
                  // 打字完成后 1s 自动把 "揭晓" 提示显示出来（不自动揭晓）
                }}
              />
            </div>

            {/* "你觉得呢？" 提示 */}
            {phase === 'question' && slide.context && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: typingDuration / 1000 }}
                onClick={() => setPhase('revealed')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'transparent',
                  border: `2px solid ${theme.accent}80`,
                  borderRadius: '40px',
                  padding: '12px 32px',
                  color: theme.accent,
                  fontSize: FONT.mysteryButton,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  boxShadow: `0 0 20px ${theme.accent}20`,
                }}
              >
                你觉得呢？ →&nbsp;&nbsp;点击揭晓
              </motion.button>
            )}

            {/* 揭晓的背景/答案 */}
            <AnimatePresence>
              {phase === 'revealed' && slide.context && (
                <motion.div
                  key="context"
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    fontSize: FONT.mysteryContext,
                    color: theme.textSecondary,
                    lineHeight: 1.9,
                    maxWidth: '780px',
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${theme.accent}10, rgba(255,255,255,0.04))`,
                    border: `1px solid ${theme.accent}30`,
                    borderRadius: '20px',
                    padding: '28px 36px',
                    position: 'relative',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40px' }}
                    style={{
                      height: '3px', background: theme.accent,
                      borderRadius: '2px', margin: '0 auto 20px',
                    }}
                  />
                  {slide.context}
                  <div style={{
                    marginTop: '20px', fontSize: FONT.badge,
                    color: `${theme.accent}80`, letterSpacing: '0.1em',
                  }}>
                    按 → 继续
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
