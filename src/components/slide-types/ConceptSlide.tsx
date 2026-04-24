import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'
import MermaidChart from '../MermaidChart'

export default function ConceptSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const [diagramExpanded, setDiagramExpanded] = useState(false)
  const bullets = slide.bullets ?? []
  const hasAnalogy = !!slide.analogy
  const hasDiagram = !!slide.diagram

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '36px 48px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ color: theme.accent, fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, margin: '0 0 6px' }}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p style={{ color: theme.textSecondary, margin: '0 0 24px', fontSize: '17px' }}>{slide.subtitle}</p>
        )}
      </motion.div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: hasAnalogy || hasDiagram ? '1fr 1fr' : '1fr', gap: '24px', overflow: 'hidden' }}>
        {/* 左：要点 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {bullets.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              style={{
                display: 'flex', gap: '14px', alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '16px 20px',
              }}
            >
              <span style={{ fontSize: '26px', flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: '17px', marginBottom: b.sub ? '6px' : 0 }}>
                  {b.text}
                </div>
                {b.sub && (
                  <div style={{ color: `${theme.textSecondary}CC`, fontSize: '15px', lineHeight: 1.7 }}>
                    {b.sub}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 右：类比 或 Mermaid 图 */}
        {hasAnalogy && !hasDiagram && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: `${theme.accent}10`,
              border: `1px solid ${theme.accent}30`,
              borderRadius: '16px',
              padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '16px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '13px', color: theme.accent, fontWeight: 700, letterSpacing: '0.1em' }}>
              🎭 类比
            </div>
            <div style={{ fontWeight: 700, color: theme.textPrimary, fontSize: '18px' }}>
              {slide.analogy!.character}
            </div>
            <div style={{ color: `${theme.textSecondary}DD`, fontSize: '16px', lineHeight: 1.8 }}>
              {slide.analogy!.scene}
            </div>
            <div style={{
              borderTop: `1px solid ${theme.accent}30`,
              paddingTop: '14px',
              color: theme.accent,
              fontSize: '16px',
              lineHeight: 1.7,
              fontWeight: 600,
            }}>
              💡 {slide.analogy!.insight}
            </div>
          </motion.div>
        )}

        {hasDiagram && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '8px',
              overflowY: 'auto',
              cursor: 'pointer',
            }}
            onClick={() => setDiagramExpanded(v => !v)}
            title="点击切换全屏图表"
          >
            <div style={{ fontSize: '11px', color: theme.accent, fontWeight: 700, letterSpacing: '0.1em' }}>
              📊 流程图 {diagramExpanded ? '(点击收起)' : '(点击展开)'}
            </div>
            <MermaidChart chart={slide.diagram!} id={slide.id} />
          </motion.div>
        )}
      </div>
    </div>
  )
}

