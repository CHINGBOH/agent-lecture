import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  highlightLines?: number[];
}

export default function CodeBlock({ code, language = 'go', title, highlightLines = [] }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: '#1e1e1e',
      margin: 0,
      borderRadius: '0 0 8px 8px',
      fontSize: '13px',
      lineHeight: '1.6',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: 'transparent',
      fontFamily: "'JetBrains Mono', 'Consolas', monospace",
    },
  };

  return (
    <div style={{ margin: '16px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
      {title && (
        <div style={{
          background: '#2d5a3d',
          color: '#fff',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: "'Noto Serif SC', serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{title}</span>
          <button
            onClick={handleCopy}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        showLineNumbers
        wrapLines
        lineProps={(lineNumber: number) => ({
          style: {
            backgroundColor: highlightLines.includes(lineNumber) ? 'rgba(184, 134, 11, 0.2)' : 'transparent',
            display: 'block',
            width: '100%',
          },
        })}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
