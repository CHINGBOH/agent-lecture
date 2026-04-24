import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Crosshair, Camera, MessageSquare, Shield, RotateCcw,
  Clock, Zap, AlertTriangle, ChevronDown, ChevronRight, Play, Pause,
  StepForward, Code, Info
} from 'lucide-react';
import { useKernelConcepts } from '../../hooks/useDb';
import type { KernelConcept } from '../../hooks/useDb';
import MermaidChart from '../MermaidChart';
import FadeIn from '../animations/FadeIn';

const LAYER_COLOR = '#2d5a3d';

// ============================================================
// Concept Card — 可折叠的深度概念展示
// ============================================================
function ConceptCard({ concept, index }: { concept: KernelConcept; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const iconMap: Record<string, React.ReactNode> = {
    'core': <Crosshair size={18} />,
    'security': <Shield size={18} />,
    'reliability': <RotateCcw size={18} />,
    'scheduler': <Clock size={18} />,
    'async': <Zap size={18} />,
    'error': <AlertTriangle size={18} />,
  };

  return (
    <FadeIn delay={index * 0.06}>
      <div style={{
        border: `1px solid ${expanded ? LAYER_COLOR : '#e0e0e0'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '12px',
        background: expanded ? `${LAYER_COLOR}04` : '#fff',
        transition: 'all 0.3s',
      }}>
        {/* Header - always visible */}
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: `${LAYER_COLOR}15`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: LAYER_COLOR, flexShrink: 0,
          }}>
            {iconMap[concept.category] || <Info size={18} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: LAYER_COLOR }}>{concept.name}</div>
            <div style={{
              fontSize: '11px', color: '#888', marginTop: '2px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span className="tag" style={{
                background: `${LAYER_COLOR}10`, color: LAYER_COLOR,
                padding: '1px 8px', fontSize: '10px',
              }}>
                {concept.category}
              </span>
              {concept.analogy && (
                <span style={{ color: 'var(--crimson)', fontSize: '12px' }}>
                  🎭 {concept.analogy.slice(0, 30)}...
                </span>
              )}
            </div>
          </div>
          <div style={{ color: '#aaa', flexShrink: 0 }}>
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${LAYER_COLOR}20` }}>
                {/* Detail */}
                <div style={{ marginTop: '14px' }}>
                  <h4 style={{ fontSize: '13px', color: LAYER_COLOR, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} /> 深入理解
                  </h4>
                  <div style={{
                    fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.8,
                    whiteSpace: 'pre-wrap', fontFamily: "'Noto Serif SC', serif",
                  }}>
                    {concept.detail}
                  </div>
                </div>

                {/* Analogy */}
                {concept.analogy && (
                  <div style={{
                    marginTop: '12px', padding: '12px 14px',
                    background: 'rgba(139, 37, 0, 0.06)', borderRadius: '8px',
                    borderLeft: '3px solid var(--crimson)',
                    fontSize: '13px', color: 'var(--crimson)',
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '12px' }}>🎭 牛家村比喻</div>
                    {concept.analogy}
                  </div>
                )}

                {/* Code example */}
                {concept.code_example && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ fontSize: '13px', color: LAYER_COLOR, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Code size={14} /> 伪代码
                    </h4>
                    <div style={{
                      padding: '16px', background: '#1e1e2e', borderRadius: '8px',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                      lineHeight: 1.7, color: '#c9d1d9', overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {concept.code_example}
                    </div>
                  </div>
                )}

                {/* Mermaid diagram */}
                {concept.mermaid_diagram && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ fontSize: '13px', color: LAYER_COLOR, marginBottom: '8px' }}>📊 流程图</h4>
                    <MermaidChart id={`kc-${concept.id}`} chart={concept.mermaid_diagram} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeIn>
  );
}

// ============================================================
// Tick 可视化模拟器
// ============================================================
function TickSimulator() {
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'generate' | 'tool' | 'verify'>('idle');
  const [log, setLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phases: Record<string, { label: string; color: string; desc: string }> = {
    idle: { label: 'IDLE', color: '#888', desc: '等待用户输入' },
    generate: { label: 'GENERATE', color: '#4a8c5f', desc: 'LLM 生成回复' },
    tool: { label: 'TOOL', color: '#b8860b', desc: '执行工具调用' },
    verify: { label: 'VERIFY', color: '#8b2500', desc: '质量审查' },
  };

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTick((t) => t + 1);
        setPhase((p) => {
          const order: Array<'idle' | 'generate' | 'tool' | 'verify'> = ['idle', 'generate', 'tool', 'generate', 'verify', 'idle'];
          const idx = order.indexOf(p);
          const next = order[(idx + 1) % order.length];
          const jmpLabels: Record<string, string> = {
            idle: 'JMP IDLE_ENTRY',
            generate: 'JMP GENERATE_ENTRY',
            tool: 'JMP TOOL_HANDLER',
            verify: 'JMP VERIFY_GATE',
          };
          setLog((prev) => {
            const nextLog = [...prev, `Tick ${tick + 1}: ${p} → ${next} (${jmpLabels[next]})`];
            return nextLog.slice(-20);
          });
          return next;
        });
      }, 800);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [running, tick]);

  const stepOnce = () => {
    setTick((t) => t + 1);
    setPhase((p) => {
      const order: Array<'idle' | 'generate' | 'tool' | 'verify'> = ['idle', 'generate', 'tool', 'generate', 'verify', 'idle'];
      const idx = order.indexOf(p);
      const next = order[(idx + 1) % order.length];
      const jmpLabels: Record<string, string> = {
        idle: 'JMP IDLE_ENTRY',
        generate: 'JMP GENERATE_ENTRY',
        tool: 'JMP TOOL_HANDLER',
        verify: 'JMP VERIFY_GATE',
      };
      setLog((prev) => [...prev, `Tick ${tick + 1}: ${p} → ${next} (${jmpLabels[next]})`]);
      return next;
    });
  };

  return (
    <div style={{
      padding: '20px', background: '#1a1a2e', borderRadius: '12px',
      marginBottom: '20px', color: '#fff',
    }}>
      <h4 style={{ color: '#d4a843', marginBottom: '16px', fontSize: '14px' }}>
        ⏱️ Tick 循环模拟器
      </h4>

      {/* Phase Display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-tick" style={{
            width: '50px', height: '50px', borderRadius: '50%',
            background: phases[phase].color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '16px',
            margin: '0 auto 8px',
          }}>
            {tick}
          </div>
          <div style={{ color: '#888', fontSize: '11px' }}>Tick #{tick}</div>
        </div>

        <div style={{ color: '#666', fontSize: '20px' }}>→</div>

        <div style={{
          padding: '16px 24px', borderRadius: '10px',
          background: `${phases[phase].color}20`,
          border: `2px solid ${phases[phase].color}`,
          minWidth: '160px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Current Phase</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: phases[phase].color }}>{phases[phase].label}</div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{phases[phase].desc}</div>
        </div>

        <div style={{ color: '#666', fontSize: '20px' }}>→</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>PC 指针 (JMP)</div>
          <div className="mono" style={{
            padding: '6px 12px', background: '#2d2d2d', borderRadius: '6px',
            color: '#d4a843', fontSize: '13px',
          }}>
            JMP {phase.toUpperCase()}_ENTRY
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
        <button onClick={() => setRunning(!running)} style={{
          padding: '8px 20px', borderRadius: '8px', border: 'none',
          background: running ? '#8b2500' : '#4a8c5f', color: '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px',
        }}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? '暂停' : '运行'}
        </button>
        <button onClick={stepOnce} disabled={running} style={{
          padding: '8px 20px', borderRadius: '8px', border: '1px solid #555',
          background: 'transparent', color: running ? '#555' : '#fff',
          cursor: running ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
        }}>
          <StepForward size={16} />
          单步
        </button>
        <button onClick={() => { setTick(0); setPhase('idle'); setLog([]); }} style={{
          padding: '8px 20px', borderRadius: '8px', border: '1px solid #555',
          background: 'transparent', color: '#aaa', cursor: 'pointer',
          fontSize: '13px',
        }}>
          重置
        </button>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div style={{
          padding: '12px', background: '#111', borderRadius: '8px',
          maxHeight: '120px', overflow: 'auto', fontSize: '11px',
          fontFamily: 'monospace', lineHeight: 1.8,
        }}>
          {log.map((line, i) => (
            <div key={i} style={{ color: i === log.length - 1 ? '#d4a843' : '#555' }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{
        marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap',
        fontSize: '11px', color: '#666',
      }}>
        <span><span style={{ color: '#888' }}>●</span> IDLE — 等待</span>
        <span><span style={{ color: '#4a8c5f' }}>●</span> GENERATE — LLM 生成</span>
        <span><span style={{ color: '#b8860b' }}>●</span> TOOL — 工具执行</span>
        <span><span style={{ color: '#8b2500' }}>●</span> VERIFY — 质量审查</span>
      </div>
    </div>
  );
}

// ============================================================
// JMP vs CALL 对比可视化
// ============================================================
function JmpComparison() {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ color: LAYER_COLOR, marginBottom: '12px', fontSize: '14px' }}>
        🎯 JMP vs CALL：本质区别
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* CALL side */}
        <div style={{
          padding: '16px', background: '#fff8e1', borderRadius: '10px',
          border: '2px solid #b8860b',
        }}>
          <h5 style={{ color: '#b8860b', marginBottom: '8px' }}>CALL = 轻功（函数调用）</h5>
          <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-mid)', lineHeight: 2 }}>
            洪七公：<span style={{ color: '#b8860b' }}>买了酒回来</span><br/>
            <span style={{ color: '#b8860b' }}>→ CALL buyWine()</span><br/>
            <span style={{ color: '#888' }}>郭靖买酒中...</span><br/>
            <span style={{ color: '#b8860b' }}>← RET（回到洪七公身边）</span><br/>
            洪七公：<span style={{ color: '#888' }}>继续喝酒</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
            💡 有返回地址，执行完回到原处
          </div>
        </div>

        {/* JMP side */}
        <div style={{
          padding: '16px', background: '#e8f5e9', borderRadius: '10px',
          border: '2px solid #2d5a3d',
        }}>
          <h5 style={{ color: LAYER_COLOR, marginBottom: '8px' }}>JMP = 变招（状态跳转）</h5>
          <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-mid)', lineHeight: 2 }}>
            防守态：<span style={{ color: '#888' }}>观察对手</span><br/>
            <span style={{ color: '#2d5a3d' }}>→ JMP ATTACK_ENTRY</span><br/>
            <span style={{ color: '#2d5a3d' }}>PC = attackHandler</span><br/>
            进攻态：<span style={{ color: '#2d5a3d' }}>出招！</span><br/>
            <span style={{ color: '#2d5a3d' }}>→ JMP IDLE_ENTRY</span><br/>
            <span style={{ color: '#888' }}>不回防守态！</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
            💡 无返回地址，PC 直接覆盖
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// State 快照查看器
// ============================================================
function StateViewer() {
  const [state, setState] = useState({
    tick: 3,
    phase: 'generate',
    messages: [
      { role: 'user', content: '查一下北京天气' },
      { role: 'assistant', content: '{"name":"getWeather","args":{"city":"北京"}}' },
    ],
    tools: ['getWeather', 'getNews', 'sendEmail'],
    pendingTool: null,
    sessionID: 'sess_abc123',
    checkpointID: 2,
  });

  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ color: LAYER_COLOR, marginBottom: '12px', fontSize: '14px' }}>
        💾 State 全息快照查看器
      </h4>
      <div style={{
        padding: '16px', background: '#1e1e2e', borderRadius: '10px',
        fontFamily: 'monospace', fontSize: '12px', color: '#c9d1d9',
        lineHeight: 2, overflow: 'auto',
      }}>
        <pre style={{ margin: 0 }}>
{`{
  "Tick":       ${state.tick},
  "Phase":      "${state.phase}",
  "Messages":   [
    {"role": "${state.messages[0].role}", "content": "${state.messages[0].content}"},
    {"role": "${state.messages[1].role}", "content": "${state.messages[1].content}"}
  ],
  "Tools":      [${state.tools.map(t => `"${t}"`).join(', ')}],
  "Pending":    ${JSON.stringify(state.pendingTool)},
  "SessionID":  "${state.sessionID}",
  "Checkpoint": ${state.checkpointID}
}`}
        </pre>
      </div>
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
        💡 每 Tick 结束时 State 被序列化，存入 DB。Checksum(SHA256) 防篡改。
      </div>
    </div>
  );
}

