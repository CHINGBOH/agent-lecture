import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, X, Maximize, Minimize,
  MonitorPlay, Layers, Keyboard
} from 'lucide-react';
import { pptSlides, totalSlides } from '../data/pptSlides';
import MermaidChart from './MermaidChart';

interface PPTModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const layerColors: Record<number, string> = {
  [-1]: '#d4a843',
  0: '#1a365d',
  1: '#2d5a3d',
  2: '#b8860b',
  3: '#8b2500',
};

const layerNames: Record<number, string> = {
  [-1]: '封面',
  0: 'LLM前世今生',
  1: '底层机制',
  2: '中层 Agent',
  3: '牛家村江湖',
};

// ============================================================
// Slide Renderer
// ============================================================
function SlideRenderer({ slide }: { slide: typeof pptSlides[0] }) {
  const color = layerColors[slide.layer] || '#333';

  // Cover Slide
  if (slide.type === 'cover') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        padding: '40px',
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📖</div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            color: '#fff',
            marginBottom: '16px',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}>
            {slide.title}
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: '#aaa',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}>
            {slide.subtitle}
          </p>
          <div style={{
            marginTop: '40px',
            padding: '12px 32px',
            background: 'rgba(212, 168, 67, 0.2)',
            borderRadius: '24px',
            color: '#d4a843',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Keyboard size={16} />
            <span>按 → 开始演示</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // End Slide
  if (slide.type === 'end') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        padding: '40px',
      }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🙏</div>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: '#fff',
            marginBottom: '16px',
            fontWeight: 700,
          }}>
            {slide.title}
          </h1>
          <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '40px' }}>{slide.subtitle}</p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-start',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            {slide.bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ccc', fontSize: '16px' }}>
                <span style={{ fontSize: '20px' }}>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '40px',
            padding: '10px 24px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#888',
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <X size={14} />
            <span>按 Esc 退出演示模式</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Content Slide
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '48px 64px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Header */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          background: `${color}20`,
          borderRadius: '6px',
          fontSize: '12px',
          color: color,
          fontWeight: 600,
          marginBottom: '12px',
        }}>
          <Layers size={12} />
          Layer {slide.layer} · {layerNames[slide.layer]}
        </div>
        <h2 style={{
          fontSize: 'clamp(24px, 3.5vw, 36px)',
          color: '#fff',
          fontWeight: 700,
          lineHeight: 1.3,
        }}>
          {slide.title}
        </h2>
      </motion.div>

      {/* Body: Two columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: slide.code || slide.chart || slide.image ? '1fr 1fr' : '1fr',
        gap: '40px',
        flex: 1,
        minHeight: 0,
      }}>
        {/* Left: Bullets */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {slide.bullets.map((b, i) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ color: '#eee', fontSize: '15px', lineHeight: 1.5 }}>{b.text}</div>
                {b.highlight && (
                  <div style={{ color: color, fontSize: '13px', marginTop: '4px', fontWeight: 600 }}>
                    {b.highlight}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {slide.analogy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                marginTop: '8px',
                padding: '12px 16px',
                background: `${color}15`,
                borderRadius: '8px',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <span style={{ fontSize: '13px', color: color }}>🎭 {slide.analogy}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Right: Code or Chart or Image */}
        {(slide.code || slide.chart || slide.image) && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              background: slide.image ? 'transparent' : '#1a1a2e',
              borderRadius: '12px',
              padding: slide.image ? '0' : '20px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: 1.6,
              border: slide.image ? 'none' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {slide.image ? (
              <img
                src={slide.image}
                alt={slide.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  borderRadius: '12px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <>
                {slide.code && (
                  <pre style={{ margin: 0, color: '#c9d1d9', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    <code>{slide.code}</code>
                  </pre>
                )}
                {slide.chart && (
                  <MermaidChart id={`ppt-${slide.id}`} chart={slide.chart} />
                )}
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Note */}
      {slide.note && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          💡 {slide.note}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
// PPT Mode Main
// ============================================================
export default function PPTMode({ isOpen, onClose }: PPTModeProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);

  const goTo = useCallback((idx: number, dir: number = 1) => {
    if (idx >= 0 && idx < totalSlides) {
      setDirection(dir);
      setCurrent(idx);
    }
  }, []);

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      }
      if (e.key === 'Home') {
        e.preventDefault();
        goTo(0);
      }
      if (e.key === 'End') {
        e.preventDefault();
        goTo(totalSlides - 1);
      }
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen();
        }
      }
      if (e.key === 't' || e.key === 'T') {
        setShowThumbs((s) => !s);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, next, prev, goTo, onClose]);

  // Track fullscreen state
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Reset to first slide when opening
  useEffect(() => {
    if (isOpen) setCurrent(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const slide = pptSlides[current];
  const progress = ((current + 1) / totalSlides) * 100;

  // Respect prefers-reduced-motion for accessibility
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const variants = {
  enter: (dir: number) => ({
    x: prefersReducedMotion ? 0 : (dir > 0 ? 300 : -300),
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: prefersReducedMotion ? 0 : (dir > 0 ? -300 : 300),
    opacity: 0,
  }),
};

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: '#0d1117',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MonitorPlay size={18} color="#888" />
          <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>
            PPT 演示模式
          </span>
          <span style={{ fontSize: '12px', color: '#555' }}>|</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {current + 1} / {totalSlides}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowThumbs((s) => !s)}
            style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="缩略图 (T)"
          >
            <Layers size={14} />
            <span>缩略图</span>
          </button>
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen();
              }
            }}
            style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="全屏 (F)"
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            <span>{isFullscreen ? '退出全屏' : '全屏'}</span>
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="退出 (Esc)"
          >
            <X size={14} />
            <span>退出</span>
          </button>
        </div>
      </div>

      {/* Slide Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.35, ease: 'easeInOut' as const }}
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'auto',
            }}
          >
            <SlideRenderer slide={slide} />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <motion.button
          onClick={prev}
          disabled={current === 0}
          whileHover={current === 0 ? {} : { scale: 1.12, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={current === 0 ? {} : { scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: current === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: current === 0 ? '#444' : '#fff',
            cursor: current === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <motion.button
          onClick={next}
          disabled={current === totalSlides - 1}
          whileHover={current === totalSlides - 1 ? {} : { scale: 1.12, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={current === totalSlides - 1 ? {} : { scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: current === totalSlides - 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: current === totalSlides - 1 ? '#444' : '#fff',
            cursor: current === totalSlides - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

      {/* Thumbnail Panel */}
      <AnimatePresence>
        {showThumbs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: 'rgba(0,0,0,0.5)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '16px 24px',
              overflowX: 'auto',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: '12px', minWidth: 'min-content' }}>
              {pptSlides.map((s, i) => (
                <motion.button
                  key={i}
                  onClick={() => goTo(i)}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    width: '120px',
                    height: '80px',
                    borderRadius: '8px',
                    border: `2px solid ${i === current ? layerColors[s.layer] : 'transparent'}`,
                    background: i === current ? `${layerColors[s.layer]}20` : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    padding: '8px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: '10px', color: layerColors[s.layer], fontWeight: 600 }}>
                    {s.layer >= 0 ? `L${s.layer}` : s.type === 'cover' ? '封面' : '结束'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: i === current ? '#fff' : '#888',
                    fontWeight: i === current ? 600 : 400,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {s.title}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <div style={{
        padding: '12px 24px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#666', minWidth: '60px' }}>
            {current + 1} / {totalSlides}
          </span>
          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%',
                background: layerColors[slide.layer] || '#d4a843',
                borderRadius: '2px',
              }}
            />
          </div>
          <span style={{ fontSize: '12px', color: '#666', minWidth: '40px', textAlign: 'right' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', color: '#444' }}>
          <span>← → 翻页</span>
          <span>Space 下一页</span>
          <span>Home/End 首尾</span>
          <span>F 全屏</span>
          <span>T 缩略图</span>
          <span>Esc 退出</span>
        </div>
      </div>
    </div>
  );
}
