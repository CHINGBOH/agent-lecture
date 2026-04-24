import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#e8f5e9',
    primaryTextColor: '#1a1a1a',
    primaryBorderColor: '#2d5a3d',
    lineColor: '#4a8c5f',
    secondaryColor: '#fff8e1',
    tertiaryColor: '#f5f0e6',
    fontFamily: "'Noto Serif SC', serif",
    fontSize: '14px',
  },
  flowchart: {
    curve: 'basis',
    padding: 16,
  },
  sequence: {
    actorMargin: 60,
    boxMargin: 12,
    boxTextMargin: 6,
    noteMargin: 12,
    messageMargin: 40,
  },
});

interface MermaidChartProps {
  chart: string;
  id: string;
}

export default function MermaidChart({ chart, id }: MermaidChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.render(`mermaid-${id}`, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      });
    }
  }, [chart, id]);

  return (
    <div
      ref={ref}
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e8e8e8',
        overflow: 'auto',
        margin: '16px 0',
      }}
    />
  );
}
