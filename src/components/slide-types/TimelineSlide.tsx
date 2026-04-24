import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'
import GlowCard from '../common/GlowCard'

export default function TimelineSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const [active, setActive] = useState<number | null>(null)
  const items = slide.timeline ?? []

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '40px 48px' }}>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ color: theme.accent, fontSize: 'clamp(20px,3vw,32px)', fontWeight: 800, marginBottom: '8px' }}
      >
        {slide.title}
      </motion.h2>
      {slide.subtitle && (
        <p style={{ color: theme.textSecondary, marginBottom: '28px', fontSize: '15px' }}>{slide.subtitle}</p>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setActive(active === i ? null : i)}
            style={{
              display: 'flex', gap: '16px', alignItems: 'flex-start',
              cursor: 'pointer',
              borderRadius: '12px',
              padding: '14px 16px',
              background: item.highlight ? `${theme.accent}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${item.highlight ? theme.accent + '50' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              minWidth: '60px', fontWeight: 800,
              fontSize: '14px', color: theme.accent,
              paddingTop: '2px',
            }}>
              {item.year}
            </div>
            <div style={{ fontSize: '22px', paddingTop: '1px' }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 700, fontSize: '15px',
                color: item.highlight ? theme.textPrimary : theme.textSecondary,
                marginBottom: '4px',
              }}>
                {item.event}
                {item.highlight && (
                  <span style={{
                    marginLeft: '8px', fontSize: '11px',
                    background: theme.accent, color: '#000',
                    padding: '2px 8px', borderRadius: '20px', fontWeight: 700,
                  }}>
                    关键时刻
                  </span>
                )}
              </div>
              <AnimatePresence>
                {active === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ fontSize: '13px', color: `${theme.textSecondary}CC`, lineHeight: 1.7, overflow: 'hidden' }}
                  >
                    {item.detail}
                  </motion.div>
                )}
              </AnimatePresence>
              {active !== i && (
                <div style={{ fontSize: '13px', color: `${theme.textSecondary}80`, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {item.detail}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