// ============================================================
// Channel 可视化
// ============================================================
function ChannelVisualizer() {
  const [queue, setQueue] = useState<string[]>([
    '郭靖→黄蓉：梅超风在东边',
    '黄蓉→仆人：去查探',
    '仆人→黄蓉：确认了',
    '黄蓉→郭靖：知道了',
  ]);

  const sendMsg = () => {
    const msgs = [
      '哨兵→洪七公：敌军出现',
      '洪七公→黄蓉：布阵',
      '黄蓉→郭靖：左路进攻',
      '郭靖→丘处机：请求支援',
    ];
    const newMsg = msgs[Math.floor(Math.random() * msgs.length)];
    setQueue((prev) => [...prev, newMsg].slice(-6));
  };

  const recvMsg = () => {
    setQueue((prev) => prev.slice(1));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ color: LAYER_COLOR, marginBottom: '12px', fontSize: '14px' }}>
        📨 Channel 信鸽传书队列
      </h4>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <button onClick={sendMsg} className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>📨 发消息</button>
        <button onClick={recvMsg} style={{
          padding: '6px 14px', borderRadius: '6px', border: '1px solid #ddd',
          background: '#fff', cursor: 'pointer', fontSize: '12px',
        }}>📩 收消息</button>
      </div>
      <div style={{
        padding: '12px', background: '#e3f2fd', borderRadius: '10px',
        border: '2px solid #4a7ab8',
      }}>
        <div style={{ fontSize: '11px', color: '#4a7ab8', fontWeight: 700, marginBottom: '8px' }}>
          Channel Queue (FIFO) {queue.length >= 4 ? '⚠️ 接近满' : ''}
        </div>
        {queue.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', marginBottom: '6px',
            background: i === 0 ? '#fff' : '#f8f8f8',
            borderRadius: '6px', fontSize: '12px', color: 'var(--ink-mid)',
            borderLeft: `3px solid ${i === 0 ? '#4a8c5f' : '#ddd'}`,
          }}>
            <span style={{ color: '#888', fontSize: '10px', minWidth: '16px' }}>{i + 1}.</span>
            <span style={{ flex: 1 }}>{msg}</span>
            {i === 0 && <span className="tag tag-jade" style={{ fontSize: '10px' }}>← 出队中</span>}
          </div>
        ))}
        {queue.length === 0 && <div style={{ color: '#888', fontSize: '13px' }}>队列为空</div>}
      </div>
    </div>
  );
}

