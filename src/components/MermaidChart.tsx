import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1e3a5f',
    primaryTextColor: '#e3f2fd',
    primaryBorderColor: '#4FC3F7',
    lineColor: '#80DEEA',
    secondaryColor: '#2d1b4e',
    tertiaryColor: '#1a2a1a',
    fontFamily: '-apple-system, "PingFang SC", sans-serif',
    fontSize: '13px',
    background: 'transparent',
  },
  flowchart: { curve: 'basis', padding: 20 },
  sequence: { actorMargin: 60, messageMargin: 35 },
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
    if (ref.current) {
      // 清空之前的内容
      ref.current.innerHTML = '';
      
      try {
        // 验证图表语法
        if (!chart || chart.trim() === '') {
          throw new Error('图表内容为空');
        }
        
        // 检查图表类型（用 startsWith 兼容 "flowchart LR" 等带参数的声明）
        const firstLine = chart.trim().split('\n')[0].trim()
        const supported = ['flowchart', 'sequenceDiagram', 'stateDiagram', 'classDiagram', 'graph', 'gitGraph', 'erDiagram', 'journey', 'gantt', 'pie']
        if (!supported.some(t => firstLine.startsWith(t))) {
          throw new Error(`不支持的图表类型: ${firstLine}`)
        }
        
        mermaid.render(`mermaid-${id}`, chart)
          .then(({ svg }) => {
            if (ref.current) {
              ref.current.innerHTML = svg;
            }
            setError(null);
          })
          .catch((err) => {
            console.warn(`Mermaid render error for ${id}:`, err.message);
            setError(err.message);
            if (ref.current) {
              ref.current.innerHTML = `<div style="padding: 16px; color: #888; font-size: 13px; text-align: center;">
                <div style="margin-bottom: 8px;">⚠️ 图表渲染失败</div>
                <div style="font-size: 11px; color: #aaa; text-align: left; margin-bottom: 8px;">
                  原因：Mermaid语法错误
                </div>
                <pre style="font-size: 11px; color: #aaa; text-align: left; overflow: auto; max-height: 200px; background: #f8f8f8; padding: 8px; border-radius: 4px;">
                  ${chart.substring(0, 500)}${chart.length > 500 ? '...' : ''}
                </pre>
              </div>`;
            }
          });
      } catch (err) {
        console.warn(`Mermaid validation error for ${id}:`, err);
        setError((err as Error).message);
        if (ref.current) {
          ref.current.innerHTML = `<div style="padding: 16px; color: #888; font-size: 13px; text-align: center;">
            <div style="margin-bottom: 8px;">⚠️ 图表语法错误</div>
            <div style="font-size: 11px; color: #aaa; text-align: left; margin-bottom: 8px;">
              原因：${(err as Error).message}
            </div>
            <pre style="font-size: 11px; color: #aaa; text-align: left; overflow: auto; max-height: 200px; background: #f8f8f8; padding: 8px; border-radius: 4px;">
              ${chart.substring(0, 500)}${chart.length > 500 ? '...' : ''}
            </pre>
          </div>`;
        }
      }
    }
  }, [chart, id]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'auto',
        minHeight: '80px',
      }}
    />
  );
}
