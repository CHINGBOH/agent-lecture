import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

export default function TimelineSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const [active, setActive] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState(false)
  const items = slide.timeline ?? []
  const hasImage = !!slide.image

  return (
    <>
      <AnimatePresence>
        {lightbox && hasImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-out',
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              style={{ maxWidth: '95vw', maxHeight: '92vh', objectFit: 'contain' }}
            />
            <div style={{
              position: 'absolute', top: '20px', right: '28px',
              color: '#fff', fontSize: '28px', opacity: 0.6,
            }}>✕</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '28px 44px 12px', flexShrink: 0 }}
        >
          <h2 style={{
            color: theme.accent, fontSize: 'clamp(20px,3vw,34px)',
            fontWeight: 800, margin: '0 0 4px',
          }}>
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ color: theme.textSecondary, margin: 0, fontSize: '16px', opacity: 0.85 }}>
              {slide.subtitle}
            </p>
          )}
        </motion.div>

        {/* Body */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: hasImage ? '30% 70%' : '1fr',
          gap: 0,
          overflow: 'hidden',
          padding: '0 44px 24px',
        }}>
          {/* Left: event list */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            overflowY: 'auto',
            paddingRight: hasImage ? '16px' : 0,
          }}>
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActive(active === i ? null : i)}
                style={{
                  cursor: 'pointer',
                  borderLeft: `3px solid ${item.highlight ? theme.accent : theme.accent + '40'}`,
                  paddingLeft: '12px', paddingTop: '6px', paddingBottom: '6px',
                  background: item.highlight ? `${theme.accent}10` : 'transparent',
                  borderRadius: '0 8px 8px 0',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 800, color: theme.accent,
                    minWidth: '42px', flexShrink: 0,
                  }}>
                    {item.year}
                  </span>
                  <span style={{
                    fontSize: '14px', fontWeight: item.highlight ? 700 : 500,
                    color: item.highlight ? theme.textPrimary : theme.textSecondary,
                  }}>
                    {item.event}
                    {item.highlight && (
                      <span style={{
                        marginLeft: '6px', fontSize: '10px',
                        background: theme.accent, color: '#000',
                        padding: '1px 6px', borderRadius: '10px', fontWeight: 700,
                      }}>★</span>
                    )}
                  </span>
                </div>
                <AnimatePresence>
                  {active === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        fontSize: '12px', color: `${theme.textSecondary}AA`,
                        lineHeight: 1.6, overflow: 'hidden',
                        marginTop: '4px', paddingRight: '8px',
                      }}
                    >
                      {item.detail}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Right: image — dominant, no border */}
          {hasImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setLightbox(true)}
              style={{
                position: 'relative',
                borderRadius: '12px', overflow: 'hidden',
                cursor: 'zoom-in',
                background: 'rgba(0,0,0,0.25)',
                boxShadow: `0 0 0 1px ${theme.accent}20, 0 8px 32px rgba(0,0,0,0.4)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: '10px', right: '12px',
                fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '20px',
                userSelect: 'none',
              }}>
                点击放大
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
