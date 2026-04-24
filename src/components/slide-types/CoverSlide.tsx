import { motion } from 'framer-motion'
import type { Slide } from '../../data/types'
import type { ChapterTheme } from '../../data/themes'

// 简单 CSS 星空粒子
function Starfield({ accent }: { accent: string }) {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 4,
    dur: Math.random() * 3 + 2,
  }))
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.5 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill={accent}>
          <animate attributeName="opacity" values="0;1;0" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  )
}

export default function CoverSlide({ slide, theme }: { slide: Slide; theme: ChapterTheme }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', textAlign: 'center', padding: '60px 40px',
      position: 'relative', overflow: 'hidden',
    }}>
      <Starfield accent={theme.accent} />

      {/* 中心光晕 */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px', borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.accent}12 0%, transparent 70%)`,
        pointerEvents: 'none',
        animation: 'coverGlow 4s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes coverGlow {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity:0.6; }
          50%      { transform: translate(-50%,-50%) scale(1.3); opacity:1; }
        }
      `}</style>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          fontSize: '96px', marginBottom: '32px',
          filter: `drop-shadow(0 0 30px ${theme.accent}60)`,
          position: 'relative', zIndex: 1,
        }}
      >
        {slide.emoji}
      </motion.div>
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          color: theme.textPrimary,
          margin: '0 0 16px',
          fontWeight: 900,
          letterSpacing: '0.05em',
          textShadow: `0 0 40px ${theme.accent}80`,
          position: 'relative', zIndex: 1,
        }}
      >
        {slide.title}
      </motion.h1>
      {slide.subtitle && (
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            color: theme.textSecondary,
            margin: 0,
            letterSpacing: '0.08em',
            position: 'relative', zIndex: 1,
          }}
        >
          {slide.subtitle}
        </motion.p>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          marginTop: '60px', fontSize: '13px',
          color: `${theme.textSecondary}60`,
          letterSpacing: '0.15em',
          position: 'relative', zIndex: 1,
        }}
      >
        按 → 或空格 继续
      </motion.div>
    </div>
  )
}
