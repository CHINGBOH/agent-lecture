import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

export default function SummarySlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const items = slide.takeaways ?? []
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 60px',
    }}>
      {slide.emoji && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          style={{ fontSize: '56px', marginBottom: '20px' }}
        >
          {slide.emoji}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ color: theme.accent, fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, margin: '0 0 6px', textAlign: 'center' }}
      >
        {slide.title}
      </motion.h2>
      {slide.subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: theme.textSecondary, marginBottom: '32px', fontSize: '17px', textAlign: 'center' }}
        >
          {slide.subtitle}
        </motion.p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '720px' }}>
        {items.map((item, i) => {
          const isFinal = i === items.length - 1
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              style={{
                display: 'flex', gap: '14px', alignItems: 'flex-start',
                borderLeft: isFinal
                  ? `3px solid ${theme.accent}`
                  : `3px solid ${theme.accent}45`,
                paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px',
                background: isFinal ? `${theme.accent}08` : 'transparent',
                borderRadius: isFinal ? '0 8px 8px 0' : undefined,
              }}
            >
              <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: isFinal ? theme.accent : `${theme.accent}40`,
                color: isFinal ? '#000' : theme.accent,
                fontWeight: 900, fontSize: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '2px',
              }}>
                {isFinal ? '→' : i + 1}
              </span>
              <span style={{
                color: isFinal ? theme.accent : theme.textPrimary,
                fontSize: '17px', lineHeight: 1.65,
                fontWeight: isFinal ? 700 : 400,
              }}>
                {item}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
