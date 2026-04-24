import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

export default function QuoteSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const lines = (slide.quote ?? '').split('\n')
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '60px 80px', textAlign: 'center',
    }}>
      {slide.emoji && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          style={{ fontSize: '64px', marginBottom: '40px' }}
        >
          {slide.emoji}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '48px', color: `${theme.accent}60`,
          lineHeight: 1, marginBottom: '16px',
          fontFamily: 'Georgia, serif',
        }}
      >
        "
      </motion.div>

      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.2 }}
          style={{
            fontSize: 'clamp(20px, 3vw, 36px)',
            color: theme.textPrimary,
            fontWeight: 700,
            lineHeight: 1.5,
            margin: '4px 0',
            maxWidth: '800px',
            textShadow: `0 0 40px ${theme.accent}40`,
          }}
        >
          {line}
        </motion.p>
      ))}

      {slide.quoteAuthor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          style={{
            marginTop: '32px',
            fontSize: '16px',
            color: theme.textSecondary,
            letterSpacing: '0.05em',
          }}
        >
          {slide.quoteAuthor}
        </motion.div>
      )}
    </div>
  )
}
