import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Search } from 'lucide-react';
import FadeIn from './animations/FadeIn';

// ============================================================
// 知识图谱数据类型
// ============================================================
interface GraphNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
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
// 节点颜色映射
// ============================================================
const NODE_COLORS: Record<string, string> = {
  'layer': '#8b2500',      // 朱红
  'concept': '#2d5a3d',    // 翡翠绿
  'library': '#4a7ab8',    // 深蓝
  'tool': '#b8860b',       // 金色
  'document': '#6a1b9a',   // 紫色
  'pattern': '#e65100',    // 橙色
  'algorithm': '#00695c',  // 深青
  'protocol': '#5c6bc0',   // 靛蓝
  'metaphor': '#d81b60',   // 粉红
};

const NODE_BG_COLORS: Record<string, string> = {
  'layer': '#ffebee',
  'concept': '#e8f5e9',
  'library': '#e3f2fd',
  'tool': '#fff8e1',
  'document': '#f3e5f5',
  'pattern': '#fff3e0',
  'algorithm': '#e0f2f1',
  'protocol': '#e8eaf6',
  'metaphor': '#fce4ec',
};

// ============================================================
// 力导向图布局
// ============================================================
function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
) {
  const [simulatedNodes, setSimulatedNodes] = useState<GraphNode[]>(nodes);

  useEffect(() => {
    if (nodes.length === 0) return;

    // 简单的力导向算法实现
    const newNodes = nodes.map(n => ({
      ...n,
      x: n.x ?? Math.random() * width,
      y: n.y ?? Math.random() * height,
      vx: n.vx ?? 0,
      vy: n.vy ?? 0,
    }));

    // 模拟迭代
    for (let iter = 0; iter < 100; iter++) {
      const alpha = 0.3 * (1 - iter / 100); // 冷却系数

      // 节点间斥力
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[j].x! - newNodes[i].x!;
          const dy = newNodes[j].y! - newNodes[i].y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (100 / dist) * alpha;
          
          newNodes[i].vx! -= (dx / dist) * force;
          newNodes[i].vy! -= (dy / dist) * force;
          newNodes[j].vx! += (dx / dist) * force;
          newNodes[j].vy! += (dy / dist) * force;
        }
      }

      // 边的引力
      for (const edge of edges) {
        const source = newNodes.find(n => n.id === edge.source);
        const target = newNodes.find(n => n.id === edge.target);
        if (source && target) {
          const dx = target.x! - source.x!;
          const dy = target.y! - source.y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 150) * 0.05 * alpha;
          
          source.vx! += (dx / dist) * force;
          source.vy! += (dy / dist) * force;
          target.vx! -= (dx / dist) * force;
          target.vy! -= (dy / dist) * force;
        }
      }

      // 向心力（防止节点飞出）
      for (const node of newNodes) {
        node.vx! += (width / 2 - node.x!) * 0.01 * alpha;
        node.vy! += (height / 2 - node.y!) * 0.01 * alpha;
      }

      // 更新位置
      for (const node of newNodes) {
        node.vx! *= 0.6; // 阻尼
        node.vy! *= 0.6;
        node.x! += node.vx!;
        node.y! += node.vy!;
        
        // 边界限制
        node.x = Math.max(50, Math.min(width - 50, node.x));
        node.y = Math.max(50, Math.min(height - 50, node.y));
      }
    }

    setSimulatedNodes(newNodes);
  }, [nodes, edges, width, height]);

  return simulatedNodes;
}

// ============================================================
// 知识图谱可视化组件
// ============================================================
interface KnowledgeGraphVizProps {
  data: KnowledgeGraphData;
  onNodeClick?: (node: GraphNode) => void;
  width?: number;
  height?: number;
}

