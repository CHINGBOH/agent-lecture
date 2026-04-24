import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, BookOpen, ArrowRightLeft, Copy, Check } from 'lucide-react';
import FadeIn from '../animations/FadeIn';

// ============================================================
// Code Comparison Data
// ============================================================
interface CodeComparison {
  id: string;
  title: string;
  concept: string;
  analogy: string;
  analogyCode: string;
  techCode: string;
  explanation: string;
  layer: number;
}

const codeComparisons: CodeComparison[] = [
  {
    id: 'orchestrator',
    title: 'Orchestrator 调度',
    concept: 'Orchestrator 路由请求到对应 Agent',
    analogy: '餐厅领班接待客人，分派给对应厨师',
    analogyCode: `// 餐厅领班的工作流程
function restaurantHost(guestRequest) {
  const need = analyzeNeed(guestRequest);
  
  if (need === 'chinese') {
    dispatchToChef('chineseChef');
  } else if (need === 'western') {
    dispatchToChef('westernChef');
  } else if (need === 'dessert') {
    dispatchToChef('dessertChef');
  }
  
  return 'Order dispatched';
}`,
    techCode: `// Agent Orchestrator 实现
async function orchestrator(userRequest: Request) {
  const intent = await classifyIntent(userRequest);
  
  switch (intent) {
    case 'code_generation':
      return await forkAgent('codeAgent', userRequest);
    case 'data_analysis':
      return await forkAgent('dataAgent', userRequest);
    case 'web_search':
      return await forkAgent('searchAgent', userRequest);
    default:
      return await forkAgent('generalAgent', userRequest);
  }
}`,
    explanation: '领班和 Orchestrator 的核心逻辑相同：理解需求 → 分类 → 路由到对应的专业处理者',
    layer: 3,
  },
  {
    id: 'skill_system',
    title: 'Skill 系统',
    concept: 'Agent 按需加载 Skill',
    analogy: '厨师从书架上拿菜谱，按菜谱做菜',
    analogyCode: `// 厨师使用菜谱
function chefCookDish(dishName) {
  const recipe = loadRecipe(dishName);
  
  // 按菜谱步骤执行
  for (const step of recipe.steps) {
    executeStep(step);
  }
  
  return serveDish(dishName);
}

function loadRecipe(dishName) {
  // 从书架动态获取菜谱
  return require(\`./recipes/\${dishName}.json\`);
}`,
    techCode: `// Agent Skill 系统
async function executeSkill(skillName: string, context: Context) {
  // 动态加载 skill
  const skill = await import(\`./skills/\${skillName}.ts\`);
  
  // 验证前置条件
  if (skill.prerequisites) {
    await checkPrerequisites(skill.prerequisites, context);
  }
  
  // 执行 skill
  const result = await skill.execute(context);
  
  // 更新状态
  context.state.lastSkill = skillName;
  return result;
}`,
    explanation: '菜谱和 Skill 都是可复用的操作模板，按需加载、按步骤执行',
    layer: 3,
  },
  {
    id: 'state_snapshot',
    title: 'State 快照',
    concept: '保存和恢复 Agent 状态',
    analogy: '高手记住当前战局的所有细节，随时可以复盘',
    analogyCode: `// 武侠高手的战局记忆
class MartialArtist {
  constructor() {
    this.battleState = {
      position: { x: 0, y: 0 },
      energy: 100,
      opponentMoves: [],
      myMoves: [],
      environment: {}
    };
  }
  
  saveSnapshot() {
    return JSON.parse(JSON.stringify(this.battleState));
  }
  
  restoreSnapshot(snapshot) {
    this.battleState = snapshot;
  }
}`,
    techCode: `// Agent State 快照
class AgentState {
  private state: AgentStateData;
  
  createSnapshot(): Snapshot {
    return {
      timestamp: Date.now(),
      context: this.state.context,
      memory: this.state.memory,
      skills: this.state.activeSkills,
      resources: this.state.resources,
    };
  }
  
  restoreSnapshot(snapshot: Snapshot): void {
    this.state = {
      context: snapshot.context,
      memory: snapshot.memory,
      activeSkills: snapshot.skills,
      resources: snapshot.resources,
    };
  }
}`,
    explanation: '高手的战局记忆和 Agent 的 State 快照都是为了在需要时恢复到之前的状态',
    layer: 2,
  },
  {
    id: 'rule_engine',
    title: 'Rule 引擎',
    concept: '检查操作是否合规',
    analogy: '做菜前检查食品安全规范',
    analogyCode: `// 厨房安全检查
function beforeCook(ingredients) {
  const rules = [
    checkFreshness(ingredients),
    checkHygiene(),
    checkAllergens(ingredients),
    checkExpiration(ingredients),
  ];
  
  const violations = rules.filter(r => !r.passed);
  
  if (violations.length > 0) {
    throw new Error(\`Cooking blocked: \${violations.map(v => v.reason)}\`);
  }
  
  return true;
}`,
    techCode: `// Agent Rule Engine
async function validateAction(action: Action, context: Context) {
  const rules = [
    checkPermissions(action, context),
    checkResourceLimits(action, context),
    checkSafetyConstraints(action, context),
    checkEthicalGuidelines(action, context),
  ];
  
  const results = await Promise.all(rules);
  const violations = results.filter(r => !r.allowed);
  
  if (violations.length > 0) {
    throw new RuleViolationError(
      \`Action blocked: \${violations.map(v => v.reason).join(', ')}\`
    );
  }
  
  return true;
}`,
    explanation: '食品安全规范和 Rule Engine 都是前置检查，确保操作安全合规',
    layer: 3,
  },
];

