import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    background: 'transparent',
    primaryColor: '#16304d',
    primaryTextColor: '#cce7ff',
    primaryBorderColor: '#4fc3f7',
    lineColor: '#60cddc',
    secondaryColor: '#1a2545',
    tertiaryColor: '#0e2040',
    edgeLabelBackground: '#0d2040',
    clusterBkg: '#0a1a30',
    clusterBorder: '#4fc3f780',
    titleColor: '#8adcff',
    nodeBorder: '#4fc3f7',
    fontFamily: '"PingFang SC", "Helvetica Neue", -apple-system, sans-serif',
    fontSize: '13px',
  },
  flowchart: { curve: 'basis', padding: 16, htmlLabels: true },
  securityLevel: 'loose',
});

interface MermaidChartProps {
  chart: string;
  id: string;
}

export default function MermaidChart({ chart, id }: MermaidChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    let cancelled = false;
    ref.current.innerHTML = '';

    // Use a unique render ID per invocation to avoid collisions when React
    // Strict Mode double-invokes effects concurrently.
    const renderId = `mermaid-${id}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      if (!chart || chart.trim() === '') {
        throw new Error('图表内容为空');
      }

      const firstLine = chart.trim().split('\n')[0].trim();
      const supported = ['flowchart', 'sequenceDiagram', 'stateDiagram', 'classDiagram', 'graph', 'gitGraph', 'erDiagram', 'journey', 'gantt', 'pie'];
      if (!supported.some(t => firstLine.startsWith(t))) {
        throw new Error(`不支持的图表类型: ${firstLine}`);
      }

      mermaid.render(renderId, chart)
        .then(({ svg }) => {
          if (cancelled || !ref.current) return;
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector('svg');
          if (svgEl) {
            // Remove fixed dimensions so CSS can scale to fit the container
            svgEl.removeAttribute('height');
            svgEl.removeAttribute('width');
            svgEl.style.maxWidth = '100%';
            svgEl.style.maxHeight = '100%';
            svgEl.style.width = 'auto';
            svgEl.style.height = 'auto';
            svgEl.style.display = 'block';
          }
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn(`Mermaid render error for ${id}:`, err.message);
          setError(err.message);
          if (ref.current) {
            ref.current.innerHTML = `<div style="padding: 16px; color: #888; font-size: 13px; text-align: center;">
              <div style="margin-bottom: 8px;">⚠️ 图表渲染失败</div>
              <pre style="font-size: 11px; color: #aaa; text-align: left; overflow: auto; max-height: 200px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">${chart.substring(0, 500)}${chart.length > 500 ? '...' : ''}</pre>
            </div>`;
          }
        });
    } catch (err) {
      if (!cancelled) {
        console.warn(`Mermaid validation error for ${id}:`, err);
        setError((err as Error).message);
        if (ref.current) {
          ref.current.innerHTML = `<div style="padding: 16px; color: #888; font-size: 13px; text-align: center;">
            <div style="margin-bottom: 8px;">⚠️ 图表语法错误: ${(err as Error).message}</div>
          </div>`;
        }
      }
    }

    return () => {
      cancelled = true;
      // Clean up any lingering mermaid temp element
      document.getElementById(renderId)?.remove();
    };
  }, [chart, id]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(10, 26, 48, 0.6)',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1px solid rgba(79, 195, 247, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    />
  );
}
