import { useEffect, useRef, useState } from 'react';
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
  securityLevel: 'loose',
  // 禁止自动错误处理
  errorCallback: function(err, hash) {
    console.warn('Mermaid error:', err);
  }
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
        
        // 检查图表类型
        const chartType = chart.trim().split('\n')[0].trim();
        if (!['flowchart', 'sequenceDiagram', 'stateDiagram', 'stateDiagram-v2', 'classDiagram', 'graph'].includes(chartType)) {
          throw new Error('不支持的图表类型');
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
