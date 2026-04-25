import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'
import { Lightbox } from './ConceptSlide'

export default function TimelineSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const [active, setActive] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState(false)
  const items = slide.timeline ?? []
  const hasImage = !!slide.image

  return (
    <>
      <AnimatePresence>
        {lightbox && hasImage && (
          <Lightbox src={slide.image!} alt={slide.title} onClose={() => setLightbox(false)} />
        )}
      </AnimatePresence>

      {hasImage ? (
        // ══════════════════════════════════════════════════════════════════
        // IMAGE-BLEED LAYOUT — image drifts from right, events float left
        // ══════════════════════════════════════════════════════════════════
        <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>

          {/* ── Image layer (z:1) ── */}
          <motion.img
            src={slide.image}
            alt={slide.title}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
            onClick={() => setLightbox(true)}
            style={{
              position: 'absolute',
              right: '-2%',
              top: '3%',
              width: '70%',
              height: '92%',
              objectFit: 'contain',
              zIndex: 1,
              cursor: 'zoom-in',
              maskImage: 'linear-gradient(to right, transparent 0%, black 20%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%)',
              filter: `drop-shadow(0 20px 60px ${theme.accent}40) brightness(1.06)`,
            }}
          />

          {/* ── Events column (z:3) ── */}
          <div style={{
            position: 'relative', zIndex: 3,
            width: '44%', height: '100%',
            display: 'flex', flexDirection: 'column',
            padding: '26px 0 24px 44px',
            overflow: 'hidden',
          }}>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ flexShrink: 0, marginBottom: '16px' }}
            >
              <h2 style={{
                color: theme.accent, fontSize: 'clamp(20px,2.8vw,32px)',
                fontWeight: 800, margin: 0, lineHeight: 1.2,
              }}>
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p style={{ color: theme.textSecondary, margin: '5px 0 0', fontSize: '14px', opacity: 0.85 }}>
                  {slide.subtitle}
                </p>
              )}
            </motion.div>

            {/* Timeline events — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setActive(active === i ? null : i)}
                  style={{
                    cursor: 'pointer',
                    borderLeft: `3px solid ${item.highlight ? theme.accent : theme.accent + '40'}`,
                    paddingLeft: '12px', paddingTop: '6px', paddingBottom: '6px',
                    background: item.highlight ? `${theme.accent}0E` : 'transparent',
                    borderRadius: '0 8px 8px 0',
                    // stagger alternate items slightly
                    marginLeft: i % 2 === 1 ? '8px' : '0',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, color: theme.accent,
                      minWidth: '40px', flexShrink: 0,
                    }}>
                      {item.year}
                    </span>
                    <span style={{
                      fontSize: '13px', fontWeight: item.highlight ? 700 : 500,
                      color: item.highlight ? theme.textPrimary : theme.textSecondary,
                    }}>
                      {item.event}
                      {item.highlight && (
                        <span style={{
                          marginLeft: '6px', fontSize: '9px',
                          background: theme.accent, color: '#000',
                          padding: '1px 5px', borderRadius: '10px', fontWeight: 700,
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
          </div>

          {/* Zoom hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={() => setLightbox(true)}
            style={{
              position: 'absolute', bottom: '16px', right: '18px', zIndex: 4,
              fontSize: '11px', color: 'rgba(255,255,255,0.3)',
              background: 'rgba(0,0,0,0.35)', padding: '3px 10px',
              borderRadius: '20px', cursor: 'zoom-in', userSelect: 'none',
            }}
          >
            ⊕ 点击放大
          </motion.div>
        </div>

      ) : (
        // ══════════════════════════════════════════════════════════════════
        // NO-IMAGE LAYOUT — single column
        // ══════════════════════════════════════════════════════════════════
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 44px 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ flexShrink: 0, marginBottom: '20px' }}
          >
            <h2 style={{ color: theme.accent, fontSize: 'clamp(20px,3vw,34px)', fontWeight: 800, margin: 0 }}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p style={{ color: theme.textSecondary, margin: '6px 0 0', fontSize: '16px', opacity: 0.85 }}>
                {slide.subtitle}
              </p>
            )}
          </motion.div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px',
                  background: item.highlight ? `${theme.accent}0E` : 'transparent',
                  borderRadius: '0 8px 8px 0',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: theme.accent, minWidth: '44px', flexShrink: 0 }}>
                    {item.year}
                  </span>
                  <span style={{
                    fontSize: '16px', fontWeight: item.highlight ? 700 : 500,
                    color: item.highlight ? theme.textPrimary : theme.textSecondary,
                  }}>
                    {item.event}
                  </span>
                </div>
                <AnimatePresence>
                  {active === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        fontSize: '14px', color: `${theme.textSecondary}AA`,
                        lineHeight: 1.7, overflow: 'hidden',
                        marginTop: '6px',
                      }}
                    >
                      {item.detail}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
