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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '720px' }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            style={{
              display: 'flex', gap: '14px', alignItems: 'center',
              background: i === items.length - 1 ? `${theme.accent}15` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === items.length - 1 ? theme.accent + '40' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '12px', padding: '14px 20px',
            }}
          >
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: theme.accent,
              color: '#000', fontWeight: 900, fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {i < items.length - 1 ? i + 1 : '→'}
            </span>
            <span style={{
              color: i === items.length - 1 ? theme.accent : theme.textPrimary,
              fontSize: '17px', lineHeight: 1.6,
              fontWeight: i === items.length - 1 ? 700 : 400,
            }}>
              {item}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
