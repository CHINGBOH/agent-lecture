// ============================================================
// PPT 模式幻灯片数据
// ============================================================

export interface PPTSlide {
  id: string;
  type: 'cover' | 'content' | 'end';
  layer: number;
  title: string;
  subtitle?: string;
  bullets: PPTBullet[];
  code?: string;
  analogy?: string;
  chart?: string;
  image?: string;
  note?: string;
}

export interface PPTBullet {
  icon: string;
  text: string;
  highlight?: string;
}

export const pptSlides: PPTSlide[] = [
  // ==================== 封面 ====================
  {
    id: 'cover',
    type: 'cover',
    layer: -1,
    title: 'Agent 全栈机制深度解析',
    subtitle: '从数据收集到多 Agent 编排 —— LLM 的前世今生',
    bullets: [],
    note: '按 → 开始',
  },

  // ==================== Layer 0 ====================
  {
    id: 'l0-data',
    type: 'content',
    layer: 0,
    title: '数据江湖：从 10TB 到 1TB',
    bullets: [
      { icon: '🌐', text: '爬取 Raw', highlight: '~10TB 互联网文本' },
      { icon: '🧹', text: '清洗去噪', highlight: '去HTML / 修编码 / 去模板 → ~5TB' },
      { icon: '🔍', text: '去重 MinHash+LSH', highlight: '相似度>0.85 视为重复 → ~2TB' },
      { icon: '⚖️', text: '质量过滤 Perplexity', highlight: '困惑度<500 为高质量 → ~1TB' },
    ],
    image: '/images/data_pipeline.png',
    analogy: '🎭 江湖情报网撒出去 → 去掉假消息和重复情报 → 只留可靠信息',
    note: '数据是模型的"食材"，Garbage In Garbage Out',
  },

  {
    id: 'l0-annotation',
    type: 'content',
    layer: 0,
    title: '标注与标准：教模型"什么是对"',
    bullets: [
      { icon: '📝', text: 'SFT 数据', highlight: '人工写 (Question, Answer) 对，~100万条' },
      { icon: '⚖️', text: '偏好数据', highlight: 'Pairwise Ranking：A好还是B好' },
      { icon: '🛡️', text: '安全对齐 Red Teaming', highlight: '故意诱导模型说有害内容，教它拒绝' },
    ],
    code: `// 偏好数据格式
{ prompt: "写一首春天的诗",
  chosen: "春眠不觉晓...",      // ✅ 好回答
  rejected: "春天很好。" }      // ❌ 差回答`,
    analogy: '🎭 武林大会评判：五绝围观比武，评判哪招更精妙',
    note: '没有标注就没有学习信号',
  },

  {
    id: 'l0-training',
    type: 'content',
    layer: 0,
    title: '训练三部曲',
    bullets: [
      { icon: '1️⃣', text: 'Pre-training', highlight: '学会"说话" —— Next Token Prediction，lr=6e-4' },
      { icon: '2️⃣', text: 'SFT', highlight: '学会"听话" —— (Q,A)对微调，lr=2e-5' },
      { icon: '3️⃣', text: 'RLHF / DPO', highlight: '学会"讨人喜欢" —— 偏好对齐，lr=1e-6' },
      { icon: '🔧', text: 'Function Calling FT', highlight: '学会"输出JSON" —— Tool Schema 训练' },
    ],
    image: '/images/training_pipeline.png',
    analogy: '🎭 郭靖学艺：江南七怪教基本功 → 马钰教内功 → 洪七公实战纠正 → 周伯通逼背口诀',
    note: '学习率逐阶段降低，数据量逐阶段减少',
  },

  {
    id: 'l0-tensor',
    type: 'content',
    layer: 0,
    title: '高维张量空间：Transformer 内部',
    bullets: [
      { icon: '🔢', text: 'Token Embedding', highlight: '"猫" → 4096维向量 [0.12, -0.45, 0.88, ...]' },
      { icon: '📍', text: '位置编码', highlight: 'sin/cos 给每个位置独特"指纹"' },
      { icon: '👁️', text: 'Self-Attention', highlight: 'Q·K^T / √d → Softmax → 加权求和 V' },
      { icon: '🏗️', text: '逐层演化', highlight: '浅层学语法 → 中层学语义 → 深层学推理' },
    ],
    image: '/images/transformer_arch.png',
    analogy: '🎭 内力运行经脉：4096条经脉中真气流转，相似的招式走同一条路',
    note: 'Attention 就是"听风辨器"——同时感知所有方向，但注意力集中在威胁最大处',
  },

  {
    id: 'l0-gradient',
    type: 'content',
    layer: 0,
    title: '梯度下降：模型如何"学会"知识',
    bullets: [
      { icon: '⛰️', text: '反向传播', highlight: '从 Loss 往回算梯度，链式法则传回每一层' },
      { icon: '🧭', text: 'AdamW', highlight: '动量(一阶矩) + 方差(二阶矩) + Weight Decay' },
      { icon: '📈', text: '学习率调度', highlight: 'Warmup 2000步 → Cosine Decay 到接近0' },
      { icon: '⚡', text: 'LoRA', highlight: '只训练低秩矩阵 A×B，节省97%参数' },
    ],
    image: '/images/gradient_descent.png',
    analogy: '🎭 内功修炼：真气走错经脉（梯度）→ 调整呼吸（AdamW）→ 火候由小到大再收（学习率调度）',
    note: '70亿参数 = 70亿个梯度同时更新',
  },

  {
    id: 'l0-decoding',
    type: 'content',
    layer: 0,
    title: '解码生成：从 logits 到文本',
    bullets: [
      { icon: '🎯', text: 'Greedy', highlight: '永远选概率最高的 → 确定性但重复' },
      { icon: '🎲', text: 'Top-k', highlight: '只从前 k 个候选中选，k 越小越保守' },
      { icon: '🔮', text: 'Top-p (Nucleus)', highlight: '累积概率达 p 的最小集合中采样' },
      { icon: '🌡️', text: 'Temperature', highlight: 'T→0 趋近确定性，T→∞ 完全随机' },
    ],
    image: '/images/decoding_strategies.png',
    analogy: '🎭 招式选择的火候：T=0.1=精准控制，T=2.0=走火入魔随机出招',
    note: '实际使用 Top-p + Temperature 组合最常见',
  },

  {
    id: 'l0-json',
    type: 'content',
    layer: 0,
    title: '结构化输出：JSON & Tool Call',
    bullets: [
      { icon: '📋', text: 'JSON Schema 约束', highlight: '告诉模型"必须输出什么格式"' },
      { icon: '🚫', text: 'Constrained Decoding', highlight: 'Mask 过滤非法 token，置为 -inf' },
      { icon: '🔧', text: '解析执行', highlight: '提取 tool_name + args，实际调用 API' },
      { icon: '💬', text: '结果回传', highlight: '工具结果返回模型，生成最终自然语言回复' },
    ],
    image: '/images/tool_call_flow.png',
    analogy: '🎭 降龙十八掌招式：有固定 schema，按套路出招后实际打出去',
    note: '不是自由写作，是被 Mask 逼得只能输出 JSON',
  },

  // ==================== Layer 1 ====================
  {
    id: 'l1-tick',
    type: 'content',
    layer: 1,
    title: 'Runtime Tick + JMP：裸 Runtime 的心跳',
    bullets: [
      { icon: '⏱️', text: 'Tick', highlight: '每 N 毫秒一拍，检查 State 并执行' },
      { icon: '🔀', text: 'JMP 跳转', highlight: '不是函数调用，是 PC 级别的状态跳转' },
      { icon: '📊', text: 'State 机', highlight: 'idle → generate → tool → verify → idle' },
      { icon: '💾', text: 'Snapshot', highlight: '每 Tick 保存全息快照，支持 Rollback' },
    ],
    image: '/images/runtime_tick_jmp.png',
    analogy: '🎭 心跳/脉搏：每心跳一次检查战局 → 发现破绽 → JMP进攻 → 出招 → JMP防守',
    note: 'Agent 能"暂停/续跑"的根本 = State 可序列化',
  },

  {
    id: 'l1-channel',
    type: 'content',
    layer: 1,
    title: 'Channel 与 Memory：通信与记忆',
    bullets: [
      { icon: '📨', text: 'Channel', highlight: 'FIFO 队列，LLM↔Runtime↔Tool 异步通信' },
      { icon: '🧠', text: '短期记忆', highlight: 'Context Window —— 脑海，有限容量' },
      { icon: '📚', text: '长期记忆', highlight: 'Vector DB —— 密室墙上的武功图谱，RAG 检索' },
      { icon: '📝', text: 'Summarizer', highlight: '满了自动压缩摘要，腾出空间' },
    ],
    image: '/images/channel_memory.png',
    analogy: '🎭 信鸽传书：郭靖写纸条 → 黄蓉看 → 仆人执行 → 报告结果 → 黄蓉念给郭靖听',
    note: '不直接传递，全部走 Channel',
  },

  {
    id: 'l1-state',
    type: 'content',
    layer: 1,
    title: 'State：全息快照',
    bullets: [
      { icon: '📸', text: 'Snapshot', highlight: 'messages + tools + pendingTool + sessionID' },
      { icon: '🔐', text: 'Checksum', highlight: 'SHA256 防篡改' },
      { icon: '⏪', text: 'Rollback', highlight: '完整 State 替换，不是 diff' },
      { icon: '💾', text: '持久化', highlight: '存入 SQLite/Redis，随时恢复' },
    ],
    image: '/images/state_snapshot.png',
    analogy: '🎭 郭靖的脑海战局：黄蓉喊"停！记住局势，不行就退回重来"',
    note: 'Checkpoint = 存档点，Rollback = 读档',
  },

  {
    id: 'l1-decoding',
    type: 'content',
    layer: 1,
    title: 'Constrained Decoding：强制 JSON',
    bullets: [
      { icon: '🎭', text: '自由生成', highlight: '模型自由发挥 → 无法被程序解析' },
      { icon: '⛓️', text: '约束生成', highlight: 'Mask 过滤非法 token → 只剩合法 JSON' },
      { icon: '📐', text: 'JSON Schema', highlight: '预先定义输出结构，模型必须遵守' },
      { icon: '🎯', text: '训练配合', highlight: 'Function Calling FT 让 JSON 格式的 logits 分数高' },
    ],
    image: '/images/constrained_decoding.png',
    analogy: '🎭 黄蓉场外指点："下一招只能是亢龙有悔或飞龙在天"——其他招式全部封死',
    note: '模型不是"想"调用工具，是被 Mask 逼得只能输出 JSON',
  },

  // ==================== Layer 2 ====================
  {
    id: 'l2-arch',
    type: 'content',
    layer: 2,
    title: 'Agent OS 架构：四层金字塔',
    bullets: [
      { icon: '🛡️', text: 'Rule = 内核安全策略', highlight: 'Tick 前加载，ACL 检查' },
      { icon: '🔧', text: 'Skill = 动态链接库', highlight: 'dlopen 式按需加载，不常驻内存' },
      { icon: '👤', text: 'Agent = 进程', highlight: '独立 State 副本 + 独立 Tool Set' },
      { icon: '📋', text: 'Workflow = 进程调度器', highlight: '预编排的 JMP 地址链' },
    ],
    image: '/images/agent_os_arch.png',
    analogy: '🎭 江湖规矩 → 武功秘籍 → 武林高手 → 行军布阵图',
    note: '底层只能跑单轮对话，Agent OS 是可调度的操作系统',
  },

  {
    id: 'l2-pdca',
    type: 'content',
    layer: 2,
    title: 'PDCA：质量管理闭环',
    bullets: [
      { icon: '📐', text: 'PLAN', highlight: 'project-planner 设置 State.Goal' },
      { icon: '🔨', text: 'DO', highlight: 'Worker Agents Tick 驱动执行' },
      { icon: '🔍', text: 'CHECK', highlight: 'quality-inspector 独立审查 + 跑测试' },
      { icon: '✅', text: 'ACT', highlight: 'Checkpoint 提交 或 Rollback 回滚' },
    ],
    image: '/images/pdca_cycle.png',
    analogy: '🎭 郭靖练降龙十八掌：Plan(想招式) → Do(出招) → Check(打中没) → Act(调整再练)',
    note: '不是抽象管理术语，是 State 机的完整生命周期',
  },

  {
    id: 'l2-routing',
    type: 'content',
    layer: 2,
    title: 'Auto-Routing：中断向量表',
    bullets: [
      { icon: '🔑', text: '关键词哈希', highlight: '用户输入 → 提取关键词' },
      { icon: '📋', text: '查中断向量表', highlight: '报错→debugger / React→frontend / API→backend' },
      { icon: '🔀', text: 'JMP 到对应入口', highlight: '不是 if-else 链，是精确的 PC 跳转' },
      { icon: '🤖', text: 'Specialist Agent', highlight: '每个域有独立的专业 Agent 处理' },
    ],
    image: '/images/auto_routing.png',
    analogy: '🎭 江湖暗号：天王盖地虎 → 知道该找谁。关键词哈希 → 查表 → JMP到对应入口',
    note: '与底层 JMP 精确对应',
  },

  {
    id: 'l2-fork',
    type: 'content',
    layer: 2,
    title: 'Multi-Agent Fork：进程克隆',
    bullets: [
      { icon: '🐣', text: 'fork()', highlight: 'Orchestrator 克隆 State，创建 Specialist' },
      { icon: '📦', text: '独立 Tool Set', highlight: '每个 Agent 有独立的工具和技能' },
      { icon: '📨', text: 'Channel 汇总', highlight: '结果通过 FIFO 队列汇总给 Orchestrator' },
      { icon: '✅', text: 'Quality Gate', highlight: '最终提交前必须通过质量审查' },
    ],
    image: '/images/multi_agent_fork.png',
    analogy: '🎭 洪七公调度五绝：不自己打，fork() 创建各路高手，按 Workflow 指挥',
    note: 'Orchestrator = OS 内核，Agent = 用户进程',
  },

  // ==================== Layer 3 ====================
  {
    id: 'l3-scenes',
    type: 'content',
    layer: 3,
    title: '牛家村场景：四个故事理解 Agent',
    bullets: [
      { icon: '🏠', text: '牛家村密室', highlight: '训练与底层机制：Pre-training → SFT → RLHF → FT' },
      { icon: '⚔️', text: '对战梅超风', highlight: '推理与工具调用：Tick → JMP → Mask → Tool Call' },
      { icon: '🏰', text: '襄阳大战', highlight: '多 Agent 编排：Orchestrator → fork → Workflow → PDCA' },
      { icon: '⛰️', text: '华山论剑', highlight: 'Auto-Routing 与 Skill 加载：暗号 → 查表 → dlopen' },
    ],
    analogy: '🎭 用《射雕英雄传》的故事理解 Agent 全栈 —— 每个比喻都能点回技术实现',
    note: '点击"技术对应"可直接跳转到 Layer 1/2 的实现',
  },

  {
    id: 'l3-characters',
    type: 'content',
    layer: 3,
    title: '江湖人物志：谁是谁',
    bullets: [
      { icon: '🧑‍🌾', text: '郭靖 = LLM / 大模型', highlight: '内力深厚但需指令，本质=海量参数+概率分布' },
      { icon: '👩‍🎓', text: '黄蓉 = System Prompt / Runtime', highlight: '给指令、检查合规、加载 Skill、传递 Channel' },
      { icon: '👴', text: '洪七公 = Orchestrator / OS 内核', highlight: '不亲自出手，调度全局，fork() 创建高手' },
      { icon: '🐍', text: '欧阳锋 = Security Auditor', highlight: '审查漏洞、测试渗透、确保无硬编码密钥' },
      { icon: '🤪', text: '周伯通 = Function Calling Trainer', highlight: '逼郭靖背固定格式口诀 = 强制输出 JSON' },
      { icon: '⚔️', text: '丘处机 = Quality Inspector', highlight: '铁面无私，不通过则强制回滚' },
    ],
    analogy: '🎭 每个人物对应一个技术组件，每个场景对应一个系统侧面',
    note: '人物卡点击"技术对应"可直接跳转',
  },

  {
    id: 'l3-mapping',
    type: 'content',
    layer: 3,
    title: '完整映射表：技术 ↔ 江湖',
    bullets: [
      { icon: '0️⃣', text: 'Layer 0', highlight: '数据=情报网 / 标注=秘籍校对 / 梯度=内功修炼 / 解码=招式火候' },
      { icon: '1️⃣', text: 'Layer 1', highlight: 'Tick=心跳 / JMP=招式切换 / Channel=信鸽 / State=脑海战局 / Mask=黄蓉指点' },
      { icon: '2️⃣', text: 'Layer 2', highlight: 'Rule=江湖规矩 / Skill=武功秘籍 / Agent=高手 / Workflow=布阵图 / Routing=暗号' },
      { icon: '🎭', text: '核心思想', highlight: '每个技术概念都有对应的江湖故事，降低理解门槛' },
    ],
    analogy: '🎭 "听故事"比"看文档"更容易记住 —— 这就是 Layer 3 存在的意义',
    note: '完整的映射关系可在 Layer 3 详细查看',
  },

  // ==================== 结束页 ====================
  {
    id: 'end',
    type: 'end',
    layer: -1,
    title: '谢谢观看',
    subtitle: 'Agent 全栈机制深度解析',
    bullets: [
      { icon: '🔗', text: '项目：opencode + antigravity 源码解析' },
      { icon: '📖', text: '结构：4 层递进，20 个核心概念' },
      { icon: '🎭', text: '比喻：《射雕英雄传》牛家村江湖' },
      { icon: '⌨️', text: '快捷键：0/1/2/3 切换层，/ 搜索，P 进入 PPT 模式' },
    ],
    note: '按 Esc 退出 PPT 模式',
  },
];

export const totalSlides = pptSlides.length;
