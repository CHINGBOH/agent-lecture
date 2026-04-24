import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

const sectionIds = [
  // Layer 0 - 牛家村江湖
  'scene-section',
  'char-section',
  'story-section',
  'map-section',
  // Layer 1 - LLM
  'data-section',
  'annotation-section',
  'training-section-l0',
  'training-section',
  'tensor-section',
  'gradient-section',
  'decoding-section-l0',
  'json-section',
  'decoding-section',
  'tokenizer-section',
  // Layer 2 - Runtime 内核
  'tick-section',
  'tick-concept',
  'jmp-concept',
  'state-concept',
  'channel-section',
  'channel-concept',
  'memory-concept',
  'acl-concept',
  'checkpoint-concept',
  'schedule-concept',
  'async-concept',
  'interrupt-concept',
  // Layer 3 - Agent OS
  'arch-section',
  'pdca-section',
  'routing-section',
  'fork-section',
  'skill-section',
  'workflow-section',
  'ipc-section',
  // Layer 4 - Distributed
  'distributed-section',
  'consensus-section',
  'fault-section',
  'event-section',
  'monitoring-section',
  // Layer 5 - Tools
  'mcp-section',
  'sandbox-section',
  'eval-section',
  'playground',
];

export default function ProgressBar() {
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setSeen((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              next.add(entry.target.id);
            }
          });
          return next;
        });
      },
      { threshold: 0.3 }
    );

    // Observe all section elements that exist
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const progress = Math.round((seen.size / sectionIds.length) * 100);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 150,
      background: '#1a1a1a',
      padding: '6px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <Trophy size={14} color="#d4a843" />
      <span style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>
        已掌握 {seen.size} / {sectionIds.length} 个章节
      </span>
      <div style={{
        flex: 1,
        height: '6px',
        background: '#333',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #2d5a3d, #b8860b)',
          borderRadius: '3px',
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ fontSize: '12px', color: '#d4a843', fontWeight: 600, minWidth: '40px', textAlign: 'right' }}>
        {progress}%
      </span>
    </div>
  );
}
