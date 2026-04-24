import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command } from 'lucide-react';
import { useSearch } from '../hooks/useDb';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (layer: number, section: string) => void;
}

const layerColor = (layer: number) => {
  const colors: Record<number, string> = {
    0: '#8b2500', 1: '#1a365d', 2: '#2d5a3d', 3: '#b8860b', 4: '#6a1b9a', 5: '#e65100',
  };
  return colors[layer] || '#888';
};

export default function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useSearch(query);

  useEffect(() => {
    setSelectedIdx(0);
  }, [results.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { setSelectedIdx((i) => Math.min(i + 1, results.length - 1)); e.preventDefault(); return; }
      if (e.key === 'ArrowUp') { setSelectedIdx((i) => Math.max(i - 1, 0)); e.preventDefault(); return; }
      if (e.key === 'Enter' && results[selectedIdx]) {
        const item = results[selectedIdx];
        onNavigate(item.layer, item.id);
        onClose();
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, results, selectedIdx, onClose, onNavigate]);

  const layerNames: Record<number, string> = {
    0: '牛家村江湖', 1: 'LLM 前世今生', 2: 'Runtime 内核', 3: 'Agent 操作系统', 4: '多 Agent 编排', 5: '实战工具箱',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 200, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', paddingTop: '120px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '100%', maxWidth: '640px', background: '#fff',
              borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 20px', borderBottom: '1px solid #eee',
            }}>
              <Search size={20} color="#888" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索技术概念、江湖人物、Agent..."
                style={{
                  flex: 1, border: 'none', outline: 'none', fontSize: '16px',
                  fontFamily: "'Noto Serif SC', serif", background: 'transparent',
                }}
              />
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', background: '#f5f5f5', borderRadius: '6px',
                fontSize: '12px', color: '#888',
              }}>
                <Command size={12} />
                <span>K</span>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#888" />
              </button>
            </div>

            {/* Results */}
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {results.length === 0 && query.trim() && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                  未找到与 "{query}" 相关的内容
                </div>
              )}
              {results.map((item, i) => (
                <button
                  key={`${item.id}-${i}`}
                  onClick={() => {
                    onNavigate(item.layer, item.id);
                    onClose();
                    setQuery('');
                  }}
                  onMouseEnter={() => setSelectedIdx(i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 20px', textAlign: 'left', border: 'none',
                    borderBottom: '1px solid #f5f5f5',
                    background: i === selectedIdx ? '#f8f8f8' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: layerColor(item.layer), flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{item.subtitle}</div>
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                    background: `${layerColor(item.layer)}15`, color: layerColor(item.layer),
                    fontWeight: 600,
                  }}>
                    Layer {item.layer} · {layerNames[item.layer] || ''}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 20px', background: '#f8f8f8',
              fontSize: '12px', color: '#888', display: 'flex', gap: '16px',
            }}>
              <span>↑↓ 选择</span>
              <span>↵ 跳转</span>
              <span>Esc 关闭</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
