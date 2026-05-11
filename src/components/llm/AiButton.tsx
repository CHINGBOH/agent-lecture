import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
}

export default function AiButton({ onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      title="打开 AI 助手"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      style={{
        position: 'absolute',
        right: '18px',
        bottom: '18px',
        transition: 'background 0.2s, border-color 0.2s',
        zIndex: 20,
        minWidth: '34px',
        height: '34px',
        padding: '0 10px',
        borderRadius: '999px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(8,8,16,0.32)',
        backdropFilter: 'blur(18px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: 'rgba(255,255,255,0.68)',
      }}
    >
      AI
    </motion.button>
  )
}
