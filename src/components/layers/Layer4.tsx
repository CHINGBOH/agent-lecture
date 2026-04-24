import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Radio, Shield, Activity, BarChart3 } from 'lucide-react';
import MermaidChart from '../MermaidChart';
import FadeIn from '../animations/FadeIn';

const LAYER_COLOR = '#6a1b9a';

function DistributedSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Globe size={28} />
          分布式 Agent — 跨进程/跨机器
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          单机的 Agent OS 能跑多 Agent，但所有进程共享同一台机器的内存和 CPU。当需要跨机器协作时，
          需要 <strong>gRPC</strong>、<strong>Message Broker</strong>、<strong>Service Discovery</strong> 等分布式基础设施。
        </p>
      </FadeIn>

      <MermaidChart
        id="distributed"
        chart={`
flowchart TD
    subgraph machine1[机器 A - 洪七公中军帐]
        O1[Orchestrator]
        C1[Channel]
    end
    subgraph machine2[机器 B - 欧阳锋探路]
        A1[Security Scanner]
    end
    subgraph machine3[机器 C - 郭靖攻城]
        A2[Code Generator]
    end
    O1 -->|gRPC| A1
    O1 -->|gRPC| A2
    A1 -->|结果| O1
    A2 -->|结果| O1
        `}
      />
    </section>
  );
}

function ConsensusSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Radio size={28} />
          共识机制 — RAFT / Leader Election
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          多 Agent 对同一决策有分歧时怎么办？需要共识协议来达成一致。
          <strong>RAFT</strong> 是最常用的共识算法：选一个 Leader，Leader 做决策，Followers 复制。
        </p>
      </FadeIn>

      <MermaidChart
        id="consensus"
        chart={`
sequenceDiagram
    participant A as Agent A (候选人)
    participant B as Agent B (候选人)
    participant C as Agent C (候选人)
    Note over A,B,C: Term 1: 选举开始
    A->>B: 请求投票
    A->>C: 请求投票
    B->>A: 投票给 A
    C->>A: 投票给 A
    Note over A: 获得多数票 → 成为 Leader
    A->>B: Heartbeat
    A->>C: Heartbeat
    Note over A,B,C: Term 1: A 是 Leader
        `}
      />
    </section>
  );
}

function FaultToleranceSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Shield size={28} />
          容错与恢复 — 自愈系统
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          Agent 崩溃了怎么办？<strong>Heartbeat</strong> 检测 → <strong>Leader Election</strong> 重选 → <strong>Failover</strong> 接管。
          就像襄阳大战中一路军队被击溃，预备队立即顶上。
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {[
            { icon: '💓', title: 'Heartbeat', desc: '每 Tick 报告"我还活着"' },
            { icon: '🔄', title: 'Leader Election', desc: 'Leader 挂了马上重选' },
            { icon: '⏪', title: 'Failover', desc: '备胎 Agent 立即接管' },
            { icon: '📋', title: 'State Replication', desc: 'State 跨机器复制' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '16px', background: `${LAYER_COLOR}08`, borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: LAYER_COLOR, marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-mid)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function EventDrivenSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Activity size={28} />
          事件驱动架构 — Pub/Sub
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          不是 Agent 轮询查消息，而是订阅感兴趣的事件。事件总线（Event Bus）负责路由。
        </p>
      </FadeIn>

      <MermaidChart
        id="event-bus"
        chart={`
flowchart LR
    EB[Event Bus]
    subgraph producers[事件生产者]
        P1[代码变更]
        P2[用户操作]
        P3[定时器]
    end
    subgraph consumers[事件消费者]
        C1[Debugger<br/>订阅: error.*]
        C2[Quality Inspector<br/>订阅: pr.*]
        C3[Orchestrator<br/>订阅: deploy.*]
    end
    P1 --> EB
    P2 --> EB
    P3 --> EB
    EB --> C1
    EB --> C2
    EB --> C3
        `}
      />
    </section>
  );
}

function MonitoringSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <BarChart3 size={28} />
          监控与观测 — OpenTelemetry
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          <strong>Tracing</strong>：一个用户请求经过哪些 Agent？<strong>Metrics</strong>：每个 Tick 耗时多少？
          <strong>Logging</strong>：Agent 在执行什么？
        </p>
        <div style={{ padding: '16px', background: '#1e1e2e', borderRadius: '10px', fontFamily: 'monospace', fontSize: '13px', color: '#c9d1d9', lineHeight: 1.8 }}>
          <pre style={{ margin: 0 }}>
{`Span: /create
├─ Span: project-planner.plan     (245ms)
├─ Span: backend-specialist.api   (1.2s)
├─ Span: frontend-specialist.ui   (890ms)
└─ Span: quality-inspector.review (320ms)

Metrics:
  tick.duration.avg     = 150ms
  agent.memory.usage    = 256MB
  channel.queue.depth   = 3
  tool.call.latency.p99 = 2.1s`}
          </pre>
        </div>
      </FadeIn>
    </section>
  );
}

export default function Layer4({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: LAYER_COLOR, marginBottom: '8px' }}>
            Layer 4：🌐 多 Agent 编排（分布式层）
          </h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: '16px' }}>
            从单机操作系统到分布式系统 —— 跨机器 Agent 协作、共识、容错、事件驱动、观测
          </p>
        </div>
      </FadeIn>
      <DistributedSection />
      <ConsensusSection />
      <FaultToleranceSection />
      <EventDrivenSection />
      <MonitoringSection />
    </motion.div>
  );
}
