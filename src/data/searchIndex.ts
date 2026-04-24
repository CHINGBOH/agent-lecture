export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  layer: 0 | 1 | 2 | 3;
  section: string;
  keywords: string[];
}

export const searchIndex: SearchItem[] = [
  // Layer 0
  { id: 'l0-data', title: '数据收集与清洗', subtitle: '爬取 → 清洗 → 去重 → 质量过滤', layer: 0, section: 'data-section', keywords: ['数据', '爬取', '清洗', '去重', 'MinHash', 'LSH', 'Perplexity', '语料'] },
  { id: 'l0-annotation', title: '数据标注与标准', subtitle: 'SFT标注 / 偏好数据 / 安全对齐', layer: 0, section: 'annotation-section', keywords: ['标注', 'SFT', 'RLHF', '偏好', '安全', 'Red Teaming', '对齐'] },
  { id: 'l0-training', title: '训练三部曲', subtitle: 'Pre-training → SFT → RLHF / Function Calling FT', layer: 0, section: 'training-section-l0', keywords: ['训练', 'Pre-training', 'SFT', 'RLHF', 'DPO', '学习率', 'Loss'] },
  { id: 'l0-tensor', title: '高维张量空间', subtitle: 'Embedding / Attention / Transformer 内部', layer: 0, section: 'tensor-section', keywords: ['张量', 'Embedding', 'Attention', 'Transformer', '向量', '高维', 'QKV'] },
  { id: 'l0-gradient', title: '梯度下降之旅', subtitle: '反向传播 / AdamW / 学习率调度 / LoRA', layer: 0, section: 'gradient-section', keywords: ['梯度', '反向传播', 'AdamW', '学习率', 'Warmup', 'Cosine', 'LoRA'] },
  { id: 'l0-decoding', title: '解码生成策略', subtitle: 'Greedy / Beam / Top-k / Top-p / Temperature', layer: 0, section: 'decoding-section-l0', keywords: ['解码', 'Greedy', 'Beam', 'Top-k', 'Top-p', 'Temperature', '采样', 'Nucleus'] },
  { id: 'l0-json', title: '结构化输出与 Tool Call', subtitle: 'JSON约束解码 / Schema / Tool Call 完整链路', layer: 0, section: 'json-section', keywords: ['JSON', '结构化', '约束解码', 'Tool Call', 'Schema', 'FSM', 'CFG'] },

  // Layer 1
  { id: 'l1-training', title: 'LLM 训练流水线', subtitle: 'Pre-training → SFT → RLHF → Function Calling FT', layer: 1, section: 'TrainingSection', keywords: ['训练', 'fine-tune', 'pre-training', 'SFT', 'RLHF', '郭靖', '江南七怪'] },
  { id: 'l1-decoding', title: 'Constrained Decoding', subtitle: 'Logits Mask 强制 JSON 输出', layer: 1, section: 'DecodingSection', keywords: ['mask', 'logits', 'json', '约束', '黄蓉', 'token'] },
  { id: 'l1-tick', title: 'Runtime Tick + JMP', subtitle: '时钟节拍与状态跳转', layer: 1, section: 'TickSection', keywords: ['tick', 'jmp', '跳转', '时钟', '心跳', '状态机'] },
  { id: 'l1-channel', title: 'Channel 与 Memory', subtitle: 'FIFO 队列与记忆系统', layer: 1, section: 'ChannelSection', keywords: ['channel', 'memory', 'context', '信鸽', '向量', 'RAG'] },
  { id: 'l1-state', title: 'State 全息快照', subtitle: 'Checkpoint 与 Rollback', layer: 1, section: 'StateSection', keywords: ['state', 'snapshot', 'checkpoint', 'rollback', '快照', '回滚'] },

  // Layer 2
  { id: 'l2-arch', title: 'Agent 操作系统架构', subtitle: 'Rule → Skill → Agent → Workflow 四层金字塔', layer: 2, section: 'ArchitectureSection', keywords: ['架构', 'rule', 'skill', 'workflow', '金字塔', '操作系统'] },
  { id: 'l2-pdca', title: 'PDCA 循环', subtitle: 'Plan → Do → Check → Act', layer: 2, section: 'PDCASection', keywords: ['pdca', '循环', 'plan', 'check', '质量管理'] },
  { id: 'l2-routing', title: 'Auto-Routing', subtitle: '中断向量表与智能路由', layer: 2, section: 'RoutingSection', keywords: ['routing', '路由', '中断', '向量表', '关键词'] },
  { id: 'l2-fork', title: '多 Agent Fork', subtitle: '进程克隆与协作', layer: 2, section: 'ForkSection', keywords: ['fork', '多agent', '进程', '克隆', '协作'] },

  // Layer 3
  { id: 'l3-scene', title: '牛家村场景', subtitle: '密室 / 对战 / 襄阳 / 华山', layer: 3, section: 'SceneSection', keywords: ['场景', '牛家村', '密室', '襄阳', '华山'] },
  { id: 'l3-char', title: '江湖人物志', subtitle: '郭靖 / 黄蓉 / 洪七公 / 欧阳锋 / 周伯通 / 丘处机', layer: 3, section: 'CharacterSection', keywords: ['人物', '郭靖', '黄蓉', '洪七公', '欧阳锋', '周伯通'] },
  { id: 'l3-story', title: '剧情回放', subtitle: '/create = 蒙古军营攻略', layer: 3, section: 'StorySection', keywords: ['剧情', 'create', '蒙古', '军营', 'workflow'] },
  { id: 'l3-map', title: '完整映射表', subtitle: '技术 ↔ 江湖 全部对应关系', layer: 3, section: 'MappingTable', keywords: ['映射', '对应', '表格', '全部'] },

  // Agents
  { id: 'agent-orch', title: 'Orchestrator', subtitle: '总指挥 / 洪七公 / OS内核', layer: 2, section: 'ArchitectureSection', keywords: ['orchestrator', '洪七公', '总指挥', '调度'] },
  { id: 'agent-fe', title: 'Frontend Specialist', subtitle: '前端专家 / 黄蓉', layer: 2, section: 'ArchitectureSection', keywords: ['frontend', '前端', '黄蓉', 'react'] },
  { id: 'agent-be', title: 'Backend Specialist', subtitle: '后端专家', layer: 2, section: 'ArchitectureSection', keywords: ['backend', '后端', 'api', '数据库'] },
  { id: 'agent-debug', title: 'Debugger', subtitle: '调试专家', layer: 2, section: 'ArchitectureSection', keywords: ['debugger', '调试', 'bug', '排查'] },
  { id: 'agent-qi', title: 'Quality Inspector', subtitle: '质量审查 / 丘处机', layer: 2, section: 'ArchitectureSection', keywords: ['quality', '审查', '丘处机', '测试'] },
  { id: 'agent-planner', title: 'Project Planner', subtitle: '项目规划', layer: 2, section: 'ArchitectureSection', keywords: ['planner', '规划', '计划', 'PRD'] },
];
