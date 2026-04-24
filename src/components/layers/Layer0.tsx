import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, BookOpen, Swords } from 'lucide-react';
import { useCharacters, useScenes, useMappings } from '../../hooks/useDb';
import { 
  storyLines, 
  shediaoMappings, 
  yitianMappings, 
  xiaooMappings, 
  restaurantMappings, 
  companyMappings 
} from '../../data/multiStoryData';
import FadeIn from '../animations/FadeIn';

// ============================================================
// Section 1: Story Line Selector
// ============================================================
function StoryLineSelector({ 
  activeLine, 
  onSelect 
}: { 
  activeLine: string; 
  onSelect: (id: string) => void;
}) {
  const wuxiaLines = storyLines.filter(s => s.category === 'wuxia');
  const lifeLines = storyLines.filter(s => s.category === 'life');

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <Swords size={28} />
          选择你的学习故事线
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px' }}>
          不同的故事，相同的技术内核。选择你喜欢的比喻方式，理解 Agent 全栈。
        </p>
      </FadeIn>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--crimson-light)', marginBottom: '12px', fontWeight: 700 }}>
          🗡️ 金庸武侠系列
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {wuxiaLines.map((line, idx) => {
            const isActive = activeLine === line.id;
            return (
              <motion.button
                key={line.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSelect(line.id)}
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
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{line.emoji}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{line.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6 }}>{line.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: 'var(--jade)', marginBottom: '12px', fontWeight: 700 }}>
          🏠 生活场景类比
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {lifeLines.map((line, idx) => {
            const isActive = activeLine === line.id;
            return (
              <motion.button
                key={line.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx + wuxiaLines.length) * 0.1 }}
                onClick={() => onSelect(line.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${isActive ? 'var(--jade)' : '#e0e0e0'}`,
                  background: isActive ? '#e8f5e9' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{line.emoji}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{line.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6 }}>{line.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Section 2: Story Content Display
// ============================================================
function StoryContent({ storyId }: { storyId: string }) {
  const renderShediao = () => (
    <div>
      <h3 style={{ fontSize: '20px', color: 'var(--crimson)', marginBottom: '16px' }}>
        🏹 射雕英雄传：郭靖的成长史
      </h3>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '24px', lineHeight: 1.8 }}>
        郭靖从一个懵懂的草原少年，成长为一代大侠。这个过程就像 LLM 从数据到模型的完整训练流程。
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {shediaoMappings.map((m, i) => (
          <div key={i} style={{
            padding: '16px',
            background: i % 2 === 0 ? '#f8f8f8' : '#fff',
            borderRadius: '10px',
            borderLeft: `4px solid ${m.layer === 1 ? 'var(--crimson)' : m.layer === 2 ? 'var(--jade)' : 'var(--gold)'}`,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>⚙️ 技术概念</div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{m.techConcept}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>🎭 武侠比喻</div>
                <div style={{ fontWeight: 600, color: 'var(--crimson)' }}>{m.wuxiaRole}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-mid)', marginTop: '4px' }}>{m.why}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderYitian = () => (
    <div>
      <h3 style={{ fontSize: '20px', color: 'var(--jade)', marginBottom: '16px' }}>
        ⚔️ 倚天屠龙记：张无忌学九阳神功
      </h3>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '24px', lineHeight: 1.8 }}>
        九阳神功是内功根基，练好后学什么都快。就像 Transformer 架构是所有 LLM 的基础。
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {yitianMappings.map((m, i) => (
          <div key={i} style={{
            padding: '16px',
            background: i % 2 === 0 ? '#f8f8f8' : '#fff',
            borderRadius: '10px',
            borderLeft: `4px solid ${m.layer === 1 ? 'var(--jade)' : m.layer === 2 ? 'var(--gold)' : 'var(--crimson)'}`,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>⚙️ 技术概念</div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{m.techConcept}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>🎭 武侠比喻</div>
                <div style={{ fontWeight: 600, color: 'var(--jade)' }}>{m.wuxiaRole}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-mid)', marginTop: '4px' }}>{m.why}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderXiaoo = () => (
    <div>
      <h3 style={{ fontSize: '20px', color: 'var(--gold)', marginBottom: '16px' }}>
        🎸 笑傲江湖：令狐冲学独孤九剑
      </h3>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '24px', lineHeight: 1.8 }}>
        独孤九剑每招都是独立的 skill，按需调用。就像 Agent 的 Skill 系统和 Auto-Routing。
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {xiaooMappings.map((m, i) => (
          <div key={i} style={{
            padding: '16px',
            background: i % 2 === 0 ? '#f8f8f8' : '#fff',
            borderRadius: '10px',
            borderLeft: `4px solid ${m.layer === 3 ? 'var(--gold)' : m.layer === 4 ? 'var(--crimson)' : 'var(--jade)'}`,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>⚙️ 技术概念</div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{m.techConcept}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>🎭 武侠比喻</div>
                <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{m.wuxiaRole}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-mid)', marginTop: '4px' }}>{m.why}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRestaurant = () => (
    <div>
      <h3 style={{ fontSize: '20px', color: 'var(--jade)', marginBottom: '16px' }}>
        🍽️ 餐厅运营：从点单到上菜
      </h3>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '24px', lineHeight: 1.8 }}>
        餐厅的日常运营就是一个完整的 Agent 系统：领班路由请求、厨师专精不同菜系、菜谱按需加载。
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {restaurantMappings.map((m, i) => (
          <div key={i} style={{
            padding: '16px',
            background: i % 2 === 0 ? '#f8f8f8' : '#fff',
            borderRadius: '10px',
            borderLeft: `4px solid ${m.layer === 2 ? 'var(--jade)' : 'var(--gold)'}`,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>⚙️ 技术概念</div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{m.techConcept}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>🍽️ 餐厅比喻</div>
                <div style={{ fontWeight: 600, color: 'var(--jade)' }}>{m.restaurantRole}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-mid)', marginTop: '4px' }}>{m.why}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompany = () => (
    <div>
      <h3 style={{ fontSize: '20px', color: 'var(--gold)', marginBottom: '16px' }}>
        🏢 公司运营：从CEO到员工
      </h3>
      <p style={{ color: 'var(--ink-mid)', marginBottom: '24px', lineHeight: 1.8 }}>
        公司的组织架构就是 Multi-Agent 系统：CEO调度、部门经理独立工作、员工具体执行。
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {companyMappings.map((m, i) => (
          <div key={i} style={{
            padding: '16px',
            background: i % 2 === 0 ? '#f8f8f8' : '#fff',
            borderRadius: '10px',
            borderLeft: `4px solid ${m.layer === 3 ? 'var(--gold)' : m.layer === 4 ? 'var(--crimson)' : 'var(--jade)'}`,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>⚙️ 技术概念</div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{m.techConcept}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>🏢 公司比喻</div>
                <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{m.companyRole}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-mid)', marginTop: '4px' }}>{m.why}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (storyId) {
    case 'shediao':
      return renderShediao();
    case 'yitian':
      return renderYitian();
    case 'xiaoo':
      return renderXiaoo();
    case 'restaurant':
      return renderRestaurant();
    case 'company':
      return renderCompany();
    default:
      return null;
  }
}

// ============================================================
// Section 3: Original Scene Section (保留原有功能)
// ============================================================
function SceneSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const scenes = useScenes();
  const [selected, setSelected] = useState<string>('');

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <MapPin size={28} />
          牛家村场景选择（经典版）
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
// Section 4: Original Character Section (保留原有功能)
// ============================================================
function CharacterSection({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const characters = useCharacters();
  const [activeChar, setActiveChar] = useState(0);

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <User size={28} />
          江湖人物志（经典版）
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
// Layer 0 Main
// ============================================================
export default function Layer0({ onNavigate }: { onNavigate?: (layer: number, section: string) => void }) {
  const [activeStory, setActiveStory] = useState<string>('shediao');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: 'var(--crimson)', marginBottom: '8px' }}>
            Layer 0：🎭 多故事线入口
          </h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: '16px' }}>
            用不同的故事理解 Agent 全栈 —— 金庸武侠、生活场景，总有一种适合你
          </p>
          <div style={{
            marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: 'rgba(139, 37, 0, 0.1)', borderRadius: '24px',
            color: 'var(--crimson)', fontSize: '14px',
          }}>
            🎯 推荐：选择喜欢的故事线 → 理解比喻 → 跳转技术层
          </div>
        </div>
      </FadeIn>

      <StoryLineSelector activeLine={activeStory} onSelect={setActiveStory} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <section className="card" style={{ marginBottom: '32px' }}>
            <StoryContent storyId={activeStory} />
          </section>
        </motion.div>
      </AnimatePresence>

      <SceneSection onNavigate={onNavigate} />
      <CharacterSection onNavigate={onNavigate} />
    </motion.div>
  );
}
