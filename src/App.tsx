import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight, Keyboard, MonitorPlay, Database, Loader2, Network } from 'lucide-react';
import LayerSelector from './components/LayerSelector';
import Layer0 from './components/layers/Layer0';
import Layer1 from './components/layers/Layer1';
import Layer2 from './components/layers/Layer2';
import Layer3 from './components/layers/Layer3';
import Layer4 from './components/layers/Layer4';
import Layer5 from './components/layers/Layer5';
import KnowledgeGraphPage from './components/KnowledgeGraphPage';
import GlobalSearch from './components/GlobalSearch';
import ProgressBar from './components/ProgressBar';
import PPTMode from './components/PPTMode';
import { useDb } from './hooks/useDb';

export default function App() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pptOpen, setPptOpen] = useState(false);
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { ready, error } = useDb();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['0','1','2','3','4','5'].includes(e.key)) {
        setActiveLayer(parseInt(e.key));
      }
      if (e.key === '/' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'p' || e.key === 'P') {
        setPptOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Cross-layer navigation
  const handleNavigate = useCallback((layer: number, section: string) => {
    setActiveLayer(layer);
    setTargetSection(section);
  }, []);

  // Scroll to section after layer switch
  useEffect(() => {
    if (targetSection) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setTargetSection(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeLayer, targetSection]);

  // Loading state
  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--parchment)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--jade)' }} />
        <div style={{ fontSize: '18px', color: 'var(--ink-mid)' }}>
          正在加载数据库...
        </div>
        <div style={{ fontSize: '13px', color: 'var(--ink-light)' }}>
          Agent 全栈机制深度解析
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--parchment)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ fontSize: '48px' }}>❌</div>
        <div style={{ fontSize: '18px', color: 'var(--crimson)' }}>数据库加载失败</div>
        <div style={{ fontSize: '13px', color: 'var(--ink-mid)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
      <ProgressBar />

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d5a3d 100%)',
        color: '#fff',
        padding: '60px 24px 40px',
        textAlign: 'center',
        borderBottom: '3px solid var(--gold)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px', fontSize: '12px', color: '#aaa',
            cursor: 'pointer',
          }} onClick={() => setPptOpen(true)}>
            <MonitorPlay size={14} />
            <span>按 P 演示</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px', fontSize: '12px', color: '#aaa',
            cursor: 'pointer',
          }} onClick={() => setSearchOpen(true)}>
            <Keyboard size={14} />
            <span>按 / 搜索</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <BookOpen size={36} color="#d4a843" />
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', margin: 0, letterSpacing: '0.1em' }}>
            Agent 全栈机制深度解析
          </h1>
        </div>
        <p style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', opacity: 0.85, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6, padding: '0 16px' }}>
          🎭 浅出牛家村江湖 → 🧠 LLM 前世今生 → ⚙️ 深入 Runtime 内核(JMP/State) → 🏛️ 操作系统 → 🌐 分布式编排 → 🛠️ 实战工具
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          marginTop: '20px', padding: '10px 24px',
          background: 'rgba(184, 134, 11, 0.2)', borderRadius: '24px',
          fontSize: '14px', color: '#d4a843', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <Database size={16} />
          <span>数据驱动：全部内容存储在 SQLite 中</span>
          <ArrowRight size={16} />
          <span>推荐路径：Layer 0 → 2 → 1 → 3 → 4 → 5</span>
        </div>
      </header>

      <LayerSelector activeLayer={activeLayer} onChange={setActiveLayer} />

      {/* Content */}
      <main ref={mainRef} style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {activeLayer === 0 && <Layer0 onNavigate={handleNavigate} />}
            {activeLayer === 1 && <Layer1 onNavigate={handleNavigate} />}
            {activeLayer === 2 && <Layer2 onNavigate={handleNavigate} />}
            {activeLayer === 3 && <Layer3 onNavigate={handleNavigate} />}
            {activeLayer === 4 && <Layer4 onNavigate={handleNavigate} />}
            {activeLayer === 5 && <Layer5 onNavigate={handleNavigate} />}
            {activeLayer === 6 && <KnowledgeGraphPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#1a1a1a', color: '#888', textAlign: 'center',
        padding: '24px', fontSize: '13px', borderTop: '1px solid #333',
      }}>
        <p>基于 opencode + antigravity 源码解析 | 🎭 以《射雕英雄传》牛家村为喻</p>
        <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.6 }}>
          快捷键：0~5 切换层  |  / 搜索  |  P 演示模式  |  Esc 关闭
        </p>
      </footer>

      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />
      <PPTMode isOpen={pptOpen} onClose={() => setPptOpen(false)} />
    </div>
  );
}
