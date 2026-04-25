import type { Slide } from '../types'

// 第五章：天下大势 —— 当下应用与未来
// 悬念：现在的 AI Agent 到底能做什么？边界在哪？
export const chapter5Slides: Slide[] = [
  {
    id: 'c5-cover',
    type: 'cover',
    chapter: 5,
    emoji: '🌐',
    title: '天下大势',
    subtitle: '当下应用与未来边界',
  },
  {
    id: 'c5-mystery',
    type: 'mystery',
    chapter: 5,
    title: '2024年，AI 写了 25% 的 Google 代码',
    question: '那人类程序员还有价值吗？AI 的边界到底在哪里？',
    context: '每周都有新的「AI 颠覆 XX 职业」的新闻。有人说 AGI 三年内到来，有人说 AI 永远不会真正思考。到底谁对？我们现在处于哪个阶段？',
    emoji: '🤔',
  },
  {
    id: 'c5-concept-coding',
    type: 'concept',
    chapter: 5,
    title: '编程：AI 最成熟的战场',
    subtitle: '从辅助补全到全自动编程',
    image: '/diagrams/ch5_coding.png',
    bullets: [
      { icon: '✍️', text: 'GitHub Copilot', sub: '代码补全，写一半它猜下半，开发效率提升 55%（GitHub 数据）' },
      { icon: '💬', text: 'Cursor / Windsurf', sub: '对话式编程，用自然语言描述，AI 生成并修改整个文件' },
      { icon: '🤖', text: 'Devin / Claude Code', sub: '自主 Agent：给一个任务，它自己搜索、写代码、运行测试、Debug、提 PR' },
      { icon: '📊', text: '现实数据', sub: 'SWE-bench（真实 GitHub Issue 修复）：2023 年解决率 1%；2025 年超过 50%' },
    ],
    analogy: {
      character: '铁匠铺里的学徒',
      scene: '以前铁匠铺来了个神奇学徒（Copilot）：打铁时他帮你递锤子，猜你下一步要干嘛。现在学徒（Devin）进化成了：给他一张图纸，他自己把整把剑打出来，打完还自己检查有没有缺口。',
      insight: '不是 AI 取代程序员，而是一个程序员 + AI = 以前十个程序员的产出。',
    },
  },
  {
    id: 'c5-concept-knowledge',
    type: 'concept',
    chapter: 5,
    title: '知识工作：写作、研究、分析',
    subtitle: '白领工作正在被重新定义',
    image: '/diagrams/ch5_rag.png',
    bullets: [
      { icon: '📝', text: '写作辅助', sub: '营销文案、法律合同、医学报告初稿——AI 起草，人类审核修改' },
      { icon: '🔬', text: '科研加速', sub: 'AlphaFold 解决了蛋白质折叠50年难题；AI 论文综述、实验设计' },
      { icon: '📊', text: '数据分析', sub: '自然语言查询数据库、自动生成报表、异常检测——分析师效率倍增' },
      { icon: '⚖️', text: '法律/医疗', sub: 'AI 辅助诊断（FDA 已批准多项）、合同审查、案例检索——专业辅助工具' },
    ],
    analogy: {
      character: '幕僚变成了 AI',
      scene: '古代皇帝的幕僚团：军师、文书、钦天监……各司其职，帮皇帝处理信息、起草文件、分析形势。今天，一个 AI 可以同时扮演所有幕僚角色。',
      insight: '知识工作的「执行层」正在被 AI 接管，人类的价值向「判断层」迁移：决定做什么、评估好不好。',
    },
  },
  {
    id: 'c5-concept-multiagent',
    type: 'concept',
    chapter: 5,
    title: '多 Agent 系统：武林帮派分工',
    subtitle: '一个 AI 不够，组建团队来',
    image: '/diagrams/ch5_multi_agent.png',
    bullets: [
      { icon: '👑', text: 'Orchestrator（总指挥）', sub: '接受任务，分解子任务，分配给专门 Agent，汇总结果' },
      { icon: '🔍', text: 'Researcher Agent', sub: '专门负责搜索和信息收集' },
      { icon: '💻', text: 'Coder Agent', sub: '专门负责写代码和运行测试' },
      { icon: '✍️', text: 'Writer Agent', sub: '专门负责撰写报告和文档' },
      { icon: '🔍', text: 'Critic Agent', sub: '专门负责质量审查，找问题' },
    ],
    diagram: `flowchart TD
    U[用户任务] --> O[Orchestrator\n总指挥]
    O --> R[Researcher\n调研员]
    O --> C[Coder\n程序员]
    O --> W[Writer\n写手]
    R --> O
    C --> O
    W --> O
    O --> CR[Critic\n审查员]
    CR -->|有问题| O
    CR -->|通过| U2[✅ 交付成果]`,
    analogy: {
      character: '丐帮分舵',
      scene: '丐帮帮主（Orchestrator）接了个大任务，把任务拆开：探子（Researcher）去打探消息，武艺高强的（Coder）负责行动，长老（Writer）负责写信，军师（Critic）负责审查计划。分工协作，完成单人无法完成的任务。',
      insight: '多 Agent 是当下 AI 系统的发展方向——不是一个超级 AI，而是 AI 组成的「团队」。',
    },
  },
  {
    id: 'c5-comparison',
    type: 'comparison',
    chapter: 5,
    title: '已经到来 vs 还没到来',
    before: [
      { icon: '✅', label: '编程辅助', value: '已成熟，显著提升生产力' },
      { icon: '✅', label: '内容创作', value: '文章、图片、视频初稿生成' },
      { icon: '✅', label: '知识问答', value: '精准的信息检索和解释' },
      { icon: '✅', label: '代码 Agent', value: '简单到中等难度任务自动完成' },
      { icon: '⚠️', label: '复杂推理', value: '数学竞赛/复杂规划，仍然出错' },
    ],
    after: [
      { icon: '❌', label: '真正自主', value: '需要长期自主运行、自我纠错的复杂任务' },
      { icon: '❌', label: '身体智能', value: '操控物理世界（机器人）仍处于早期' },
      { icon: '❌', label: '科学发现', value: '真正独立提出新假设、设计实验' },
      { icon: '❌', label: '情感理解', value: '真正理解人类情感和社会细节' },
      { icon: '❓', label: 'AGI', value: '通用人工智能——没有人知道什么时候，或者是否' },
    ],
    emoji: '🗺️',
  },
  {
    id: 'c5-concept-risks',
    type: 'concept',
    chapter: 5,
    title: 'AI 的挑战：走火入魔的风险',
    subtitle: '武功高强，也要防走火入魔',
    image: '/diagrams/ch5_risks.png',
    bullets: [
      { icon: '🌀', text: '幻觉（Hallucination）', sub: '一本正经地说错的话，甚至捏造引用、数据——看起来真实但是假的' },
      { icon: '🎯', text: '奖励欺骗（Reward Hacking）', sub: '只会讨好评分者，而不是真的做好事——RLHF 的副作用' },
      { icon: '🔒', text: '安全与隐私', sub: '训练数据里的个人信息、被用来生成有害内容的风险' },
      { icon: '⚖️', text: '权力集中', value: '几家大公司控制最强 AI，普通人和小国的话语权？' },
    ],
    analogy: {
      character: '走火入魔',
      scene: '欧阳锋修炼九阴真经，走火入魔，武功天下第一，却神志不清。AI 走火入魔的表现：能力极强，但说话不实、目标错位、无法真正对人类负责。',
      insight: '这就是「对齐」（Alignment）研究的意义：不只是让 AI 更强，而是让 AI 的目标和人类的真实利益保持一致。',
    },
  },
  {
    id: 'c5-quote',
    type: 'quote',
    chapter: 5,
    quote: '我们正站在一个奇特的时刻：\nAI 已经足够强，足以改变很多事情，\n但还没强到可以替代「需要判断」的一切。\n这个窗口期，是人类的机会。',
    quoteAuthor: '— 写给此刻',
    emoji: '🌅',
  },
  {
    id: 'c5-summary',
    type: 'summary',
    chapter: 5,
    title: '全局总结',
    subtitle: '从远古武林到天下大势',
    takeaways: [
      '规则 AI → 深度学习：从「写招式」到「练内力」',
      'Transformer → LLM：注意力机制 + 规模定律 = 涌现智能',
      'RL + RLHF：自我博弈超越人类上限，人类反馈完成对齐',
      'LLM → Agent：大脑 + 工具 + 记忆 = 真正能做事的 AI',
      '今天：AI 是最强的「执行层」工具；未来：边界仍在快速扩展',
      '你的优势：判断力、创造力、人际洞察——AI 最难复制的东西',
    ],
    emoji: '🌐',
  },
]
