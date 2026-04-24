// ============================================================
// Layer 0: 多故事线比喻数据 —— 金庸武侠系列 & 生活场景
// 主线：技术深度递进（Layer 0-5）
// 辅线1：金庸武侠系列（射雕、倚天、笑傲）
// 辅线2：生活场景（餐厅、公司）
// ============================================================

export interface StoryLine {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'wuxia' | 'life';
  source: string; // 作品名称或场景来源
}

export const storyLines: StoryLine[] = [
  {
    id: 'shediao',
    name: '射雕英雄传',
    emoji: '🏹',
    description: '郭靖的成长史 = LLM训练全流程',
    category: 'wuxia',
    source: '射雕英雄传',
  },
  {
    id: 'yitian',
    name: '倚天屠龙记',
    emoji: '⚔️',
    description: '张无忌学九阳神功 = 模型架构演进',
    category: 'wuxia',
    source: '倚天屠龙记',
  },
  {
    id: 'xiaoo',
    name: '笑傲江湖',
    emoji: '🎸',
    description: '令狐冲学独孤九剑 = Agent能力构建',
    category: 'wuxia',
    source: '笑傲江湖',
  },
  {
    id: 'restaurant',
    name: '餐厅运营',
    emoji: '🍽️',
    description: '餐厅的日常运营 = Agent系统',
    category: 'life',
    source: '生活场景',
  },
  {
    id: 'company',
    name: '公司运营',
    emoji: '🏢',
    description: '公司的组织架构 = Multi-Agent系统',
    category: 'life',
    source: '生活场景',
  },
];

// ============================================================
// 射雕英雄传线：郭靖成长史 → LLM训练全流程
// ============================================================
export interface ShediaoMapping {
  techConcept: string;
  wuxiaRole: string;
  scene: string;
  why: string;
  layer: number;
  linkToTech: string;
}

export const shediaoMappings: ShediaoMapping[] = [
  // Layer 1: LLM训练
  {
    techConcept: '数据收集与清洗',
    wuxiaRole: '江南七怪收集武林情报',
    scene: '大漠',
    why: '七怪从各地收集武林消息（爬取），过滤假消息（清洗），整理成可用情报',
    layer: 1,
    linkToTech: 'DataPipeline',
  },
  {
    techConcept: 'Pre-training 预训练',
    wuxiaRole: '江南七怪教基本功',
    scene: '大漠练武场',
    why: '教郭靖扎马步、拳脚等基础功夫，就像模型学习语言的基础规律',
    layer: 1,
    linkToTech: 'LLMTraining',
  },
  {
    techConcept: 'SFT 指令微调',
    wuxiaRole: '马钰教内功心法',
    scene: '悬崖顶',
    why: '马钰专门教郭靖正确的内功运行方式，就像教模型按照指令输出',
    layer: 1,
    linkToTech: 'LLMTraining',
  },
  {
    techConcept: 'RLHF 强化学习',
    wuxiaRole: '洪七公实战纠正',
    scene: '太湖船头',
    why: '洪七公看郭靖实战，打得好就夸，打得不对就纠正，通过反馈优化',
    layer: 1,
    linkToTech: 'RLHF',
  },
  {
    techConcept: '模型评估',
    wuxiaRole: '华山论剑',
    scene: '华山之巅',
    why: '五绝比武，评判谁的内力深厚、招式精妙，就是模型能力的最终检验',
    layer: 1,
    linkToTech: 'Evaluation',
  },
  // Layer 2: Runtime内核
  {
    techConcept: 'Runtime Tick',
    wuxiaRole: '对战中的心跳节拍',
    scene: '对战梅超风',
    why: '每次交手就是一个Tick，检查战局、决定下一步动作',
    layer: 2,
    linkToTech: 'RuntimeTick',
  },
  {
    techConcept: 'JMP 状态跳转',
    wuxiaRole: '招式切换',
    scene: '临敌应变',
    why: '防守→发现破绽→进攻→收招，每次切换都是JMP',
    layer: 2,
    linkToTech: 'JMP',
  },
  {
    techConcept: 'State 快照',
    wuxiaRole: '脑海中的战局记忆',
    scene: '战斗中',
    why: '高手能记住当前战局的所有细节，随时可以复盘',
    layer: 2,
    linkToTech: 'StateSnapshot',
  },
  // Layer 3: Agent操作系统
  {
    techConcept: 'Rule 引擎',
    wuxiaRole: '江湖规矩',
    scene: '全真教门规',
    why: '出招前先想：这招犯规吗？不可滥杀无辜是底线',
    layer: 3,
    linkToTech: 'RuleEngine',
  },
  {
    techConcept: 'Skill 系统',
    wuxiaRole: '武功秘籍',
    scene: '密室书架',
    why: '打架前从书架抽秘籍现翻现用，就像dlopen动态加载',
    layer: 3,
    linkToTech: 'SkillSystem',
  },
  {
    techConcept: 'Orchestrator',
    wuxiaRole: '洪七公总调度',
    scene: '襄阳大战',
    why: '不亲自打，而是调度欧阳锋探路、黄蓉布阵、郭靖主攻',
    layer: 3,
    linkToTech: 'Orchestrator',
  },
];

