import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  accent: string
  isOpen: boolean
}

export default function AiButton({ onClick, accent, isOpen }: Props) {
  return (
    <motion.button
      onClick={onClick}
      title="AI 解说助手"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
      style={{
        position: 'absolute',
        right: '20px',
        bottom: '92px',
        zIndex: 20,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: `2px solid ${accent}`,
        background: isOpen
          ? accent
          : 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(16px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        boxShadow: `0 0 0 0 ${accent}`,
        animation: isOpen ? 'none' : 'aiGlow 2.5s ease-in-out infinite',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <style>{`
        @keyframes aiGlow {
          0%   { box-shadow: 0 0 0 0 ${accent}55; }
          50%  { box-shadow: 0 0 0 8px ${accent}00; }
          100% { box-shadow: 0 0 0 0 ${accent}00; }
        }
      `}</style>
      {isOpen ? '✕' : '🤖'}
    </motion.button>
  )
}
