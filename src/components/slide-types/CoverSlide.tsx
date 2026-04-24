import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

export default function CoverSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', textAlign: 'center', padding: '60px 40px',
    }}>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ fontSize: '96px', marginBottom: '32px', filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.3))' }}
      >
        {slide.emoji}
      </motion.div>
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          color: theme.textPrimary,
          margin: '0 0 16px',
          fontWeight: 900,
          letterSpacing: '0.05em',
          textShadow: `0 0 40px ${theme.accent}80`,
        }}
      >
        {slide.title}
      </motion.h1>
      {slide.subtitle && (
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            color: theme.textSecondary,
            margin: 0,
            letterSpacing: '0.08em',
          }}
        >
          {slide.subtitle}
        </motion.p>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          marginTop: '60px', fontSize: '14px',
          color: `${theme.textSecondary}80`,
          letterSpacing: '0.15em',
        }}
      >
        按 → 继续
      </motion.div>
    </div>
  )
}