// ============================================================
// 倚天屠龙记线：张无忌学艺 → 模型架构演进
// ============================================================
export interface YitianMapping {
  techConcept: string;
  wuxiaRole: string;
  scene: string;
  why: string;
  layer: number;
  linkToTech: string;
}

export const yitianMappings: YitianMapping[] = [
  // Layer 1: 架构基础
  {
    techConcept: 'Transformer 架构',
    wuxiaRole: '九阳神功心法',
    scene: '昆仑仙境',
    why: '九阳神功是内功根基，练好后学什么都快。Transformer是所有LLM的基础架构',
    layer: 1,
    linkToTech: 'TransformerArch',
  },
  {
    techConcept: 'Attention 机制',
    wuxiaRole: '乾坤大挪移',
    scene: '明教密道',
    why: '乾坤大挪移能同时感知全局，把敌人的力道转移到别处，就像Attention关注所有token',
    layer: 1,
    linkToTech: 'Attention',
  },
  {
    techConcept: '多层网络',
    wuxiaRole: '九阳神功七重境界',
    scene: '修炼过程',
    why: '每练深一层，功力就大增。就像Transformer的layer stacking',
    layer: 1,
    linkToTech: 'LayerStacking',
  },
  // Layer 2: 训练优化
  {
    techConcept: 'LoRA 微调',
    wuxiaRole: '速成九阳部分心法',
    scene: '临时应敌',
    why: '不用重修全部九阳，只练关键的几招，就能快速提升战力',
    layer: 2,
    linkToTech: 'LoRA',
  },
  {
    techConcept: '分布式训练',
    wuxiaRole: '六大派围攻光明顶',
    scene: '光明顶大战',
    why: '多路同时进攻，协同作战，就像多GPU并行训练',
    layer: 2,
    linkToTech: 'DistributedTraining',
  },
  // Layer 3: Agent能力
  {
    techConcept: 'Tool Use',
    wuxiaRole: '圣火令武功',
    scene: '波斯明教',
    why: '圣火令是外在工具，配合九阳内功使用，就像Agent调用外部工具',
    layer: 3,
    linkToTech: 'ToolUse',
  },
  {
    techConcept: 'Multi-Agent',
    wuxiaRole: '明教五散人+四大法王',
    scene: '明教组织架构',
    why: '各有所长，协同作战。就像多个Agent各司其职',
    layer: 4,
    linkToTech: 'MultiAgent',
  },
];

// ============================================================
// 笑傲江湖线：令狐冲学艺 → Agent能力构建
// ============================================================
export interface XiaooMapping {
  techConcept: string;
  wuxiaRole: string;
  scene: string;
  why: string;
  layer: number;
  linkToTech: string;
}

export const xiaooMappings: XiaooMapping[] = [
  // Layer 3: Agent基础
  {
    techConcept: 'Skill 系统',
    wuxiaRole: '独孤九剑招式',
    scene: '思过崖',
    why: '风清扬传授独孤九剑，每招都是独立的skill，按需调用',
    layer: 3,
    linkToTech: 'SkillSystem',
  },
  {
    techConcept: 'Auto-Routing',
    wuxiaRole: '独孤九剑听风辨位',
    scene: '对战',
    why: '听到敌人从哪来，自动跳转到对应招式。就像keyword hash→IVT→JMP',
    layer: 3,
    linkToTech: 'AutoRouting',
  },
  // Layer 4: 多Agent
  {
    techConcept: 'Multi-Agent 协同',
    wuxiaRole: '令狐冲+任盈盈联手',
    scene: '黑木崖大战',
    why: '两人各有所长，配合默契。就像多个Agent协同工作',
    layer: 4,
    linkToTech: 'MultiAgent',
  },
  {
    techConcept: 'Consensus 共识',
    wuxiaRole: '正邪两派谈判',
    scene: '少林寺',
    why: '不同门派要达成共识，需要协商机制',
    layer: 4,
    linkToTech: 'Consensus',
  },
  // Layer 5: 实战
  {
    techConcept: 'MCP 协议',
    wuxiaRole: '江湖通用接口',
    scene: '武林大会',
    why: '不同门派都能交流的标准化协议，就像MCP让不同模型能调用相同工具',
    layer: 5,
    linkToTech: 'MCP',
  },
];

