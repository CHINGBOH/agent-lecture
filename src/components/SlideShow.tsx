import { useState, useEffect, useCallback } from 'react'
import { DIAGRAM_MAP } from '../generated/diagramMap'
import { CHART_MAP } from '../charts'
import { motion, AnimatePresence } from 'framer-motion'
import type { Slide } from '../data/types'
import type { Chapter } from '../data/types'
import { getTheme } from '../data/themes'
import CoverSlide from './slide-types/CoverSlide'
import MysterySlide from './slide-types/MysterySlide'
import ConceptSlide from './slide-types/ConceptSlide'
import TimelineSlide from './slide-types/TimelineSlide'
import ComparisonSlide from './slide-types/ComparisonSlide'
import QuoteSlide from './slide-types/QuoteSlide'
import SummarySlide from './slide-types/SummarySlide'

interface Props {
  slides: Slide[]
  chapters: Chapter[]
}

export default function SlideShow({ slides, chapters }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showHint, setShowHint] = useState(true)

  const slide = slides[current]
  const theme = getTheme(slide.chapter)

  const go = useCallback((delta: number) => {
    const next = current + delta
    if (next < 0 || next >= slides.length) return
    setDirection(delta > 0 ? 1 : -1)
    setCurrent(next)
  }, [current, slides.length])

  const jumpToChapter = useCallback((chapterId: number) => {
    const idx = slides.findIndex(s => s.chapter === chapterId)
    if (idx >= 0) {
      setDirection(chapterId >= slide.chapter ? 1 : -1)
      setCurrent(idx)
    }
    setMenuOpen(false)
  }, [slides, slide.chapter])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      setShowHint(false)
      if (menuOpen) {
        if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') setMenuOpen(false)
        return
      }
      switch (e.key) {
        case 'ArrowRight': case ' ': go(1); break
        case 'ArrowLeft': go(-1); break
        case 'm': case 'M': setMenuOpen(v => !v); break
        default:
          if (/^[0-5]$/.test(e.key)) jumpToChapter(Number(e.key))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, jumpToChapter, menuOpen])

  // Touch swipe
  useEffect(() => {
    let startX = 0
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX }
    const onTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1)
    }
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [go])

  // Chapter info for current slide
  const currentChapter = chapters.find(c => c.id === slide.chapter)
  const slideInChapter = slides.filter(s => s.chapter === slide.chapter)
  const posInChapter = slideInChapter.findIndex(s => s.id === slide.id) + 1

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#000', position: 'relative',
      fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
    }}>
      {/* Animated background gradient */}
      <motion.div
        key={slide.chapter}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute', inset: 0,
          background: theme.bg,
          zIndex: 0,
        }}
      />

      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute', inset: '0 0 72px 0',
            zIndex: 1,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <SlideRenderer slide={slide} theme={theme} />
        </motion.div>
      </AnimatePresence>

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '72px',
        zIndex: 10,
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        gap: '12px',
      }}>
        {/* Chapter tabs */}
        <div style={{ display: 'flex', gap: '6px', flex: 1, overflowX: 'auto' }}>
          {chapters.map(ch => (
            <button
              key={ch.id}
              onClick={() => jumpToChapter(ch.id)}
              title={`${ch.id} - ${ch.title}`}
              style={{
                background: ch.id === slide.chapter ? getTheme(ch.id).accent : 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: ch.id === slide.chapter ? 700 : 400,
                color: ch.id === slide.chapter ? '#000' : 'rgba(255,255,255,0.5)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {ch.emoji} {ch.title}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Mini-dots for slides in current chapter */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {slideInChapter.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === posInChapter - 1 ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === posInChapter - 1 ? theme.accent : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const chapterStart = slides.findIndex(s => s.chapter === slide.chapter)
                  setCurrent(chapterStart + i)
                }}
              />
            ))}
          </div>
          <button onClick={() => go(-1)} disabled={current === 0} style={navBtnStyle}>←</button>
          <button onClick={() => go(1)} disabled={current === slides.length - 1} style={navBtnStyle}>→</button>
          <button onClick={() => setMenuOpen(v => !v)} title="章节菜单 (M)" style={navBtnStyle}>☰</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: '72px', left: 0, right: 0,
        height: '3px', background: 'rgba(255,255,255,0.08)', zIndex: 10,
      }}>
        <motion.div
          style={{ height: '100%', background: theme.accent, originX: 0 }}
          animate={{ scaleX: (current + 1) / slides.length }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Chapter menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <ChapterMenu
            chapters={chapters}
            slides={slides}
            currentChapter={slide.chapter}
            onSelect={jumpToChapter}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* First-load keyboard hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 1.5 }}
            onClick={() => setShowHint(false)}
            style={{
              position: 'absolute', bottom: '88px', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '12px 20px',
              display: 'flex', gap: '16px', alignItems: 'center',
              fontSize: '12px', color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {[['→ / 空格', '下一张'], ['←', '上一张'], ['M', '章节菜单'], ['0-5', '跳章节']].map(([key, label]) => (
              <span key={key}>
                <kbd style={{
                  background: 'rgba(255,255,255,0.12)', borderRadius: '4px',
                  padding: '2px 6px', fontFamily: 'monospace', marginRight: '4px',
                  fontSize: '11px', color: '#fff',
                }}>{key}</kbd>
                {label}
              </span>
            ))}
            <span style={{ marginLeft: '8px', opacity: 0.4 }}>点击关闭</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Slide Router ────────────────────────────────────────────
function SlideRenderer({ slide, theme }: { slide: Slide; theme: ReturnType<typeof getTheme> }) {
  const enrichedSlide = {
    ...slide,
    chart: slide.chart ?? (CHART_MAP[slide.id] ? slide.id : undefined),
    image: slide.image ?? (CHART_MAP[slide.id] || slide.diagram ? undefined : DIAGRAM_MAP[slide.id]),
  }
  switch (enrichedSlide.type) {
    case 'cover':      return <CoverSlide slide={enrichedSlide} theme={theme} />
    case 'mystery':    return <MysterySlide slide={enrichedSlide} theme={theme} />
    case 'timeline':   return <TimelineSlide slide={enrichedSlide} theme={theme} />
    case 'comparison': return <ComparisonSlide slide={enrichedSlide} theme={theme} />
    case 'quote':      return <QuoteSlide slide={enrichedSlide} theme={theme} />
    case 'summary':    return <SummarySlide slide={enrichedSlide} theme={theme} />
    case 'concept':
    case 'diagram':
    default:           return <ConceptSlide slide={enrichedSlide} theme={theme} />
  }
}

// ─── Chapter Menu ─────────────────────────────────────────────
function ChapterMenu({
  chapters, slides, currentChapter, onSelect, onClose
}: {
  chapters: Chapter[]
  slides: Slide[]
  currentChapter: number
  onSelect: (id: number) => void
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px',
      }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(20,20,30,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '640px', width: '100%',
        }}
      >
        <h3 style={{ color: '#fff', margin: '0 0 24px', fontSize: '18px', fontWeight: 800 }}>
          📚 章节目录
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {chapters.map(ch => {
            const t = getTheme(ch.id)
            const chSlides = slides.filter(s => s.chapter === ch.id)
            return (
              <button
                key={ch.id}
                onClick={() => onSelect(ch.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: ch.id === currentChapter ? `${t.accent}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${ch.id === currentChapter ? t.accent + '50' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px', padding: '14px 18px',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '28px' }}>{ch.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: ch.id === currentChapter ? t.accent : '#fff', fontWeight: 700, fontSize: '15px' }}>
                    {ch.id === 0 ? '序章' : `第${['一','二','三','四','五'][ch.id - 1]}章`}：{ch.title}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                    {ch.subtitle}
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', flexShrink: 0 }}>
                  {chSlides.length} 张  [{ch.id}]
                </span>
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          点击选择章节 · 键盘 0-5 快速跳转 · Esc 关闭
        </div>
      </motion.div>
    </motion.div>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.7)',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '14px',
}
