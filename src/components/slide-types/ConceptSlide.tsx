import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'
import MermaidChart from '../MermaidChart'
import { CHART_MAP } from '../../charts'

const PlotlyChart = lazy(() => import('../PlotlyChart'))

// ─── shared bullet list ───────────────────────────────────────────────────────
function BulletList({ bullets, theme, compact = true }: {
  bullets: NonNullable<Slide['bullets']>
  theme: ChapterTheme
  compact?: boolean
}) {
  return (
    <>
      {bullets.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.1 }}
          style={{
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            borderLeft: `3px solid ${i === 0 ? theme.accent + 'CC' : theme.accent + '50'}`,
            paddingLeft: '14px',
            paddingTop: compact ? '7px' : '9px',
            paddingBottom: compact ? '7px' : '9px',
            // odd items shift right slightly — breaks rigid column feel
            marginLeft: i % 2 === 1 ? '10px' : '0',
          }}
        >
          {b.icon && (
            <span style={{ fontSize: compact ? '17px' : '22px', flexShrink: 0, lineHeight: 1.35 }}>
              {b.icon}
            </span>
          )}
          <div>
            <div style={{
              color: theme.textPrimary, fontWeight: 700,
              fontSize: compact ? '14px' : '17px',
              lineHeight: 1.3, marginBottom: b.sub ? '3px' : 0,
            }}>
              {b.text}
            </div>
            {b.sub && (
              <div style={{
                color: `${theme.textSecondary}BB`,
                fontSize: compact ? '12px' : '14px',
                lineHeight: 1.65,
              }}>
                {b.sub}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </>
  )
}

// ─── shared analogy strip ─────────────────────────────────────────────────────
function AnalogyStrip({ analogy, theme, delay = 0.6, bleed = false }: {
  analogy: NonNullable<Slide['analogy']>
  theme: ChapterTheme
  delay?: number
  bleed?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        borderLeft: `3px solid ${theme.accent}`,
        paddingLeft: '14px', paddingTop: '8px', paddingBottom: '8px',
        paddingRight: bleed ? '20px' : '0',
        background: `linear-gradient(90deg, ${theme.accent}18 0%, ${theme.accent}06 70%, transparent 100%)`,
        borderRadius: '0 12px 12px 0',
        ...(bleed && {
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }),
      }}
    >
      <span style={{ color: theme.accent, fontWeight: 700, fontSize: '12px' }}>
        🎭 {analogy.character}：
      </span>
      <span style={{ color: `${theme.textSecondary}CC`, fontSize: '13px', lineHeight: 1.6 }}>
        {analogy.scene}
      </span>
      {analogy.insight && (
        <span style={{ color: theme.accent, fontWeight: 600, fontSize: '13px' }}>
          {' '}💡 {analogy.insight}
        </span>
      )}
    </motion.div>
  )
}

