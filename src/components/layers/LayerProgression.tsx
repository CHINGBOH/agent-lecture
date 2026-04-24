import { motion } from 'framer-motion';
import { ChevronRight, ArrowDown, BookOpen, Code, Layers, Settings, Zap, Globe } from 'lucide-react';
import FadeIn from '../animations/FadeIn';

// ============================================================
// Layer Progression Component
// ============================================================
interface LayerInfo {
  id: number;
  name: string;
  emoji: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  prerequisites: string[];
  nextSteps: string[];
}

const layers: LayerInfo[] = [
  {
    id: 0,
    name: 'Layer 0',
    emoji: '🎭',
    title: '多故事线入口',
    description: '用金庸武侠、生活场景等比喻理解 Agent 全栈概念',
    icon: <BookOpen size={20} />,
    color: 'var(--crimson)',
    bgColor: '#ffebee',
    borderColor: 'var(--crimson)',
    prerequisites: [],
    nextSteps: ['理解基础概念', '选择技术方向'],
  },
  {
    id: 1,
    name: 'Layer 1',
    emoji: '🏗️',
    title: 'LLM 训练',
    description: '数据收集、预训练、SFT、RLHF 到模型评估的完整流程',
    icon: <Layers size={20} />,
    color: 'var(--jade)',
    bgColor: '#e8f5e9',
    borderColor: 'var(--jade)',
    prerequisites: ['Layer 0: 基础概念'],
    nextSteps: ['理解 Runtime 内核', '学习状态机'],
  },
  {
    id: 2,
    name: 'Layer 2',
    emoji: '⚙️',
    title: 'Runtime 内核',
    description: 'Tick 循环、JMP 状态跳转、State 快照等核心机制',
    icon: <Settings size={20} />,
    color: 'var(--gold)',
    bgColor: '#fff8e1',
    borderColor: 'var(--gold)',
    prerequisites: ['Layer 0: 基础概念', 'Layer 1: 训练流程'],
    nextSteps: ['构建 Agent 系统', '学习 Skill 系统'],
  },
  {
    id: 3,
    name: 'Layer 3',
    emoji: '🤖',
    title: 'Agent 操作系统',
    description: 'Orchestrator、Skill 系统、Rule 引擎、Channel 通信',
    icon: <Code size={20} />,
    color: 'var(--crimson-light)',
    bgColor: '#fce4ec',
    borderColor: 'var(--crimson-light)',
    prerequisites: ['Layer 2: Runtime 内核'],
    nextSteps: ['Multi-Agent 协同', '分布式系统'],
  },
  {
    id: 4,
    name: 'Layer 4',
    emoji: '🌐',
    title: 'Multi-Agent 协同',
    description: '多 Agent 协作、共识机制、资源锁、监控追踪',
    icon: <Globe size={20} />,
    color: 'var(--jade-dark)',
    bgColor: '#e0f2f1',
    borderColor: 'var(--jade-dark)',
    prerequisites: ['Layer 3: Agent 系统'],
    nextSteps: ['实战项目', '生产部署'],
  },
  {
    id: 5,
    name: 'Layer 5',
    emoji: '🚀',
    title: '实战与部署',
    description: 'MCP 协议、生产环境部署、性能优化、监控告警',
    icon: <Zap size={20} />,
    color: 'var(--gold)',
    bgColor: '#fff3e0',
    borderColor: 'var(--gold)',
    prerequisites: ['Layer 4: Multi-Agent'],
    nextSteps: ['持续学习', '社区贡献'],
  },
];

// ============================================================
// Layer Card Component
// ============================================================
function LayerCard({ 
  layer, 
  isActive, 
  onClick 
}: { 
  layer: LayerInfo; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: `2px solid ${isActive ? layer.borderColor : '#e0e0e0'}`,
        background: isActive ? layer.bgColor : '#fff',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: layer.color,
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: layer.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: layer.color,
        }}>
          {layer.icon}
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>{layer.name}</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: layer.color }}>{layer.title}</div>
        </div>
      </div>
      
      <p style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6, marginBottom: '12px' }}>
        {layer.description}
      </p>
      
      {layer.prerequisites.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 600 }}>前置要求</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {layer.prerequisites.map((prereq, i) => (
              <span key={i} style={{
                padding: '2px 8px',
                background: '#f0f0f0',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#666',
              }}>
                {prereq}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {layer.nextSteps.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 600 }}>下一步</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {layer.nextSteps.map((step, i) => (
              <span key={i} style={{
                padding: '2px 8px',
                background: layer.bgColor,
                borderRadius: '4px',
                fontSize: '10px',
                color: layer.color,
              }}>
                {step}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Layer Progression Flow Component
// ============================================================
export default function LayerProgression({ 
  activeLayer, 
  onNavigate 
}: { 
  activeLayer: number; 
  onNavigate: (layer: number) => void;
}) {
  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <Layers size={28} />
          学习路径：从比喻到实战
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '24px', lineHeight: 1.8 }}>
          Agent 全栈学习是一个循序渐进的过程。从 Layer 0 的故事比喻开始，逐步深入到技术实现和实战部署。
        </p>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {layers.map((layer, idx) => (
          <div key={layer.id}>
            <LayerCard 
              layer={layer} 
              isActive={activeLayer === layer.id} 
              onClick={() => onNavigate(layer.id)} 
            />
            {idx < layers.length - 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '8px 0',
                color: '#ccc',
              }}>
                <ArrowDown size={20} />
              </div>
            )}
          </div>
        ))}
      </div>

      <FadeIn>
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8f8f8',
          borderRadius: '10px',
          border: '1px solid #e0e0e0',
        }}>
          <h3 style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '8px', fontWeight: 700 }}>
            💡 学习建议
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--ink-mid)', fontSize: '13px', lineHeight: 1.8 }}>
            <li>从 Layer 0 开始，选择你喜欢的故事线建立直观理解</li>
            <li>每个 Layer 都有前置要求，确保打好基础再进阶</li>
            <li>Layer 1-2 是核心基础，建议花更多时间深入理解</li>
            <li>Layer 3-5 是实战应用，结合项目练习效果更佳</li>
          </ul>
        </div>
      </FadeIn>
    </section>
  );
}
