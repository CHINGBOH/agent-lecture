import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

import TypeWriter from '../animations/TypeWriter'

export default function MysterySlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', textAlign: 'center', padding: '40px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 脉冲光晕 */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${theme.accent}08 0%, transparent 70%)`,
        animation: 'mysterypulse 3s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes mysterypulse {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>

      {slide.emoji && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{ fontSize: '72px', marginBottom: '32px', position: 'relative', zIndex: 1 }}
        >
          {slide.emoji}
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: 'clamp(14px, 2vw, 20px)',
          color: theme.textSecondary,
          marginBottom: '24px',
          letterSpacing: '0.05em',
          maxWidth: '700px',
          position: 'relative', zIndex: 1,
        }}
      >
        {slide.title}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          fontSize: 'clamp(22px, 3.5vw, 44px)',
          fontWeight: 900,
          color: theme.textPrimary,
          lineHeight: 1.4,
          maxWidth: '860px',
          textShadow: `0 0 60px ${theme.accent}60`,
          marginBottom: '40px',
          borderLeft: `6px solid ${theme.accent}`,
          paddingLeft: '24px',
          textAlign: 'left',
          position: 'relative', zIndex: 1,
        }}
      >
        <TypeWriter text={slide.question ?? ''} speed={30} />
      </motion.div>

      {slide.context && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          style={{
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            color: `${theme.textSecondary}CC`,
            maxWidth: '720px',
            lineHeight: 1.8,
            borderRadius: '12px',
            background: `rgba(255,255,255,0.04)`,
            padding: '20px 24px',
            border: `1px solid rgba(255,255,255,0.08)`,
            position: 'relative', zIndex: 1,
          }}
        >
          {slide.context}
        </motion.p>
      )}
    </div>
  )
}
