import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'
import MermaidChart from '../MermaidChart'

export default function ConceptSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const [lightbox, setLightbox] = useState(false)
  const bullets = slide.bullets ?? []
  const hasImage = !!slide.image
  const hasDiagram = !!slide.diagram && !hasImage
  const hasVisual = hasImage || hasDiagram

  return (
    <>
      {/* Lightbox overlay */}
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
              color: '#fff', fontSize: '28px', opacity: 0.6, cursor: 'pointer',
            }}>✕</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header — compact, not in a box */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '28px 44px 0', flexShrink: 0 }}
        >
          <h2 style={{
            color: theme.accent, fontSize: 'clamp(20px,3vw,34px)',
            fontWeight: 800, margin: '0 0 4px', lineHeight: 1.2,
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
          gridTemplateColumns: hasVisual ? '32% 68%' : '1fr',
          gap: 0,
          overflow: 'hidden',
          padding: '16px 44px 24px',
        }}>
          {/* Left: bullets + analogy */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            overflowY: 'auto', paddingRight: hasVisual ? '20px' : 0,
          }}>
            {bullets.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  borderLeft: `3px solid ${theme.accent}60`,
                  paddingLeft: '12px',
                  paddingTop: '4px', paddingBottom: '4px',
                }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0, lineHeight: 1.4 }}>{b.icon}</span>
                <div>
                  <div style={{
                    color: theme.textPrimary, fontWeight: 700,
                    fontSize: hasVisual ? '15px' : '18px',
                    lineHeight: 1.3, marginBottom: b.sub ? '3px' : 0,
                  }}>
                    {b.text}
                  </div>
                  {b.sub && (
                    <div style={{
                      color: `${theme.textSecondary}BB`,
                      fontSize: hasVisual ? '13px' : '15px',
                      lineHeight: 1.6,
                    }}>
                      {b.sub}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Analogy — compact 2-line block, no equal-weight card */}
            {slide.analogy && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bullets.length * 0.1 + 0.2 }}
                style={{
                  marginTop: '10px',
                  borderLeft: `3px solid ${theme.accent}`,
                  paddingLeft: '12px',
                  paddingTop: '6px', paddingBottom: '6px',
                  background: `${theme.accent}08`,
                  borderRadius: '0 8px 8px 0',
                }}
              >
                <div style={{
                  fontSize: '11px', color: theme.accent, fontWeight: 700,
                  letterSpacing: '0.08em', marginBottom: '4px',
                }}>
                  🎭 {slide.analogy.character}
                </div>
                <div style={{
                  fontSize: '13px', color: `${theme.textSecondary}CC`,
                  lineHeight: 1.6,
                }}>
                  {slide.analogy.scene}
                </div>
                {slide.analogy.insight && (
                  <div style={{
                    fontSize: '13px', color: theme.accent,
                    fontWeight: 600, marginTop: '4px', lineHeight: 1.5,
                  }}>
                    💡 {slide.analogy.insight}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right: image — no border, fills column */}
          {hasImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              onClick={() => setLightbox(true)}
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
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
              {/* Subtle zoom hint */}
              <div style={{
                position: 'absolute', bottom: '10px', right: '12px',
                fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                background: 'rgba(0,0,0,0.5)', padding: '2px 8px',
                borderRadius: '20px', userSelect: 'none',
              }}>
                点击放大
              </div>
            </motion.div>
          )}

          {/* Right: Mermaid fallback */}
          {hasDiagram && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                borderRadius: '12px', overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
                boxShadow: `0 0 0 1px rgba(255,255,255,0.08)`,
                padding: '16px', overflowY: 'auto',
              }}
            >
              <MermaidChart chart={slide.diagram!} id={slide.id} />
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

