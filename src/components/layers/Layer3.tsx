import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Wrench, User, Workflow, RefreshCw, Route, Radio, GitBranch
} from 'lucide-react';
import { useConcepts, useCodeSnippets } from '../../hooks/useDb';
import MermaidChart from '../MermaidChart';
import FadeIn from '../animations/FadeIn';
import CodeBlock from '../CodeBlock';

const LAYER_COLOR = '#b8860b';

// ============================================================
// Architecture Pyramid
// ============================================================
function ArchitectureSection() {
  const [activeLevel, setActiveLevel] = useState(0);
  const levels = [
    {
      icon: Shield, label: 'Rule = 内核安全策略', color: '#8b2500',
      desc: '在 Runtime 的每个 Tick 前被加载到 State.Rules[]，Tick 执行时先做 ACL 检查。对应 GEMINI.md、auto-routing.md。',
      examples: ['GEMINI.md — 核心宪法', 'Auto-Routing.md — 智能路由', 'Watchdog — 安全与学习纪律'],
    },
    {
      icon: Wrench, label: 'Skill = 动态链接库 (.so)', color: '#b8860b',
      desc: '不是常驻内存，被 Orchestrator 在 Tick 中通过 dlopen 式加载注入 Context。按需加载，用完可卸载。',
      examples: ['frontend-dev-guidelines', 'api-patterns', 'database-design', 'testing-patterns'],
    },
    {
      icon: User, label: 'Agent = 进程 (Process)', color: '#4a8c5f',
      desc: '每个 Agent 是独立的 State 副本 + 独立 Tool Set。Orchestrator 通过 fork()（State Clone）创建 Specialist Agent。',
      examples: ['Orchestrator', 'Frontend Specialist', 'Backend Specialist', 'Debugger', 'Quality Inspector'],
    },
    {
      icon: Workflow, label: 'Workflow = 进程调度器', color: '#2c5282',
      desc: '本质是一串预编排的 JMP 地址：JMP plan → JMP create → JMP test → JMP deploy。每个地址对应一个 Agent 进程。',
      examples: ['/create — 全周期创建', '/plan — 战略规划', '/debug — 系统调试'],
    },
  ];

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Shield size={28} />
          Agent 操作系统架构（<em>四层金字塔</em>）
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          底层（Tick + JMP + Channel + State）本身只能跑单轮对话。<strong>Agent 系统是在底层之上搭建的操作系统</strong>。
        </p>
      </FadeIn>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        {levels.map((level, i) => {
          const Icon = level.icon;
          const width = 100 - i * 15;
          const isActive = activeLevel === i;
          return (
            <motion.button
              key={i}
              onClick={() => setActiveLevel(i)}
              whileHover={{ scale: 1.02 }}
              style={{
                width: `${width}%`, padding: '16px', borderRadius: '8px',
                border: `2px solid ${isActive ? level.color : '#e0e0e0'}`,
                background: isActive ? `${level.color}10` : '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                textAlign: 'left',
              }}
            >
              <Icon size={22} color={level.color} />
              <div>
                <div style={{ fontWeight: 700, color: level.color }}>{level.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-light)' }}>Level {i + 1}</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeLevel}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ padding: '20px', background: `${levels[activeLevel].color}08`, borderRadius: '10px', borderLeft: `4px solid ${levels[activeLevel].color}` }}
        >
          <p style={{ marginBottom: '12px', color: 'var(--ink-mid)' }}>{levels[activeLevel].desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {levels[activeLevel].examples.map((ex, j) => (
              <span key={j} className="tag" style={{ background: `${levels[activeLevel].color}15`, color: levels[activeLevel].color }}>
                {ex}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ============================================================
// PDCA Cycle
// ============================================================
function PDCASection() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { label: 'PLAN', agent: 'project-planner', desc: '设置 State.Goal，输出 PLAN-{slug}.md', color: '#4a7ab8' },
    { label: 'DO', agent: 'Worker Agents', desc: 'Tick 驱动执行：backend/frontend/engineer', color: '#4a8c5f' },
    { label: 'CHECK', agent: 'quality-inspector', desc: 'State 验证函数：独立审查、跑测试', color: '#b8860b' },
    { label: 'ACT', agent: 'orchestrator', desc: 'State.Checkpoint 提交 或 Rollback 回滚', color: '#8b2500' },
  ];

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <RefreshCw size={28} />
          PDCA 循环 — 质量管理闭环
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          PLAN（写 State.Goal）→ DO（Tick 驱动执行）→ CHECK（State 验证函数）→ ACT（Checkpoint 或 Rollback）。
          不是抽象术语，是 State 机的完整生命周期。
        </p>
      </FadeIn>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {steps.map((step, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveStep(i)}
            whileHover={{ scale: 1.05 }}
            style={{
              flex: 1, minWidth: '120px', padding: '16px', borderRadius: '10px',
              border: `2px solid ${activeStep === i ? step.color : '#e0e0e0'}`,
              background: activeStep === i ? step.color : '#fff',
              color: activeStep === i ? '#fff' : step.color,
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{step.label}</div>
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{step.agent}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: '16px', background: `${steps[activeStep].color}10`, borderRadius: '8px', borderLeft: `3px solid ${steps[activeStep].color}` }}
        >
          <strong style={{ color: steps[activeStep].color }}>{steps[activeStep].label}</strong>
          <span style={{ color: 'var(--ink-mid)', marginLeft: '8px' }}>— {steps[activeStep].desc}</span>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ============================================================
// Auto-Routing
// ============================================================
function RoutingSection() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<{ agent: string; reason: string } | null>(null);

  const routingTable = [
    { keywords: ['报错', 'bug', '崩溃', '404', '500', '日志'], agent: '@debugger', reason: '用户报告错误，需要根因分析' },
    { keywords: ['新功能', '怎么做', '实现', '开发', '加一个'], agent: '→ 识别技术域', reason: '需要进一步判断前端还是后端' },
    { keywords: ['计划', '拆解', '方案', 'PRD', '设计'], agent: '@project-planner', reason: '需要拆解新功能 Task' },
    { keywords: ['审查', '检查', 'review', '质量'], agent: '@quality-inspector', reason: '用户请求代码审查' },
    { keywords: ['多个服务', '整体方案', '统筹', 'PDCA'], agent: '@orchestrator', reason: '多 Agent 协作任务' },
    { keywords: ['React', '组件', '界面', '样式'], agent: '@frontend-specialist', reason: '任务涉及 React 组件' },
    { keywords: ['API', '数据库', 'Python', '路由'], agent: '@backend-specialist', reason: '任务涉及后端代码' },
  ];

  const handleRoute = () => {
    for (const entry of routingTable) {
      if (entry.keywords.some((k) => keyword.includes(k))) {
        setResult(entry);
        return;
      }
    }
    setResult({ agent: '@engineer', reason: '简单修改，通用处理' });
  };

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Route size={28} />
          Auto-Routing = 中断向量表
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          用户输入 → 关键词哈希 → 查中断向量表 → <strong>JMP</strong> 到对应 Agent 处理函数入口地址。
          这与底层 JMP 精确对应。
        </p>
      </FadeIn>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入用户请求，比如'前端报错了'"
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '8px',
            border: '1px solid #ddd', fontSize: '15px',
            fontFamily: "'Noto Serif SC', serif",
          }}
        />
        <button onClick={handleRoute} className="btn-gold" style={{ padding: '12px 24px' }}>路由</button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: '16px', background: '#fff8e1', borderRadius: '10px', border: '2px solid #b8860b', marginBottom: '20px' }}
          >
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '4px' }}>路由结果</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#b8860b' }}>🤖 {result.agent}</div>
            <div style={{ fontSize: '14px', color: 'var(--ink-mid)', marginTop: '4px' }}>{result.reason}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <MermaidChart
        id="routing-tree"
        chart={`
flowchart TD
    A[用户输入] --> B{关键词哈希}
    B -->|报错/bug| C[@debugger]
    B -->|React/组件| D[@frontend-specialist]
    B -->|API/数据库| E[@backend-specialist]
    B -->|审查/review| F[@quality-inspector]
    B -->|计划/PRD| G[@project-planner]
    B -->|多服务/PDCA| H[@orchestrator]
    B -->|其他| I[@engineer]
        `}
      />
    </section>
  );
}

// ============================================================
// Fork Section
// ============================================================
function ForkSection() {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <GitBranch size={28} />
          多 Agent Fork — 进程克隆
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          Orchestrator 不是自己去执行，而是 <strong>fork()</strong> 创建 Specialist Agent。
          每个 Agent 是独立的 State 副本 + 独立的 Tool Set，结果通过 Channel 汇总。
        </p>
      </FadeIn>

      <MermaidChart
        id="fork-diagram"
        chart={`
sequenceDiagram
    participant O as Orchestrator(洪七公)
    participant C as Channel(信鸽)
    participant B as backend (欧阳锋探路)
    participant F as frontend (黄蓉布阵)
    participant Q as quality (丘处机审查)
    O->>O: clone(State) → fork()
    O->>B: 分配 State 副本 + Backend Tools
    O->>F: 分配 State 副本 + Frontend Tools
    B->>C: 执行结果入队
    F->>C: 执行结果入队
    C->>O: 汇总结果
    O->>Q: 提交审查
    Q->>O: 通过 / 不通过回滚
        `}
      />
    </section>
  );
}

// ============================================================
// Layer 3 Concepts + Code Snippets
// ============================================================
function ConceptsSection() {
  const concepts = useConcepts(3);
  const [active, setActive] = useState(0);

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
          <Radio size={28} />
          Agent 操作系统概念一览
        </h2>
      </FadeIn>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {concepts.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActive(i)}
            style={{
              padding: '8px 14px', borderRadius: '6px', border: 'none',
              background: active === i ? LAYER_COLOR : '#f0f0f0',
              color: active === i ? '#fff' : 'var(--ink-mid)',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {concepts[active] && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '20px', background: `${LAYER_COLOR}06`, borderRadius: '10px', borderLeft: `4px solid ${LAYER_COLOR}` }}
        >
          <div style={{ fontSize: '12px', color: LAYER_COLOR, fontWeight: 700, marginBottom: '4px' }}>
            {concepts[active].category}
          </div>
          <h3 style={{ color: LAYER_COLOR, marginBottom: '8px' }}>{concepts[active].name}</h3>
          <p style={{ color: 'var(--ink-mid)', lineHeight: 1.7 }}>{concepts[active].detail}</p>
          {concepts[active].analogy && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#ffebee', borderRadius: '8px', fontSize: '13px', color: 'var(--crimson)' }}>
              🎭 {concepts[active].analogy}
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}

// ============================================================
// Layer 3 Main
// ============================================================
export default function Layer3({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const snippets = useCodeSnippets(3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: LAYER_COLOR, marginBottom: '8px' }}>
            Layer 3：🏛️ Agent 操作系统
          </h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: '16px' }}>
            在裸 Runtime 之上构建"可调度的操作系统"—— Rule 是内核策略，Skill 是动态库，Agent 是进程，Workflow 是调度器。
          </p>
        </div>
      </FadeIn>

      <ArchitectureSection />
      <PDCASection />
      <RoutingSection />
      <ForkSection />
      <ConceptsSection />

      {snippets.length > 0 && (
        <section className="card" style={{ marginBottom: '32px' }}>
          <FadeIn>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: LAYER_COLOR, marginBottom: '16px' }}>
              <Wrench size={28} />
              代码示例
            </h2>
          </FadeIn>
          {snippets.map((s) => (
            <CodeBlock key={s.id} code={s.code} language={s.language} title={s.title} />
          ))}
        </section>
      )}
    </motion.div>
  );
}
