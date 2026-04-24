import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

export default function ComparisonSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  const before = slide.before ?? []
  const after = slide.after ?? []

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '36px 48px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {slide.emoji && <div style={{ fontSize: '40px', marginBottom: '12px' }}>{slide.emoji}</div>}
        <h2 style={{ color: theme.accent, fontSize: 'clamp(18px,3vw,30px)', fontWeight: 800, margin: '0 0 24px' }}>
          {slide.title}
        </h2>
      </motion.div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', overflow: 'hidden' }}>
        {/* 左列 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div style={{
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em',
            color: '#ff6b6b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            ❌ 你以为
          </div>
          {before.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              style={{
                background: 'rgba(255,107,107,0.07)',
                border: '1px solid rgba(255,107,107,0.2)',
                borderRadius: '12px', padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                {item.icon && <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#ff9e9e', marginBottom: '4px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '15px', color: `${theme.textSecondary}CC`, lineHeight: 1.7 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 右列 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div style={{
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em',
            color: theme.accent, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            ✅ 实际上
          </div>
          {after.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{
                background: `${theme.accent}0D`,
                border: `1px solid ${theme.accent}30`,
                borderRadius: '12px', padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                {item.icon && <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: theme.accent, marginBottom: '4px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '15px', color: `${theme.textSecondary}CC`, lineHeight: 1.7 }}>
                    {item.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 类比 */}
      {slide.analogy && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            marginTop: '16px',
            background: `${theme.accent}08`,
            border: `1px solid ${theme.accent}25`,
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '13px',
            color: `${theme.textSecondary}CC`,
            lineHeight: 1.7,
          }}
        >
          <span style={{ color: theme.accent, fontWeight: 700 }}>🎭 {slide.analogy.character}：</span>
          {slide.analogy.scene}
          <span style={{ color: theme.accent, fontWeight: 500 }}> 💡 {slide.analogy.insight}</span>
        </motion.div>
      )}
    </div>
  )
}
