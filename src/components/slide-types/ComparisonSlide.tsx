import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

export default function ComparisonSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const before = slide.before ?? []
  const after = slide.after ?? []

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 44px 24px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '20px' }}>
        {slide.emoji && <div style={{ fontSize: '36px', marginBottom: '8px' }}>{slide.emoji}</div>}
        <h2 style={{ color: theme.accent, fontSize: 'clamp(20px,3vw,32px)', fontWeight: 800, margin: 0 }}>
          {slide.title}
        </h2>
      </motion.div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', overflow: 'hidden' }}>
        {/* 左列 — 你以为 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}
        >
          <div style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
            color: '#ff6b6b', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '6px',
            borderBottom: '1px solid rgba(255,107,107,0.2)', paddingBottom: '8px',
          }}>
            ✗ 你以为
          </div>
          {before.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                borderLeft: '3px solid rgba(255,107,107,0.35)',
                paddingLeft: '14px', paddingTop: '8px', paddingBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                {item.icon && <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1.3 }}>{item.icon}</span>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#ff9e9e', marginBottom: '2px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '14px', color: `${theme.textSecondary}BB`, lineHeight: 1.6 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 右列 — 实际上 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}
        >
          <div style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
            color: theme.accent, marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '6px',
            borderBottom: `1px solid ${theme.accent}30`, paddingBottom: '8px',
          }}>
            ✓ 实际上
          </div>
          {after.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08 }}
              style={{
                borderLeft: `3px solid ${theme.accent}60`,
                paddingLeft: '14px', paddingTop: '8px', paddingBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                {item.icon && <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1.3 }}>{item.icon}</span>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: theme.accent, marginBottom: '2px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '14px', color: `${theme.textSecondary}BB`, lineHeight: 1.6 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 类比 — compact strip at bottom */}
      {slide.analogy && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          style={{
            marginTop: '14px', flexShrink: 0,
            borderLeft: `3px solid ${theme.accent}`,
            paddingLeft: '14px', paddingTop: '6px', paddingBottom: '6px',
            background: `${theme.accent}06`,
            borderRadius: '0 8px 8px 0',
          }}
        >
          <span style={{ color: theme.accent, fontWeight: 700, fontSize: '12px' }}>
            🎭 {slide.analogy.character}：
          </span>
          <span style={{ color: `${theme.textSecondary}CC`, fontSize: '13px', lineHeight: 1.6 }}>
            {slide.analogy.scene}
          </span>
          {slide.analogy.insight && (
            <span style={{ color: theme.accent, fontWeight: 600, fontSize: '13px' }}>
              {' '}💡 {slide.analogy.insight}
            </span>
          )}
        </motion.div>
      )}
    </div>
  )
}