// ============================================================
// Code Comparison Card Component
// ============================================================
function CodeComparisonCard({ comparison }: { comparison: CodeComparison }) {
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '24px',
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        marginBottom: '24px',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '20px', color: 'var(--crimson)', marginBottom: '8px' }}>
          {comparison.title}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--ink-mid)', marginBottom: '4px' }}>
          <strong>技术概念</strong>：{comparison.concept}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--jade)' }}>
          <strong>生活类比</strong>：{comparison.analogy}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setShowAnalogy(false)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: `1px solid ${!showAnalogy ? 'var(--crimson)' : '#e0e0e0'}`,
            background: !showAnalogy ? '#ffebee' : '#fff',
            color: !showAnalogy ? 'var(--crimson)' : 'var(--ink-mid)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Code size={14} /> 技术代码
        </button>
        <button
          onClick={() => setShowAnalogy(true)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: `1px solid ${showAnalogy ? 'var(--jade)' : '#e0e0e0'}`,
            background: showAnalogy ? '#e8f5e9' : '#fff',
            color: showAnalogy ? 'var(--jade)' : 'var(--ink-mid)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <BookOpen size={14} /> 类比代码
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <pre style={{
          padding: '16px',
          background: '#f8f8f8',
          borderRadius: '8px',
          overflowX: 'auto',
          fontSize: '13px',
          lineHeight: 1.6,
          border: '1px solid #e0e0e0',
        }}>
          <code>{showAnalogy ? comparison.analogyCode : comparison.techCode}</code>
        </pre>
        <button
          onClick={() => handleCopy(
            showAnalogy ? comparison.analogyCode : comparison.techCode,
            showAnalogy ? 'analogy' : 'tech'
          )}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {copied === (showAnalogy ? 'analogy' : 'tech') ? (
            <>
              <Check size={12} /> 已复制
            </>
          ) : (
            <>
              <Copy size={12} /> 复制
            </>
          )}
        </button>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#f0f8ff',
        borderRadius: '8px',
        borderLeft: '3px solid #4a90e2',
      }}>
        <p style={{ fontSize: '13px', color: '#2c5aa0', margin: 0, lineHeight: 1.6 }}>
          <ArrowRightLeft size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          <strong>对应关系</strong>：{comparison.explanation}
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================
// Code Comparison Section Component
// ============================================================
export default function CodeComparisonSection() {
  const [filterLayer, setFilterLayer] = useState<number | null>(null);

  const filteredComparisons = filterLayer !== null
    ? codeComparisons.filter(c => c.layer === filterLayer)
    : codeComparisons;

  return (
    <section className="card" style={{ marginBottom: '32px' }}>
      <FadeIn>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--crimson)', marginBottom: '16px' }}>
          <ArrowRightLeft size={28} />
          代码对比：从类比到实现
        </h2>
        <p style={{ color: 'var(--ink-mid)', marginBottom: '20px', lineHeight: 1.8 }}>
          通过对比生活场景的代码类比和技术实现代码，直观理解 Agent 系统的核心概念。
        </p>
      </FadeIn>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterLayer(null)}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: `1px solid ${filterLayer === null ? 'var(--crimson)' : '#e0e0e0'}`,
            background: filterLayer === null ? '#ffebee' : '#fff',
            color: filterLayer === null ? 'var(--crimson)' : 'var(--ink-mid)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          全部
        </button>
        {[2, 3].map(layer => (
          <button
            key={layer}
            onClick={() => setFilterLayer(layer)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: `1px solid ${filterLayer === layer ? 'var(--jade)' : '#e0e0e0'}`,
              background: filterLayer === layer ? '#e8f5e9' : '#fff',
              color: filterLayer === layer ? 'var(--jade)' : 'var(--ink-mid)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Layer {layer}
          </button>
        ))}
      </div>

      {filteredComparisons.map(comparison => (
        <CodeComparisonCard key={comparison.id} comparison={comparison} />
      ))}
    </section>
  );
}
