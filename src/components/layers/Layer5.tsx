import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Cpu, Beaker, Play, RotateCcw, Terminal, Copy, Check, FileJson, Shield } from 'lucide-react';
import MermaidChart from '../MermaidChart';
import FadeIn from '../animations/FadeIn';

const LAYER_COLOR = '#e65100';

// ============================================================
// 交互式 Playground
// ============================================================
function ToolCallPlayground() {
  const [input, setInput] = useState('查一下北京的天气');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const simulateTick = () => {
    setLoading(true);
    setOutput('');

    const steps = [
      { delay: 300, text: '// === Tick 1: IDLE ===' },
      { delay: 600, text: '// 用户输入: "' + input + '"' },
      { delay: 900, text: '// === Tick 2: GENERATE ===' },
      { delay: 1200, text: '// JMP to GENERATE_ENTRY' },
      { delay: 1500, text: '// ACL Check: 通过 ✓' },
      { delay: 1800, text: '// LLM 生成中...' },
      { delay: 2100, text: '// → 检测到 tool_call' },
      { delay: 2400, text: '{' },
      { delay: 2500, text: '  "name": "getWeather",' },
      { delay: 2600, text: '  "arguments": {' },
      { delay: 2700, text: '    "city": "' + (input.includes('北京') ? '北京' : input.includes('上海') ? '上海' : '未知') + '"' },
      { delay: 2800, text: '  }' },
      { delay: 2900, text: '}' },
      { delay: 3100, text: '' },
      { delay: 3200, text: '// === Tick 3: TOOL ===' },
      { delay: 3500, text: '// JMP to TOOL_HANDLER' },
      { delay: 3800, text: '// Execute: getWeather({"city": "' + (input.includes('北京') ? '北京' : input.includes('上海') ? '上海' : '未知') + '"})' },
      { delay: 4100, text: '// Tool 返回: {"temp": 25, "condition": "晴", "humidity": 40}' },
      { delay: 4400, text: '' },
      { delay: 4500, text: '// === Tick 4: GENERATE ===' },
      { delay: 4800, text: '// JMP to GENERATE_ENTRY (with tool result)' },
      { delay: 5100, text: '// LLM 生成最终回复...' },
      { delay: 5400, text: '// "北京今天晴，25°C，湿度40%"' },
      { delay: 5700, text: '' },
      { delay: 5800, text: '// === Tick 5: IDLE ===' },
      { delay: 5900, text: '// JMP to IDLE_ENTRY' },
      { delay: 6000, text: '// 等待用户下一轮输入...' },
    ];

    steps.forEach(({ delay, text }) => {
      setTimeout(() => {
        setOutput((prev) => prev + text + '\n');
        if (delay === steps[steps.length - 1].delay) {
          setLoading(false);
        }
      }, delay);
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: LAYER_COLOR, marginBottom: '16px', fontSize: '18px' }}>
        <Beaker size={22} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Tool Call Playground
      </h3>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '16px', fontSize: '14px' }}>
        输入一个请求，观察 Tool Call 在 Runtime 中的完整生命周期 —— 从 IDLE 到 GENERATE 到 TOOL 再回到 IDLE。
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的请求..."
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '8px',
            border: '1px solid #ddd', fontSize: '15px',
            fontFamily: "'Noto Serif SC', serif",
          }}
        />
        <button
          onClick={simulateTick}
          disabled={loading}
          style={{
            padding: '12px 24px', borderRadius: '8px', border: 'none',
            background: loading ? '#ccc' : LAYER_COLOR, color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '14px',
          }}
        >
          {loading ? <RotateCcw size={16} className="animate-spin" /> : <Play size={16} />}
          {loading ? '模拟中...' : '运行'}
        </button>
      </div>

      {output && (
        <div style={{ position: 'relative' }}>
          <div style={{
            padding: '16px', background: '#1e1e2e', borderRadius: '10px',
            fontFamily: 'monospace', fontSize: '13px', color: '#c9d1d9',
            lineHeight: 1.8, maxHeight: '400px', overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
            {output}
          </div>
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute', top: '8px', right: '8px',
              padding: '6px 10px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px',
              color: '#aaa', cursor: 'pointer', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MCP 协议
// ============================================================
function MCPSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Wrench size={28} />
          MCP 协议 — Model Context Protocol
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          MCP 是 Anthropic 提出的开放协议，定义了 LLM 如何发现和调用外部工具。
          类似 Agent 的 Tool Schema + Function Calling，但标准化为统一的 JSON-RPC 协议。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: `${LAYER_COLOR}06`, borderRadius: '10px' }}>
            <h4 style={{ color: LAYER_COLOR, marginBottom: '8px' }}>📋 MCP 消息格式</h4>
            <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-mid)', lineHeight: 2 }}>
              tools/list → 返回工具列表<br/>
              tools/call → 调用指定工具<br/>
              resources/read → 读取外部资源<br/>
              prompts/get → 获取提示模板
            </div>
          </div>
          <div style={{ padding: '16px', background: `${LAYER_COLOR}06`, borderRadius: '10px' }}>
            <h4 style={{ color: LAYER_COLOR, marginBottom: '8px' }}>🔌 和 Agent 的关系</h4>
            <div className="mono" style={{ fontSize: '12px', color: 'var(--ink-mid)', lineHeight: 2 }}>
              MCP Server = 工具提供方<br/>
              MCP Client = Agent/Runtime<br/>
              Transport = stdio / SSE<br/>
              每个 Tool 暴露为 Resource
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ============================================================
// Sandbox
// ============================================================
function SandboxSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Shield size={28} />
          Sandbox 沙箱 — 安全执行环境
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          Agent 执行代码需要沙箱隔离，防止恶意代码影响主机系统。
          常用的沙箱方案：<strong>Docker</strong>、<strong>gVisor</strong>、<strong>Firecracker</strong>、<strong>WebAssembly</strong>。
        </p>
        <MermaidChart
          id="sandbox"
          chart={`
flowchart LR
    subgraph host[宿主机]
        O[Orchestrator]
    end
    subgraph sandbox1[沙箱 1 - Docker]
        A1[Code Agent]
        T1[Tool Set]
    end
    subgraph sandbox2[沙箱 2 - Docker]
        A2[Browser Agent]
        T2[Playwright]
    end
    O -->|REST/gRPC| sandbox1
    O -->|REST/gRPC| sandbox2
    sandbox1 -.->|只读| host
    sandbox2 -.->|只读| host
        `}
        />
      </FadeIn>
    </section>
  );
}

