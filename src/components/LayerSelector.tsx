import {
  Swords, Brain, Cpu, Building2, Globe, Wrench
} from 'lucide-react';

interface LayerSelectorProps {
  activeLayer: number;
  onChange: (layer: number) => void;
}

const layers = [
  { id: 0, label: 'Layer 0', title: '牛家村江湖', subtitle: '浅出·故事入口', icon: Swords, color: '#8b2500' },
  { id: 1, label: 'Layer 1', title: 'LLM 前世今生', subtitle: '模型训练层', icon: Brain, color: '#1a365d' },
  { id: 2, label: 'Layer 2', title: 'Runtime 内核', subtitle: '深入·JMP/State/Channel', icon: Cpu, color: '#2d5a3d' },
  { id: 3, label: 'Layer 3', title: 'Agent 操作系统', subtitle: '调度层', icon: Building2, color: '#b8860b' },
  { id: 4, label: 'Layer 4', title: '多 Agent 编排', subtitle: '分布式层', icon: Globe, color: '#6a1b9a' },
  { id: 5, label: 'Layer 5', title: '实战工具箱', subtitle: 'Playground', icon: Wrench, color: '#e65100' },
];

export default function LayerSelector({ activeLayer, onChange }: LayerSelectorProps) {
  return (
    <nav style={{
      display: 'flex',
      gap: '8px',
      padding: '12px 24px',
      background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)',
      borderBottom: '2px solid #b8860b',
      position: 'sticky',
      top: '30px',
      zIndex: 100,
      flexWrap: 'wrap',
      overflowX: 'auto',
    }}>
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = activeLayer === layer.id;
        return (
          <button
            key={layer.id}
            onClick={() => onChange(layer.id)}
            style={{
              flex: '1 0 140px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: `2px solid ${isActive ? layer.color : 'transparent'}`,
              background: isActive ? `${layer.color}18` : 'transparent',
              color: isActive ? layer.color : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textAlign: 'left',
              minWidth: '0',
            }}
            title={layer.subtitle}
          >
            <Icon size={22} style={{ flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7 }}>{layer.label}</div>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {layer.title}
              </div>
            </div>
            <div style={{
              fontSize: '9px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: `${layer.color}20`,
              color: layer.color,
              whiteSpace: 'nowrap',
              marginLeft: 'auto',
              flexShrink: 0,
            }}>
              {layer.subtitle}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
