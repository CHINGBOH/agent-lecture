// 通用 GlowCard 组件
import type { CSSProperties, ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  accentColor?: string
  style?: CSSProperties
  onClick?: () => void
  className?: string
}

export default function GlowCard({ children, accentColor = '#fff', style, onClick, className }: GlowCardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: `rgba(255,255,255,0.06)`,
        border: `1px solid rgba(255,255,255,0.12)`,
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 30px ${accentColor}15, inset 0 1px 0 rgba(255,255,255,0.1)`,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
