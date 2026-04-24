import { motion } from 'framer-motion';

interface PulseRingProps {
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}

export default function PulseRing({ color = '#d4a843', size = 60, style }: PulseRingProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `2px solid ${color}`,
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          opacity: 0.3,
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
    </div>
  );
}
