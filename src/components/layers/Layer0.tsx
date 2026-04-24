import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, User, BookOpen, ArrowRightLeft } from 'lucide-react';
import { useCharacters, useScenes, useMappings } from '../../hooks/useDb';
import MermaidChart from '../MermaidChart';
import FadeIn from '../animations/FadeIn';

// ============================================================
// Section 1: Scene Selector
// ============================================================
function SceneSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const scenes = useScenes();
  const [selected, setSelected] = useState<string>('');

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <MapPin size={28} />
          牛家村场景选择
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          每个场景对应 Agent 系统的一个侧面。点击场景进入剧情，点击 🎯 跳转技术实现。
        </p>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {scenes.map((scene, idx) => {
          const isActive = selected === scene.name;
          return (
            <motion.button
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelected(isActive ? '' : scene.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${isActive ? 'var(--crimson)' : '#e0e0e0'}`,
                background: isActive ? '#ffebee' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--crimson-light)', fontWeight: 700, marginBottom: '4px' }}>
                {scene.subtitle}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{scene.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6 }}>{scene.description}</div>
            </motion.button>
          );
        })}
      </div>

      {selected && scenes.find(s => s.name === selected) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '20px', padding: '20px', background: '#fff8f0', borderRadius: '10px', border: '1px solid #d4a843' }}
        >
          <h4 style={{ color: 'var(--crimson)', marginBottom: '12px' }}>📖 剧情事件</h4>
          {(() => {
            const scene = scenes.find(s => s.name === selected);
            if (!scene?.events) return null;
            const events = JSON.parse(scene.events);
            return events.map((evt: string, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', background: i % 2 === 0 ? '#f8f8f8' : '#fff',
                borderRadius: '6px', marginBottom: '6px', fontSize: '14px',
              }}>
                <span style={{ color: 'var(--crimson)', fontWeight: 700, minWidth: '20px' }}>{i + 1}.</span>
                <span>{evt}</span>
              </div>
            ));
          })()}
        </motion.div>
      )}
    </section>
  );
}

// ============================================================
// Section 2: Character Cards
// ============================================================
function CharacterSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const characters = useCharacters();
  const [activeChar, setActiveChar] = useState(0);

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <User size={28} />
          江湖人物志（点击看技术对应）
        </h2>
      </FadeIn>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {characters.map((char, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveChar(i)}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              border: `2px solid ${activeChar === i ? 'var(--crimson)' : '#e0e0e0'}`,
              background: activeChar === i ? '#ffebee' : '#fff',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: '120px',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '6px' }}>{char.avatar_emoji}</div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{char.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--crimson-light)', marginTop: '2px' }}>{char.title}</div>
          </motion.button>
        ))}
      </div>

      {characters[activeChar] && (
        <motion.div
          key={activeChar}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '24px', background: '#fff8f0', borderRadius: '12px',
            border: '2px solid #d4a843',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <span style={{ fontSize: '48px' }}>{characters[activeChar].avatar_emoji}</span>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{characters[activeChar].name}</div>
              <div style={{ color: 'var(--crimson)', fontWeight: 600 }}>{characters[activeChar].title}</div>
            </div>
          </div>
          <p style={{ color: 'var(--ink-mid)', lineHeight: 1.8, marginBottom: '16px' }}>
            {characters[activeChar].description}
          </p>
          {characters[activeChar].skills && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {characters[activeChar].skills.split(',').map((skill: string, j: number) => (
                <span key={j} className="tag tag-gold">{skill.trim()}</span>
              ))}
            </div>
          )}
          {characters[activeChar].tech_link && onNavigate && (
            <div
              onClick={() => onNavigate(characters[activeChar].layer_link ?? 1, characters[activeChar].tech_link!)}
              style={{
                padding: '12px', background: '#e8f5e9', borderRadius: '8px',
                fontSize: '13px', color: '#2d5a3d', cursor: 'pointer',
                borderLeft: '3px solid #2d5a3d',
              }}
            >
              <BookOpen size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              <strong>跳转技术实现</strong>：Layer {characters[activeChar].layer_link}「{characters[activeChar].tech_link}」→
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}

// ============================================================
// Section 3: Story Workflow
// ============================================================
function StorySection() {
  const steps = [
    { jianghu: '洪七公召开军事会议，制定攻城计划', tech: 'PLAN: project-planner 输出 PLAN-{slug}.md', phase: 'PLAN', agent: 'project-planner', color: '#4a7ab8' },
    { jianghu: '欧阳锋潜入敌营探路，绘制地图', tech: 'RECON: browser-subagent 扫描', phase: 'RECON', agent: 'browser-subagent', color: '#6a1b9a' },
    { jianghu: '黄蓉布下奇门遁甲阵（前端界面）', tech: 'DO: frontend-specialist 实现 React 组件', phase: 'DO', agent: 'frontend-specialist', color: '#4a8c5f' },
    { jianghu: '郭靖率大军正面攻城（后端逻辑）', tech: 'DO: backend-specialist 实现 API + DB', phase: 'DO', agent: 'backend-specialist', color: '#4a8c5f' },
    { jianghu: '丘处机验收战果，检查有无叛徒', tech: 'CHECK: quality-inspector 跑测试 + 审查', phase: 'CHECK', agent: 'quality-inspector', color: '#b8860b' },
    { jianghu: '洪七公总结调整，准备下一战', tech: 'ACT: orchestrator 优化 / 批准上线', phase: 'ACT', agent: 'orchestrator', color: '#8b2500' },
  ];

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <BookOpen size={28} />
          剧情回放：/create = 蒙古军营攻略
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          把 Agent 的 <code>/create</code> workflow 映射为一场完整的江湖战役。
        </p>
      </FadeIn>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
            padding: '14px 16px', borderRadius: '10px',
            background: i % 2 === 0 ? '#f8f8f8' : '#fff',
            borderLeft: `4px solid ${step.color}`,
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>🎭 江湖剧情</div>
              <div style={{ color: 'var(--ink-mid)', fontSize: '14px' }}>{step.jianghu}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>⚙️ 技术实现</div>
              <div style={{ color: 'var(--ink-mid)', fontSize: '14px' }}>{step.tech}</div>
            </div>
          </div>
        ))}
      </div>

      <MermaidChart
        id="create-story"
        chart={`
flowchart LR
    subgraph story[🎭 江湖剧情]
        A1[洪七公定计] --> A2[欧阳锋探路]
        A2 --> A3[黄蓉布阵]
        A3 --> A4[郭靖攻城]
        A4 --> A5[丘处机验功]
        A5 --> A6[洪七公总结]
    end
    subgraph tech[⚙️ 技术实现]
        B1[/plan] --> B2[browser-subagent]
        B2 --> B3[frontend-specialist]
        B3 --> B4[backend-specialist]
        B4 --> B5[quality-inspector]
        B5 --> B6[orchestrator]
    end
    A1 -.-> B1
    A2 -.-> B2
    A3 -.-> B3
    A4 -.-> B4
    A5 -.-> B5
    A6 -.-> B6
        `}
      />
    </section>
  );
}

// ============================================================
// Section 4: Full Mapping Table
// ============================================================
function MappingTable() {
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3>('all');
  const allMappings = useMappings();

  const filtered = filter === 'all' ? allMappings : allMappings.filter((m) => m.layer === filter);

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <ArrowRightLeft size={28} />
          技术 ↔ 江湖 完整映射表
        </h2>
      </FadeIn>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['all', 1, 2, 3] as const).map((f) => (
          <button
            key={String(f)}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: filter === f ? 'none' : '1px solid #ddd',
              background: filter === f ? 'var(--jade)' : '#fff',
              color: filter === f ? '#fff' : 'var(--ink-mid)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {f === 'all' ? '全部' : f === 1 ? 'Layer 1 LLM' : f === 2 ? 'Layer 2 内核' : 'Layer 3 Agent'}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f5f0e6' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>技术概念</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>江湖映射</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>为什么这样比喻</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px', fontWeight: 600, color: m.layer === 2 ? 'var(--jade)' : m.layer === 3 ? 'var(--gold)' : 'var(--crimson)' }}>
                  {m.tech_concept}
                </td>
                <td style={{ padding: '10px' }}>{m.jianghu_role}</td>
                <td style={{ padding: '10px', color: 'var(--ink-mid)', fontSize: '12px' }}>{m.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ============================================================
// Layer 0 Main
// ============================================================
export default function Layer0({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: 'var(--crimson)', marginBottom: '8px' }}>
            Layer 0：🐂 牛家村江湖
          </h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: '16px' }}>
            用《射雕英雄传》的故事理解 Agent 全栈 —— 每个比喻都能点回技术实现
          </p>
          <div style={{
            marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: 'rgba(139, 37, 0, 0.1)', borderRadius: '24px',
            color: 'var(--crimson)', fontSize: '14px',
          }}>
            🎯 推荐：从这层开始 → 理解故事 → 跳转技术层
          </div>
        </div>
      </FadeIn>

      <SceneSection onNavigate={onNavigate} />
      <CharacterSection onNavigate={onNavigate} />
      <StorySection />
      <MappingTable />
    </motion.div>
  );
}
