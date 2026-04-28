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
        right: '16px',
        bottom: isOpen ? '582px' : '92px',
        transition: 'bottom 0.3s cubic-bezier(0.32,0.72,0,1), background 0.2s',
        zIndex: 20,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: `2px solid ${accent}`,
        background: isOpen ? accent : 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(16px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        animation: isOpen ? 'none' : 'aiGlow 2.5s ease-in-out infinite',
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
