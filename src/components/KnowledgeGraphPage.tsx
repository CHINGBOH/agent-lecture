import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Network, Search, Layers, Database, BookOpen } from 'lucide-react';
import KnowledgeGraphViz from './KnowledgeGraphViz';
import FadeIn from './animations/FadeIn';

// ============================================================
// 知识图谱数据类型
// ============================================================
interface GraphNode {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
}

interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ============================================================
// 示例知识图谱数据
// ============================================================
const SAMPLE_GRAPH_DATA: KnowledgeGraphData = {
  "nodes": [
    { "id": "layer:0", "name": "Layer 0: 多故事线入口", "type": "layer", "description": "故事比喻层，用金庸武侠和生活场景理解技术概念" },
    { "id": "layer:1", "name": "Layer 1: LLM训练", "type": "layer", "description": "从数据到模型的完整训练流程" },
    { "id": "layer:2", "name": "Layer 2: Runtime内核", "type": "layer", "description": "操作系统内核级别的运行机制" },
    { "id": "layer:3", "name": "Layer 3: Agent操作系统", "type": "layer", "description": "Agent的核心架构和组件" },
    { "id": "layer:4", "name": "Layer 4: 多Agent编排", "type": "layer", "description": "多Agent协同和分布式系统" },
    { "id": "layer:5", "name": "Layer 5: 实战工具", "type": "layer", "description": "实际工具和应用" },
    { "id": "concept:attention", "name": "Attention机制", "type": "concept", "description": "注意力机制，让模型关注重要信息" },
    { "id": "concept:transformer", "name": "Transformer架构", "type": "concept", "description": "基于自注意力的序列模型架构" },
    { "id": "concept:tokenization", "name": "Tokenization", "type": "concept", "description": "将文本分割为token的过程" },
    { "id": "concept:pretraining", "name": "Pre-training", "type": "concept", "description": "在大规模语料上训练基础模型" },
    { "id": "concept:sft", "name": "SFT指令微调", "type": "concept", "description": "监督微调，让模型学会按指令输出" },
    { "id": "concept:rlhf", "name": "RLHF", "type": "concept", "description": "基于人类反馈的强化学习" },
    { "id": "concept:runtime_tick", "name": "Runtime Tick", "type": "concept", "description": "Agent的主循环机制" },
    { "id": "concept:jmp", "name": "JMP状态跳转", "type": "concept", "description": "基于程序计数器的状态跳转" },
    { "id": "concept:state_snapshot", "name": "State Snapshot", "type": "concept", "description": "Agent状态的序列化快照" },
    { "id": "concept:channel", "name": "Channel总线", "type": "concept", "description": "异步通信队列" },
    { "id": "concept:orchestrator", "name": "Orchestrator", "type": "concept", "description": "Agent调度器" },
    { "id": "concept:skill_system", "name": "Skill系统", "type": "concept", "description": "按需加载的技能模块" },
    { "id": "concept:tool_use", "name": "Tool Use", "type": "concept", "description": "Agent使用外部工具" },
    { "id": "concept:multi_agent", "name": "Multi-Agent", "type": "concept", "description": "多Agent协同" },
    { "id": "metaphor:guojing", "name": "郭靖学武", "type": "metaphor", "description": "射雕英雄传中郭靖的成长过程" },
    { "id": "metaphor:zhangwuji", "name": "张无忌学九阳", "type": "metaphor", "description": "倚天屠龙记中张无忌学九阳神功" },
    { "id": "metaphor:linghuchong", "name": "令狐冲学独孤九剑", "type": "metaphor", "description": "笑傲江湖中令狐冲学独孤九剑" },
    { "id": "metaphor:restaurant", "name": "餐厅运营", "type": "metaphor", "description": "餐厅的领班、厨师、菜谱类比Agent系统" },
    { "id": "metaphor:company", "name": "公司运营", "type": "metaphor", "description": "公司组织架构类比Multi-Agent系统" },
    { "id": "library:transformers", "name": "HuggingFace Transformers", "type": "library", "description": "最流行的Transformer模型库" },
    { "id": "library:tensorflow", "name": "TensorFlow", "type": "library", "description": "Google开源的机器学习框架" },
    { "id": "library:langchain", "name": "LangChain", "type": "library", "description": "LLM应用开发框架" },
    { "id": "library:ollama", "name": "Ollama", "type": "library", "description": "本地LLM运行工具" },
    { "id": "library:autogpt", "name": "AutoGPT", "type": "library", "description": "自主AI Agent" }
  ],
  "edges": [
    { "source": "layer:1", "target": "layer:0", "type": "prerequisite", "weight": 1.0 },
    { "source": "layer:2", "target": "layer:1", "type": "prerequisite", "weight": 1.0 },
    { "source": "layer:3", "target": "layer:2", "type": "prerequisite", "weight": 1.0 },
    { "source": "layer:4", "target": "layer:3", "type": "prerequisite", "weight": 1.0 },
    { "source": "layer:5", "target": "layer:4", "type": "prerequisite", "weight": 1.0 },
    { "source": "concept:attention", "target": "concept:transformer", "type": "includes", "weight": 0.9 },
    { "source": "concept:transformer", "target": "concept:tokenization", "type": "uses", "weight": 0.8 },
    { "source": "concept:pretraining", "target": "concept:transformer", "type": "uses", "weight": 0.9 },
    { "source": "concept:sft", "target": "concept:pretraining", "type": "prerequisite", "weight": 1.0 },
    { "source": "concept:rlhf", "target": "concept:sft", "type": "prerequisite", "weight": 1.0 },
    { "source": "concept:runtime_tick", "target": "concept:jmp", "type": "includes", "weight": 0.9 },
    { "source": "concept:runtime_tick", "target": "concept:state_snapshot", "type": "uses", "weight": 0.8 },
    { "source": "concept:runtime_tick", "target": "concept:channel", "type": "uses", "weight": 0.7 },
    { "source": "concept:orchestrator", "target": "concept:skill_system", "type": "uses", "weight": 0.8 },
    { "source": "concept:orchestrator", "target": "concept:tool_use", "type": "uses", "weight": 0.7 },
    { "source": "concept:multi_agent", "target": "concept:orchestrator", "type": "includes", "weight": 0.9 },
    { "source": "layer:1", "target": "concept:attention", "type": "includes", "weight": 1.0 },
    { "source": "layer:1", "target": "concept:transformer", "type": "includes", "weight": 1.0 },
    { "source": "layer:1", "target": "concept:tokenization", "type": "includes", "weight": 1.0 },
    { "source": "layer:1", "target": "concept:pretraining", "type": "includes", "weight": 1.0 },
    { "source": "layer:1", "target": "concept:sft", "type": "includes", "weight": 1.0 },
    { "source": "layer:1", "target": "concept:rlhf", "type": "includes", "weight": 1.0 },
    { "source": "layer:2", "target": "concept:runtime_tick", "type": "includes", "weight": 1.0 },
    { "source": "layer:2", "target": "concept:jmp", "type": "includes", "weight": 1.0 },
    { "source": "layer:2", "target": "concept:state_snapshot", "type": "includes", "weight": 1.0 },
    { "source": "layer:2", "target": "concept:channel", "type": "includes", "weight": 1.0 },
    { "source": "layer:3", "target": "concept:orchestrator", "type": "includes", "weight": 1.0 },
    { "source": "layer:3", "target": "concept:skill_system", "type": "includes", "weight": 1.0 },
    { "source": "layer:3", "target": "concept:tool_use", "type": "includes", "weight": 1.0 },
    { "source": "layer:4", "target": "concept:multi_agent", "type": "includes", "weight": 1.0 },
    { "source": "metaphor:guojing", "target": "layer:0", "type": "analogy_to", "weight": 1.0 },
    { "source": "metaphor:guojing", "target": "layer:1", "type": "analogy_to", "weight": 0.9 },
    { "source": "metaphor:zhangwuji", "target": "layer:1", "type": "analogy_to", "weight": 1.0 },
    { "source": "metaphor:zhangwuji", "target": "layer:2", "type": "analogy_to", "weight": 0.9 },
    { "source": "metaphor:linghuchong", "target": "layer:2", "type": "analogy_to", "weight": 1.0 },
    { "source": "metaphor:linghuchong", "target": "layer:3", "type": "analogy_to", "weight": 0.9 },
    { "source": "metaphor:restaurant", "target": "layer:2", "type": "analogy_to", "weight": 1.0 },
    { "source": "metaphor:restaurant", "target": "layer:3", "type": "analogy_to", "weight": 0.9 },
    { "source": "metaphor:company", "target": "layer:3", "type": "analogy_to", "weight": 1.0 },
    { "source": "metaphor:company", "target": "layer:4", "type": "analogy_to", "weight": 0.9 },
    { "source": "library:transformers", "target": "concept:transformer", "type": "implements", "weight": 1.0 },
    { "source": "library:transformers", "target": "concept:attention", "type": "implements", "weight": 1.0 },
    { "source": "library:tensorflow", "target": "concept:pretraining", "type": "implements", "weight": 0.9 },
    { "source": "library:langchain", "target": "concept:orchestrator", "type": "implements", "weight": 0.9 },
    { "source": "library:langchain", "target": "concept:tool_use", "type": "implements", "weight": 0.8 },
    { "source": "library:ollama", "target": "concept:transformer", "type": "uses", "weight": 0.9 },
    { "source": "library:autogpt", "target": "concept:multi_agent", "type": "implements", "weight": 0.9 },
    { "source": "library:autogpt", "target": "concept:tool_use", "type": "implements", "weight": 0.8 }
  ]
};