// ============================================================
// 餐厅运营线：生活场景类比
// ============================================================
export interface RestaurantMapping {
  techConcept: string;
  restaurantRole: string;
  scene: string;
  why: string;
  layer: number;
  linkToTech: string;
}

export const restaurantMappings: RestaurantMapping[] = [
  {
    techConcept: 'Orchestrator',
    restaurantRole: '领班/服务员',
    scene: '餐厅前台',
    why: '领班接待客人，理解需求，分派给对应厨师。就像Orchestrator路由请求到对应Agent',
    layer: 3,
    linkToTech: 'Orchestrator',
  },
  {
    techConcept: 'Agent',
    restaurantRole: '厨师',
    scene: '厨房',
    why: '每个厨师专精一类菜（中餐、西餐、甜点），就像Specialist Agent各有所长',
    layer: 3,
    linkToTech: 'AgentArchitecture',
  },
  {
    techConcept: 'Skill',
    restaurantRole: '菜谱',
    scene: '厨房书架',
    why: '厨师按菜谱做菜，需要时从书架上拿。就像Agent按需加载Skill',
    layer: 3,
    linkToTech: 'SkillSystem',
  },
  {
    techConcept: 'Channel',
    restaurantRole: '传菜通道',
    scene: '前台与厨房之间',
    why: '客人点单→服务员写单→厨房做菜→传菜上桌→客人反馈。完整的Channel通信循环',
    layer: 2,
    linkToTech: 'Channel',
  },
  {
    techConcept: 'Rule Engine',
    restaurantRole: '食品安全规范',
    scene: '厨房规定',
    why: '做菜前检查：食材新鲜吗？卫生达标吗？就像Rule Engine检查操作是否合规',
    layer: 3,
    linkToTech: 'RuleEngine',
  },
  {
    techConcept: 'Workflow',
    restaurantRole: '标准服务流程',
    scene: '餐厅运营',
    why: '迎宾→点单→做菜→上菜→结账→送客。固定的Workflow JMP链',
    layer: 3,
    linkToTech: 'Workflow',
  },
];

// ============================================================
// 公司运营线：生活场景类比
// ============================================================
export interface CompanyMapping {
  techConcept: string;
  companyRole: string;
  scene: string;
  why: string;
  layer: number;
  linkToTech: string;
}

export const companyMappings: CompanyMapping[] = [
  {
    techConcept: 'Orchestrator',
    companyRole: 'CEO',
    scene: '总裁办公室',
    why: 'CEO不亲自写代码，而是调度各部门：产品部、研发部、测试部。就像Orchestrator fork()各Agent',
    layer: 3,
    linkToTech: 'Orchestrator',
  },
  {
    techConcept: 'Agent',
    companyRole: '部门经理',
    scene: '各部门',
    why: '产品经理、研发经理、测试经理各管一摊，独立工作又相互协作',
    layer: 3,
    linkToTech: 'AgentArchitecture',
  },
  {
    techConcept: 'Tool',
    companyRole: '员工',
    scene: '工位',
    why: '员工是具体执行者，写代码、做测试、写文档。就像Agent调用的具体Tool',
    layer: 3,
    linkToTech: 'ToolUse',
  },
  {
    techConcept: 'Consensus',
    companyRole: '会议',
    scene: '会议室',
    why: '跨部门开会达成共识，就像多Agent的共识机制（RAFT/Paxos）',
    layer: 4,
    linkToTech: 'Consensus',
  },
  {
    techConcept: 'Resource Lock',
    companyRole: '会议室预订',
    scene: '行政系统',
    why: '同一时间只能一个团队用会议室，需要预订锁。就像分布式锁防止资源竞争',
    layer: 4,
    linkToTech: 'ResourceLock',
  },
  {
    techConcept: 'Monitoring',
    companyRole: 'KPI考核',
    scene: '季度评估',
    why: '定期检查各部门表现，就像OpenTelemetry监控全链路追踪',
    layer: 4,
    linkToTech: 'Monitoring',
  },
];