// ============================================================
// Eval
// ============================================================
function EvalSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Terminal size={28} />
          测试与评估 — Eval 方法论
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          怎么衡量 Agent 的好坏？<strong>Eval</strong> 是关键。好的 Eval 需要：
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { icon: '🎯', title: '任务完成率', desc: 'Agent 成功完成任务的比例' },
            { icon: '⏱️', title: '执行时间', desc: '从输入到输出的总耗时' },
            { icon: '🔄', title: '重试次数', desc: '失败后重试才成功的比例' },
            { icon: '🔒', title: '安全违规', desc: '是否有越权/危险操作' },
            { icon: '🗣️', title: '用户满意度', desc: '用户对结果的评分' },
            { icon: '📊', title: 'Token 效率', desc: '完成任务用了多少 token' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '16px', background: `${LAYER_COLOR}06`, borderRadius: '10px',
              border: '1px solid #e0e0e0',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: LAYER_COLOR, marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-mid)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

// ============================================================
// Layer 5 Main
// ============================================================
export default function Layer5({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: LAYER_COLOR, marginBottom: '8px' }}>
            Layer 5：🛠️ 实战工具箱
          </h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: '16px' }}>
            MCP 协议 · Sandbox 沙箱 · Eval 评估 · Playground 实验区
          </p>
        </div>
      </FadeIn>

      <section className="card" style={{ marginBottom: '32px' }}>
        <FadeIn>
          <ToolCallPlayground />
        </FadeIn>
      </section>

      <MCPSection />
      <SandboxSection />
      <EvalSection />
    </motion.div>
  );
}