// ============================================================
// 知识图谱页面
// ============================================================
export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<KnowledgeGraphData>(SAMPLE_GRAPH_DATA);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('graph');

  // 统计信息
  const statistics = {
    totalNodes: graphData.nodes.length,
    totalEdges: graphData.edges.length,
    nodeTypes: graphData.nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    edgeTypes: graphData.edges.reduce((acc, edge) => {
      acc[edge.type] = (acc[edge.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // 处理节点点击
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  // 搜索节点
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    const filteredNodes = graphData.nodes.filter(node =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredNodes.length > 0) {
      setSelectedNode(filteredNodes[0]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: 'var(--crimson)', marginBottom: '8px' }}>
            🕸️ 知识图谱
          </h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: '16px' }}>
            技术概念的关联网络 —— 从比喻到实现的完整映射
          </p>
        </div>
      </FadeIn>

      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999',
            }} />
            <input
              type="text"
              placeholder="搜索技术概念..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
              }}
            />
          </div>
        </form>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('graph')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${activeTab === 'graph' ? 'var(--crimson)' : '#e0e0e0'}`,
              background: activeTab === 'graph' ? '#ffebee' : '#fff',
              color: activeTab === 'graph' ? 'var(--crimson)' : 'var(--ink-mid)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <Network size={16} />
            图谱
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${activeTab === 'statistics' ? 'var(--crimson)' : '#e0e0e0'}`,
              background: activeTab === 'statistics' ? '#ffebee' : '#fff',
              color: activeTab === 'statistics' ? 'var(--crimson)' : 'var(--ink-mid)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <BarChart3 size={16} />
            统计
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* 知识图谱 */}
        <div style={{ gridColumn: '1', gridRow: '1' }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            padding: '20px',
            minHeight: '600px',
          }}>
            <KnowledgeGraphViz
              data={graphData}
              onNodeClick={handleNodeClick}
              width={800}
              height={500}
            />
          </div>
        </div>

        {/* 右侧信息 */}
        <div style={{ gridColumn: '2', gridRow: '1' }}>
          {/* 统计信息 */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--crimson)', marginBottom: '16px' }}>
              <Database size={20} />
              知识图谱统计
            </h3>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-mid)' }}>总节点数</span>
                <span style={{ fontWeight: 700, color: 'var(--crimson)' }}>{statistics.totalNodes}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-mid)' }}>总关系数</span>
                <span style={{ fontWeight: 700, color: 'var(--crimson)' }}>{statistics.totalEdges}</span>
              </div>
              
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>节点类型</div>
                {Object.entries(statistics.nodeTypes).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--ink-mid)' }}>{type}</span>
                    <span style={{ fontWeight: 600, color: 'var(--crimson)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 选中节点详情 */}
          {selectedNode && (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              padding: '20px',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--crimson)', marginBottom: '16px' }}>
                <BookOpen size={20} />
                节点详情
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>名称</div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{selectedNode.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>类型</div>
                  <div style={{ fontWeight: 600, color: 'var(--crimson)' }}>{selectedNode.type}</div>
                </div>
                {selectedNode.description && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>描述</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-mid)', lineHeight: 1.6 }}>{selectedNode.description}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 统计标签页 */}
      {activeTab === 'statistics' && (
        <div style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            padding: '24px',
          }}>
            <h3 style={{ color: 'var(--crimson)', marginBottom: '20px' }}>详细统计信息</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* 节点类型统计 */}
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '12px' }}>节点类型分布</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(statistics.nodeTypes).map(([type, count]) => {
                    const percentage = ((count / statistics.totalNodes) * 100).toFixed(1);
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--ink-mid)' }}>{type}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--crimson)' }}>{count} ({percentage}%)</span>
                        </div>
                        <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px' }}>
                          <div style={{
                            height: '100%',
                            width: `${percentage}%`,
                            background: 'var(--crimson)',
                            borderRadius: '3px',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 关系类型统计 */}
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '12px' }}>关系类型分布</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(statistics.edgeTypes).map(([type, count]) => {
                    const percentage = ((count / statistics.totalEdges) * 100).toFixed(1);
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--ink-mid)' }}>{type}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--crimson)' }}>{count} ({percentage}%)</span>
                        </div>
                        <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px' }}>
                          <div style={{
                            height: '100%',
                            width: `${percentage}%`,
                            background: 'var(--jade)',
                            borderRadius: '3px',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