// ─── lightbox ─────────────────────────────────────────────────────────────────
export function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
      }}
    >
      <motion.img
        src={src} alt={alt}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        style={{ maxWidth: '95vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: '6px' }}
      />
      <div style={{
        position: 'absolute', top: '20px', right: '28px',
        color: '#fff', fontSize: '26px', opacity: 0.5,
      }}>✕</div>
    </motion.div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function ConceptSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const [lightbox, setLightbox] = useState(false)
  const bullets = slide.bullets ?? []
  const chartDef = slide.chart ? CHART_MAP[slide.chart] : undefined
  const hasChart = !!chartDef
  const hasImage = !!slide.image && !hasChart
  const hasDiagram = !!slide.diagram && !hasImage && !hasChart

  return (
    <>
      <AnimatePresence>
        {lightbox && hasImage && (
          <Lightbox src={slide.image!} alt={slide.title} onClose={() => setLightbox(false)} />
        )}
      </AnimatePresence>

      {(hasImage || hasChart) ? (
        // ══════════════════════════════════════════════════════════════════
        // IMAGE-BLEED / CHART LAYOUT
        // Right side: either PNG image (bleed) or Plotly chart (transparent)
        // Text floats left, analogy bleeds into visual zone.
        // ══════════════════════════════════════════════════════════════════
        <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>

          {/* ── Visual layer (z:1) — image OR chart ── */}
          {hasChart ? (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18, duration: 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: '44%', right: '0', top: '4%', height: '88%',
                zIndex: 1,
              }}
            >
              <Suspense fallback={null}>
                <PlotlyChart chart={chartDef!} />
              </Suspense>
            </motion.div>
          ) : (
            <motion.img
              src={slide.image}
              alt={slide.title}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18, duration: 0.7, ease: 'easeOut' }}
              onClick={() => setLightbox(true)}
              style={{
                position: 'absolute',
                right: '-2%', top: '4%',
                width: '66%', height: '90%',
                objectFit: 'contain',
                zIndex: 1,
                cursor: 'zoom-in',
                maskImage: 'linear-gradient(to right, transparent 0%, black 22%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 22%)',
                filter: `drop-shadow(0 20px 60px ${theme.accent}45) brightness(1.08)`,
              }}
            />
          )}

          {/* ── Text column (z:3) — left 43%, scrollable ── */}
          <div style={{
            position: 'relative', zIndex: 3,
            width: '43%', height: '100%',
            display: 'flex', flexDirection: 'column',
            padding: '26px 0 96px 44px',
            overflow: 'hidden',
          }}>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ flexShrink: 0, marginBottom: '18px' }}
            >
              {slide.emoji && (
                <span style={{ fontSize: '28px', marginRight: '10px', verticalAlign: 'middle' }}>
                  {slide.emoji}
                </span>
              )}
              <h2 style={{
                color: theme.accent, fontSize: 'clamp(20px,2.8vw,32px)',
                fontWeight: 800, margin: 0, lineHeight: 1.2, display: 'inline',
              }}>
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p style={{ color: theme.textSecondary, margin: '6px 0 0', fontSize: '14px', opacity: 0.85 }}>
                  {slide.subtitle}
                </p>
              )}
            </motion.div>

            {/* Bullets */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <BulletList bullets={bullets} theme={theme} compact />
            </div>
          </div>

          {/* ── Analogy strip (z:3) — absolute bottom, bleeds wider than text col ── */}
          {slide.analogy && (
            <div style={{
              position: 'absolute', bottom: '20px', left: '44px',
              width: hasChart ? '50%' : '62%', zIndex: 3,
            }}>
              <AnalogyStrip
                analogy={slide.analogy}
                theme={theme}
                delay={0.25 + bullets.length * 0.1}
                bleed
              />
            </div>
          )}

          {/* Zoom hint — only for image */}
          {hasImage && (
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
          )}
        </div>

      ) : hasDiagram ? (
        // ══════════════════════════════════════════════════════════════════
        // MERMAID DIAGRAM LAYOUT — 25/75 grid, diagram is the hero
        // ══════════════════════════════════════════════════════════════════
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '22px 44px 0', flexShrink: 0 }}
          >
            <h2 style={{
              color: theme.accent, fontSize: 'clamp(20px,3vw,34px)',
              fontWeight: 800, margin: '0 0 4px',
            }}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '15px', opacity: 0.85 }}>
                {slide.subtitle}
              </p>
            )}
          </motion.div>
          <div style={{
            flex: 1, minHeight: 0,
            display: 'grid',
            gridTemplateColumns: bullets.length > 0 ? '24% 76%' : '0 100%',
            gap: 0, overflow: 'hidden', padding: '14px 36px 8px',
          }}>
            {bullets.length > 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '6px',
                overflowY: 'auto', paddingRight: '16px',
                alignSelf: 'flex-start',
                minWidth: 0,
              }}>
                <BulletList bullets={bullets} theme={theme} compact />
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                overflow: 'hidden',
                height: '100%',
                minWidth: 0,
                minHeight: 0,
              }}
            >
              <MermaidChart chart={slide.diagram!} id={slide.id} />
            </motion.div>
          </div>
          {/* Analogy strip — always at bottom, full width */}
          {slide.analogy && (
            <div style={{ padding: '0 44px 16px', flexShrink: 0 }}>
              <AnalogyStrip analogy={slide.analogy} theme={theme} delay={0.5} />
            </div>
          )}
        </div>

      ) : (
        // ══════════════════════════════════════════════════════════════════
        // TEXT-ONLY LAYOUT — full width
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
            <BulletList bullets={bullets} theme={theme} compact={false} />
            {slide.analogy && (
              <div style={{ marginTop: '16px' }}>
                <AnalogyStrip analogy={slide.analogy} theme={theme} delay={bullets.length * 0.1 + 0.2} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

