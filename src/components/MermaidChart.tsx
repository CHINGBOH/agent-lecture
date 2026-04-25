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
    fontSize: '15px',
  },
  flowchart: { curve: 'basis', padding: 20, htmlLabels: true },
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
            svgEl.removeAttribute('height');
            svgEl.removeAttribute('width');
            svgEl.style.display = 'block';
            // Initial size — prevents layout collapse before rAF fires
            svgEl.style.width = '100%';
            svgEl.style.height = 'auto';

            // After browser lays out the grid cell, apply container-aware scaling:
            // if SVG is wider (relative to height) than its container → constrain by width
            // if SVG is taller (relative to width) than its container → constrain by height
            requestAnimationFrame(() => {
              if (cancelled || !ref.current) return;
              const viewBox = svgEl.getAttribute('viewBox');
              const containerH = ref.current.clientHeight;
              const containerW = ref.current.clientWidth;
              if (viewBox && containerH > 0 && containerW > 0) {
                const parts = viewBox.trim().split(/[\s,]+/).map(Number);
                if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
                  const svgRatio = parts[2] / parts[3];
                  const containerRatio = containerW / containerH;
                  if (svgRatio > containerRatio) {
                    // SVG wider than container aspect: constrain by width
                    svgEl.style.width = '100%';
                    svgEl.style.height = 'auto';
                  } else {
                    // SVG taller than container aspect: constrain by height, center
                    svgEl.style.height = '100%';
                    svgEl.style.width = 'auto';
                    svgEl.style.maxWidth = '100%';
                  }
                }
              }
            });
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
        borderRadius: '14px',
        border: '1px solid rgba(79, 195, 247, 0.10)',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        minHeight: 0,
      }}
    />
  );
}