export default function KnowledgeGraphViz({
  data,
  onNodeClick,
  width = 800,
  height = 600,
}: KnowledgeGraphVizProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  // 运行力导向模拟
  const simulatedNodes = useForceSimulation(data.nodes, data.edges, width, height);

  // 节点过滤（搜索）
  const filteredNodes = searchTerm
    ? simulatedNodes.filter(n =>
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : simulatedNodes;

  // 节点大小计算
  const getNodeSize = (node: GraphNode) => {
    const degree = data.edges.filter(
      e => e.source === node.id || e.target === node.id
    ).length;
    return Math.max(20, Math.min(50, 20 + degree * 5));
  };

  // 边宽度计算
  const getEdgeWidth = (edge: GraphEdge) => {
    return Math.max(1, Math.min(4, edge.weight * 3));
  };

  // 节点点击处理
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  // 缩放控制
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setSelectedNode(null);
    setSearchTerm('');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        padding: '12px',
        background: '#fff',
        borderRadius: '10px',
        border: '1px solid #e0e0e0',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999',
          }} />
          <input
            type="text"
            placeholder="搜索节点..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '14px',
            }}
          />
        </div>
        <button onClick={handleZoomIn} style={zoomButtonStyle}>
          <ZoomIn size={18} />
        </button>
        <button onClick={handleZoomOut} style={zoomButtonStyle}>
          <ZoomOut size={18} />
        </button>
        <button onClick={handleReset} style={zoomButtonStyle}>
          <Maximize2 size={18} />
        </button>
      </div>

      {/* 图例 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        padding: '12px',
        background: '#f8f8f8',
        borderRadius: '8px',
        flexWrap: 'wrap',
      }}>
        {Object.entries(NODE_COLORS).slice(0, 6).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: color,
            }} />
            <span style={{ fontSize: '12px', color: '#666' }}>{type}</span>
          </div>
        ))}
      </div>

      {/* SVG图谱 */}
      <motion.div
        style={{
          width: '100%',
          height: height,
          overflow: 'hidden',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          background: '#fafafa',
        }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* 边 */}
          {data.edges.map((edge, i) => {
            const source = simulatedNodes.find(n => n.id === edge.source);
            const target = simulatedNodes.find(n => n.id === edge.target);
            if (!source || !target) return null;

            return (
              <line
                key={`edge-${i}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)
                  ? '#8b2500'
                  : '#ccc'}
                strokeWidth={getEdgeWidth(edge)}
                opacity={selectedNode ? 0.3 : 0.6}
              />
            );
          })}

          {/* 节点 */}
          {filteredNodes.map((node) => {
            const size = getNodeSize(node);
            const color = NODE_COLORS[node.type] || '#999';
            const bgColor = NODE_BG_COLORS[node.type] || '#f0f0f0';
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{ cursor: 'pointer' }}
              >
                {/* 节点圆形 */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={size}
                  fill={bgColor}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={0.9}
                />
                
                {/* 节点文字 */}
                <text
                  x={node.x}
                  y={node.y + size + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isSelected ? '#8b2500' : '#333'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {node.name.length > 10 ? node.name.substring(0, 10) + '...' : node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* 选中节点详情 */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '16px',
            padding: '20px',
            background: NODE_BG_COLORS[selectedNode.type] || '#f8f8f8',
            borderRadius: '12px',
            border: `2px solid ${NODE_COLORS[selectedNode.type] || '#999'}`,
          }}
        >
          <h3 style={{ color: NODE_COLORS[selectedNode.type] || '#333', marginBottom: '8px' }}>
            {selectedNode.name}
          </h3>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            <strong>类型:</strong> {selectedNode.type}
          </div>
          {selectedNode.description && (
            <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.6 }}>
              {selectedNode.description}
            </p>
          )}
          
          {/* 关联节点 */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>关联节点:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {data.edges
                .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                .map((edge, i) => {
                  const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                  const otherNode = data.nodes.find(n => n.id === otherId);
                  if (!otherNode) return null;
                  return (
                    <span
                      key={i}
                      onClick={() => handleNodeClick(otherNode)}
                      style={{
                        padding: '6px 12px',
                        background: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {otherNode.name}
                      <span style={{ fontSize: '10px', color: '#999', marginLeft: '4px' }}>
                        ({edge.type})
                      </span>
                    </span>
                  );
                })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
// 样式
// ============================================================
const zoomButtonStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  background: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