// ============================================================
// Layer 2 Main
// ============================================================
export default function Layer2({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const concepts = useKernelConcepts();
  const [filter, setFilter] = useState<string | null>(null);

  const categories = ['all', 'core', 'security', 'reliability', 'scheduler', 'async', 'error'];
  const catLabels: Record<string, string> = {
    all: '全部',
    core: '核心机制',
    security: '安全',
    reliability: '可靠性',
    scheduler: '调度',
    async: '异步',
    error: '异常',
  };

  const filtered = filter ? concepts.filter((c) => c.category === filter) : concepts;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: LAYER_COLOR, marginBottom: '8px' }}>
            Layer 2：⚙️ Runtime 内核
          </h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>
            <strong>"深入操作系统到内核到 JMP"</strong> — 从硅到智能的跃迁。理解一台"没有 Agent 的裸 Runtime 是怎么工作的"。
            这是整套体系的精髓：Tick 驱动、JMP 跳转、State 快照、Channel 通信。
          </p>
          <div style={{
            marginTop: '12px', display: 'inline-flex', gap: '8px', flexWrap: 'wrap',
            padding: '10px 20px', background: `${LAYER_COLOR}10`, borderRadius: '24px',
            color: LAYER_COLOR, fontSize: '13px',
          }}>
            <Heart size={16} /> Tick · <Crosshair size={16} /> JMP · <Camera size={16} /> State · <MessageSquare size={16} /> Channel · <Shield size={16} /> ACL · <RotateCcw size={16} /> Rollback
          </div>
        </div>
      </FadeIn>

      {/* Interactive Tick Simulator */}
      <section className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Heart size={28} />
          ⏱️ Tick 主循环 + JMP 模拟器
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '16px', fontSize: '14px' }}>
          主循环每 N 毫秒一次 <strong>Tick</strong>。Tick 内：State 序列化 → 检查 PendingTool → 若存在则 <strong>JMP</strong> 到 ToolHandler → 执行后 JMP 回 Generate。
          不是函数调用，是 <strong>Program Counter 级别的状态跳转</strong>。
        </p>
        <TickSimulator />
        <StateViewer />
        <JmpComparison />
        <MermaidChart
          id="tick-state-full"
          chart={`
stateDiagram-v2
    [*] --> IDLE
    IDLE --> GENERATE : 用户输入 / JMP GENERATE_ENTRY
    GENERATE --> TOOL : 检测到 tool_call / JMP TOOL_HANDLER
    GENERATE --> IDLE : 无工具 / JMP IDLE_ENTRY
    TOOL --> GENERATE : 执行完成 / JMP GENERATE_ENTRY
    GENERATE --> VERIFY : 需要审查 / JMP VERIFY_GATE
    VERIFY --> IDLE : 通过 / JMP IDLE_ENTRY
    VERIFY --> GENERATE : 不通过 / Rollback + JMP GENERATE_ENTRY
    note right of IDLE : 等待用户输入
    note right of GENERATE : LLM 生成回复
    note right of TOOL : 执行外部工具
    note right of VERIFY : 质量门审查
        `}
        />
      </section>

      {/* Channel Visualization */}
      <section className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <MessageSquare size={28} />
          📨 Channel（总线）与 Memory（记忆）
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '16px', fontSize: '14px' }}>
          LLM ↔ Runtime ↔ Tool 之间不直接传递消息，全部经过 <strong>Channel FIFO 队列</strong>。
          Context Window 是 Channel 的缓冲区，满了触发 Summarizer 压缩。长期记忆（Vector DB）是密室墙上的武功图谱，RAG 检索。
        </p>
        <ChannelVisualizer />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ padding: '16px', background: '#e3f2fd', borderRadius: '10px' }}>
            <h4 style={{ color: '#2c5282', marginBottom: '8px', fontSize: '14px' }}>📨 Channel 特点</h4>
            <ul style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 2, paddingLeft: '16px', margin: 0 }}>
              <li>FIFO 队列，保证顺序</li>
              <li>异步不阻塞</li>
              <li>满了触发背压/摘要</li>
              <li>线程安全（互斥锁）</li>
            </ul>
          </div>
          <div style={{ padding: '16px', background: '#f3e5f5', borderRadius: '10px' }}>
            <h4 style={{ color: '#6a1b9a', marginBottom: '8px', fontSize: '14px' }}>🧠 Memory 系统</h4>
            <ul style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 2, paddingLeft: '16px', margin: 0 }}>
              <li><strong>短期</strong>：Context Window（脑海）</li>
              <li><strong>长期</strong>：Vector DB（密室图谱）</li>
              <li><strong>Checkpoint</strong>：State 快照</li>
              <li><strong>Summarize</strong>：满了压缩摘要</li>
            </ul>
          </div>
        </div>
        <MermaidChart
          id="channel-flow"
          chart={`
flowchart LR
    subgraph short[🧠 短期记忆 Context Window]
        A1[User Msg]
        A2[Assistant Msg]
        A3[Tool Result]
        A4[...]
    end
    subgraph channel[📨 Channel 队列]
        C1[FIFO]
    end
    subgraph long[📚 长期记忆 Vector DB]
        B1[武功图谱 1]
        B2[武功图谱 2]
        B3[...]
    end
    LLM -->|生成| channel
    channel -->|消费| Tool
    Tool -->|结果| channel
    channel -->|入队| short
    short -->|满了| Summarize
    Summarize -->|摘要替换| short
    LLM -->|查询| long
    long -->|召回上下文| LLM
        `}
        />
      </section>

      {/* SECURITY - ACL */}
      <section className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Shield size={28} />
          🛡️ ACL 与 Rule 引擎 + Checkpoint/Rollback
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '16px', fontSize: '14px' }}>
          每个 Tick 开始前，Runtime 先加载 Rule 做 ACL 检查。违反规则的 Phase 直接阻止。
          Checkpoint 是"上帝存档"，Rollback 是"读档"——回到之前某个存档点，全部 State 替换。
        </p>
        <MermaidChart
          id="acl-flow"
          chart={`
flowchart TD
    Start[Tick 开始] --> ACL{ACL Check}
    ACL -->|通过| Gen[执行 Generate]
    ACL -->|违反| Block[阻止进入 Generate]
    Block --> Log[记录违规]
    Log --> Idle[回到 IDLE]
    Gen --> Snapshot[保存 Snapshot]
    Snapshot --> Check2{验证通过？}
    Check2 -->|通过| Commit[提交 Checkpoint]
    Check2 -->|不通过| Rollback[Rollback]
    Rollback --> Gen
        `}
        />
      </section>

      {/* 全部 Kernel Concepts 展开列表 */}
      <section className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Info size={28} />
          📖 全部 Runtime 内核概念深度解析
        </h2>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat === 'all' ? null : cat)}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none',
                background: (cat === 'all' && !filter) || filter === cat ? LAYER_COLOR : '#f0f0f0',
                color: (cat === 'all' && !filter) || filter === cat ? '#fff' : 'var(--ink-mid)',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              }}
            >
              {catLabels[cat]}
            </button>
          ))}
        </div>
        <div>
          {filtered.map((concept, i) => (
            <ConceptCard key={concept.id} concept={concept} index={i} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}
