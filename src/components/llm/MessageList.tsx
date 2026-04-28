import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from './useChat'

interface Props {
  messages: Message[]
  accent: string
}

export default function MessageList({ messages, accent }: Props) {
  if (messages.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              maxWidth: '88%',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '10px 14px',
              background: msg.role === 'user'
                ? accent
                : 'rgba(255,255,255,0.07)',
              color: msg.role === 'user' ? '#000' : 'rgba(255,255,255,0.9)',
              fontSize: '14px',
              lineHeight: '1.65',
              border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            {msg.role === 'assistant' ? (
              <>
                {msg.toolStatus && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px', fontStyle: 'italic' }}>
                    {msg.toolStatus}
                  </div>
                )}
                <MarkdownContent content={msg.content} />
                {msg.streaming && msg.content === '' && (
                  <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', height: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                    {msg.thinking ? (
                      <>
                        <span style={{ display: 'inline-flex', gap: '3px' }}>
                          {[0, 1, 2].map(j => (
                            <span key={j} style={{
                              width: '4px', height: '4px', borderRadius: '50%',
                              background: 'rgba(255,255,255,0.4)',
                              animation: `aiDot 1.2s ease-in-out ${j * 0.2}s infinite`,
                              display: 'inline-block',
                            }} />
                          ))}
                        </span>
                        思考中
                      </>
                    ) : (
                      [0, 1, 2].map(j => (
                        <span key={j} style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.5)',
                          animation: `aiDot 1.2s ease-in-out ${j * 0.2}s infinite`,
                          display: 'inline-block',
                        }} />
                      ))
                    )}
                  </span>
                )}
                {msg.streaming && msg.content !== '' && (
                  <span style={{
                    display: 'inline-block',
                    width: '2px', height: '14px',
                    background: accent,
                    marginLeft: '2px',
                    verticalAlign: 'text-bottom',
                    animation: 'aiCursor 0.8s step-end infinite',
                  }} />
                )}
              </>
            ) : (
              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
            )}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes aiDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes aiCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p style={{ margin: '0 0 6px', lineHeight: '1.65' }}>{children}</p>,
        strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
        em: ({ children }) => <em style={{ opacity: 0.85 }}>{children}</em>,
        ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: '18px' }}>{children}</ol>,
        li: ({ children }) => <li style={{ marginBottom: '2px' }}>{children}</li>,
        code: ({ children, className }) => {
          const isBlock = className?.startsWith('language-')
          return isBlock ? (
            <pre style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
              padding: '8px 12px', overflowX: 'auto', margin: '6px 0',
              fontSize: '12px', fontFamily: 'monospace',
            }}>
              <code>{children}</code>
            </pre>
          ) : (
            <code style={{
              background: 'rgba(255,255,255,0.12)', borderRadius: '4px',
              padding: '1px 5px', fontSize: '12px', fontFamily: 'monospace',
            }}>{children}</code>
          )
        },
        blockquote: ({ children }) => (
          <blockquote style={{
            borderLeft: '3px solid rgba(255,255,255,0.3)',
            margin: '6px 0', paddingLeft: '10px',
            opacity: 0.75, fontStyle: 'italic',
          }}>{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
