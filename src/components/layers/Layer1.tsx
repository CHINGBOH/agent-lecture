import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity, Database, GitBranch } from 'lucide-react';
import MermaidChart from '../MermaidChart';
import FadeIn from '../animations/FadeIn';


// ============================================================
// Section 1: LLM Training Pipeline
// ============================================================
function TrainingSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const [stage, setStage] = useState(0);
  const stages = [
    { name: 'Pre-training', desc: '江南七怪教基本功', detail: '在海量互联网文本上预测下一个 token，学会语法和常识', color: '#4a7ab8' },
    { name: 'SFT', desc: '马钰教内功心法', detail: '用(Question, Answer)对微调，学会按人类格式回答', color: '#4a8c5f' },
    { name: 'RLHF', desc: '洪七公实战纠正', detail: '人类对回答打分，用 PPO 强化学习对齐人类偏好', color: '#b8860b' },
    { name: 'Function Calling FT', desc: '周伯通逼背招式口诀', detail: '在 tokenizer 中加入 <tool_call> 特殊 token，强制输出结构化 JSON', color: '#8b2500' },
  ];

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--jade)', marginBottom: '16px' }}>
        <Cpu size={28} />
        训练：Tool Call 是怎么"练"出来的
      </h2>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
        模型不是天生会调用工具。就像郭靖不是天生会降龙十八掌，他经历了从江南七怪到洪七公的完整训练链条。
        第四阶段<strong>Function Calling Fine-tune</strong>是核心：模型被训练成"遇到特定问题时，必须输出 JSON 而不是自由文本"。
      </p>

      {/* Pipeline Animation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {stages.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => setStage(i)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '16px',
              borderRadius: '10px',
              border: `2px solid ${stage === i ? s.color : '#e0e0e0'}`,
              background: stage === i ? `${s.color}10` : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '12px', color: s.color, fontWeight: 700, marginBottom: '4px' }}>Stage {i + 1}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{s.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-mid)' }}>{s.desc}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            padding: '20px',
            background: `${stages[stage].color}08`,
            borderRadius: '10px',
            borderLeft: `4px solid ${stages[stage].color}`,
            marginBottom: '20px',
          }}
        >
          <strong style={{ color: stages[stage].color }}>{stages[stage].name}</strong>
          <p style={{ margin: '8px 0 0 0', color: 'var(--ink-mid)' }}>{stages[stage].detail}</p>
        </motion.div>
      </AnimatePresence>

      <FadeIn delay={0.3}>
        <div style={{ padding: '16px', background: '#1a1a2e', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
          <img src="/images/training_pipeline.png" alt="训练三部曲" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>训练流程：从 Pre-training 到 Function Calling FT</p>
        </div>
      </FadeIn>

      <NiuJiaLink concept="Pre-training / SFT / RLHF" onNavigate={onNavigate} />
      <MermaidChart
        id="training-flow"
        chart={`
flowchart LR
    A[原始语料<br/>互联网文本] -->|Pre-training| B[基础模型<br/>会"说话"]
    B -->|SFT| C[指令模型<br/>会"回答"]
    C -->|RLHF| D[对齐模型<br/>会"讨好"]
    D -->|Function Calling FT| E[工具模型<br/>会"调用"]
    style A fill:#e3f2fd
    style B fill:#e8f5e9
    style C fill:#fff8e1
    style D fill:#ffebee
    style E fill:#f3e5f5
        `}
      />
    </section>
  );
}

// ============================================================
// Section 2: Constrained Decoding
// ============================================================
function DecodingSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--jade)', marginBottom: '16px' }}>
        <Zap size={28} />
        推理：Logits Mask 强制出 JSON
      </h2>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
        模型生成时不是"自由写作"。就像黄蓉在场边喊"下一招只能是亢龙有悔或飞龙在天"，
        <strong>Constrained Decoding</strong> 通过 Mask 过滤掉所有不合法 token，让模型只能输出符合 JSON Schema 的内容。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '20px', background: '#ffebee', borderRadius: '10px' }}>
          <h4 style={{ color: 'var(--crimson)', marginBottom: '12px' }}>❌ 自由生成（无 Mask）</h4>
          <div className="mono" style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 2 }}>
            用户：查一下天气<br/>
            模型：好的，我来帮您查天气。今天的天气是...<br/>
            <span style={{ color: 'var(--crimson)' }}>→ 无法被程序解析！</span>
          </div>
        </div>
        <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '10px' }}>
          <h4 style={{ color: 'var(--jade)', marginBottom: '12px' }}>✅ 约束生成（有 Mask）</h4>
          <div className="mono" style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 2 }}>
            用户：查一下天气<br/>
            模型：<span style={{ color: 'var(--jade)' }}>{"{\"name\":\"getWeather\",\"args\":{\"city\":\"北京\"}}"}</span><br/>
            <span style={{ color: 'var(--jade)' }}>→ 可被程序直接解析执行！</span>
          </div>
        </div>
      </div>

      <FadeIn delay={0.3}>
        <div style={{ padding: '16px', background: '#1a0a0e', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
          <img src="/images/constrained_decoding.png" alt="Constrained Decoding" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Mask 过滤：非法 Token 置为 -∞，Softmax 后概率为 0</p>
        </div>
      </FadeIn>

      <NiuJiaLink concept="Constrained Decoding / JSON Mask" onNavigate={onNavigate} />
      <MermaidChart
        id="mask-flow"
        chart={`
sequenceDiagram
    participant U as 用户
    participant M as Model(郭靖)
    participant L as Logits分布
    participant K as Mask(黄蓉)
    participant T as Tool执行
    U->>M: "查天气"
    M->>L: 生成 logits [vocab_size]
    L->>K: 原始分数
    K->>K: 根据JSON Schema过滤<br/>非法token置为-inf
    K->>M: 只剩合法JSON token
    M->>U: {"name":"getWeather",...}
    M->>T: 调用工具
    T->>M: 返回结果
    M->>U: "北京今天晴，25°C"
        `}
      />
    </section>
  );
}

// ============================================================
// Section 3: Runtime Tick + JMP
// ============================================================
function TickSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const [tick, setTick] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'generate' | 'tool' | 'verify'>('idle');

  const phases: Record<string, { label: string; color: string; desc: string }> = {
    idle: { label: 'IDLE', color: '#888', desc: '等待用户输入' },
    generate: { label: 'GENERATE', color: '#4a8c5f', desc: 'LLM 生成回复' },
    tool: { label: 'TOOL', color: '#b8860b', desc: '执行工具调用' },
    verify: { label: 'VERIFY', color: '#8b2500', desc: '质量审查' },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setPhase((p) => {
        const order: Array<'idle' | 'generate' | 'tool' | 'verify'> = ['idle', 'generate', 'tool', 'generate', 'verify', 'idle'];
        const idx = order.indexOf(p);
        return order[(idx + 1) % order.length];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--jade)', marginBottom: '16px' }}>
        <Activity size={28} />
        Runtime Tick + JMP 跳转
      </h2>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
        主循环每 N 毫秒一次 <strong>Tick</strong>。Tick 内：State 序列化 → 检查 PendingTool → 若存在则 <strong>JMP</strong> 到 ToolHandler → 执行后 JMP 回 Generate。
        不是函数调用，是 <strong>Program Counter 级别的状态跳转</strong>。
      </p>

      {/* Tick Visualizer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '32px',
        background: '#1e1e1e',
        borderRadius: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-tick" style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: phases[phase].color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            margin: '0 auto 8px',
          }}>
            {tick}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>Tick #{tick}</div>
        </div>

        <div style={{ color: '#666', fontSize: '24px' }}>→</div>

        <div style={{
          padding: '20px 32px',
          borderRadius: '10px',
          background: `${phases[phase].color}20`,
          border: `2px solid ${phases[phase].color}`,
          minWidth: '200px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Current Phase</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: phases[phase].color }}>{phases[phase].label}</div>
          <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>{phases[phase].desc}</div>
        </div>

        <div style={{ color: '#666', fontSize: '24px' }}>→</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>PC 指针</div>
          <div className="mono" style={{
            padding: '8px 16px',
            background: '#2d2d2d',
            borderRadius: '6px',
            color: '#d4a843',
            fontSize: '14px',
          }}>
            JMP {phase.toUpperCase()}_ENTRY
          </div>
        </div>
      </div>

      <NiuJiaLink concept="Runtime Tick（时钟）" onNavigate={onNavigate} />
      <FadeIn delay={0.3}>
        <div style={{ padding: '16px', background: '#1a0a0e', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
          <img src="/images/runtime_tick_jmp.png" alt="Runtime Tick + JMP" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>每 Tick 一次：State 序列化 → 检查 PendingTool → JMP 到 Handler</p>
        </div>
      </FadeIn>

      <MermaidChart
        id="tick-state"
        chart={`
stateDiagram-v2
    [*] --> IDLE
    IDLE --> GENERATE : 用户输入 / JMP GENERATE
    GENERATE --> TOOL : 检测到 tool_call / JMP TOOL
    GENERATE --> IDLE : 无工具 / JMP IDLE
    TOOL --> GENERATE : 执行完成 / JMP GENERATE
    GENERATE --> VERIFY : 需要审查 / JMP VERIFY
    VERIFY --> IDLE : 通过 / JMP IDLE
    VERIFY --> GENERATE : 不通过 / Rollback + JMP GENERATE
        `}
      />
    </section>
  );
}

// ============================================================
// Section 4: Channel & Memory
// ============================================================
function ChannelSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--jade)', marginBottom: '16px' }}>
        <GitBranch size={28} />
        Channel（总线）与 Memory（记忆）
      </h2>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
        LLM ↔ Runtime ↔ Tool 之间不直接传递消息，而是经过 <strong>Channel 队列</strong>。
        Context Window 是 Channel 的缓冲区，满了触发 Summarizer。长期记忆（Vector DB）是密室墙上的武功图谱，需要时检索。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '10px' }}>
          <h4 style={{ color: '#2c5282', marginBottom: '12px' }}>📨 Channel（信鸽传书）</h4>
          <ul style={{ fontSize: '14px', color: 'var(--ink-mid)', lineHeight: 2, paddingLeft: '20px' }}>
            <li>FIFO 队列，保证顺序</li>
            <li>异步不阻塞</li>
            <li>满了触发背压/摘要</li>
            <li>线程安全（互斥锁）</li>
          </ul>
        </div>
        <div style={{ padding: '20px', background: '#f3e5f5', borderRadius: '10px' }}>
          <h4 style={{ color: '#6a1b9a', marginBottom: '12px' }}>🧠 Memory（记忆系统）</h4>
          <ul style={{ fontSize: '14px', color: 'var(--ink-mid)', lineHeight: 2, paddingLeft: '20px' }}>
            <li><strong>短期</strong>：Context Window（脑海，有限）</li>
            <li><strong>长期</strong>：Vector DB（密室图谱，需检索）</li>
            <li><strong>Checkpoint</strong>：State 快照（可回滚）</li>
            <li><strong>Summarize</strong>：满了压缩摘要</li>
          </ul>
        </div>
      </div>

      <FadeIn delay={0.3}>
        <div style={{ padding: '16px', background: '#1a0a0e', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
          <img src="/images/channel_memory.png" alt="Channel + Memory" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>LLM ↔ Channel ↔ Tool 异步通信 + 短期/长期记忆系统</p>
        </div>
      </FadeIn>

      <NiuJiaLink concept="Channel（总线）" onNavigate={onNavigate} />
      <MermaidChart
        id="channel-flow"
        chart={`
flowchart LR
    subgraph short[短期记忆 Context Window]
        A1[User Msg]
        A2[Assistant Msg]
        A3[Tool Result]
        A4[...]
    end
    
    subgraph channel[Channel 队列]
        C1[FIFO]
    end
    
    subgraph long[长期记忆 Vector DB]
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
  );
}

// ============================================================
// Section 5: State Snapshot
// ============================================================
function StateSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--jade)', marginBottom: '16px' }}>
        <Database size={28} />
        State（全息快照）
      </h2>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
        每个 Tick 结束时的 State 包含 messages、tools、pendingTool、sessionID、checkpointID。
        可被序列化存入 DB，随时恢复。<strong>这是 Agent 能"暂停/续跑"的根本</strong>。
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
        marginBottom: '20px',
      }}>
        {[
          { label: 'Tick N', state: '{Phase: generate, Pending: getWeather}', color: '#4a8c5f' },
          { label: 'Tick N+1', state: '{Phase: tool, Pending: getWeather}', color: '#b8860b' },
          { label: 'Tick N+2', state: '{Phase: generate, Pending: null}', color: '#4a7ab8' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '16px',
            borderRadius: '10px',
            background: `${s.color}10`,
            border: `2px solid ${s.color}`,
          }}>
            <div style={{ fontSize: '12px', color: s.color, fontWeight: 700, marginBottom: '8px' }}>{s.label}</div>
            <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-mid)' }}>{s.state}</div>
          </div>
        ))}
      </div>

      <NiuJiaLink concept="State（全息快照）" onNavigate={onNavigate} />
      <FadeIn delay={0.3}>
        <div style={{ padding: '16px', background: '#1a0a0e', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
          <img src="/images/state_snapshot.png" alt="State Snapshot" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>State Snapshot：Agent 的"此刻全部"，可序列化存入数据库</p>
        </div>
      </FadeIn>
    </section>
  );
}

// ============================================================
// NiuJiaLink: 反向链接到 Layer 3
// ============================================================
function NiuJiaLink({ concept, onNavigate }: { concept: string; onNavigate?: (layer: number, section: string) => void }) {
  if (!onNavigate) return null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '16px',
      padding: '10px 16px',
      background: '#ffebee',
      borderRadius: '8px',
      borderLeft: '3px solid var(--crimson)',
      cursor: 'pointer',
    }} onClick={() => onNavigate(3, 'map-section')}>
      <span style={{ fontSize: '14px' }}>🎭</span>
      <span style={{ fontSize: '13px', color: 'var(--crimson)', fontWeight: 600 }}>
        在牛家村中如何理解：{concept} →
      </span>
    </div>
  );
}

// ============================================================
// Layer 1 Main
// ============================================================
export default function Layer1({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--jade)', marginBottom: '8px' }}>Layer 1：底层机制</h1>
        <p style={{ color: 'var(--ink-mid)', fontSize: '16px' }}>
          从硅到智能的跃迁 —— 先理解"一台没有 Agent 的裸 Runtime 是怎么工作的"
        </p>
      </div>

      <div id="training-section"><TrainingSection onNavigate={onNavigate} /></div>
      <div id="decoding-section"><DecodingSection onNavigate={onNavigate} /></div>
      <div id="tick-section"><TickSection onNavigate={onNavigate} /></div>
      <div id="channel-section"><ChannelSection onNavigate={onNavigate} /></div>
      <div id="state-section"><StateSection onNavigate={onNavigate} /></div>
    </motion.div>
  );
}
