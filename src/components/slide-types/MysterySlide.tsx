import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

export default function MysterySlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', textAlign: 'center', padding: '40px',
    }}>
      {slide.emoji && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{ fontSize: '72px', marginBottom: '32px' }}
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
        }}
      >
        {slide.title}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          fontSize: 'clamp(24px, 4vw, 48px)',
          fontWeight: 900,
          color: theme.textPrimary,
          lineHeight: 1.3,
          maxWidth: '900px',
          textShadow: `0 0 60px ${theme.accent}60`,
          marginBottom: '40px',
          borderLeft: `6px solid ${theme.accent}`,
          paddingLeft: '24px',
          textAlign: 'left',
        }}
      >
        {slide.question}
      </motion.div>

      {slide.context && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            color: `${theme.textSecondary}CC`,
            maxWidth: '720px',
            lineHeight: 1.8,
            borderRadius: '12px',
            background: `rgba(255,255,255,0.04)`,
            padding: '20px 24px',
            border: `1px solid rgba(255,255,255,0.08)`,
          }}
        >
          {slide.context}
        </motion.p>
      )}
    </div>
  )
}
