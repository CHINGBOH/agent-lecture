import type { Slide } from '../types'

// 第四章：行走江湖 —— Agent 的历史与本质
// 悬念：ChatGPT 啥都知道，为什么让它查今天的天气，它不会？
export const chapter4Slides: Slide[] = [
  {
    id: 'c4-cover',
    type: 'cover',
    chapter: 4,
    emoji: '⚔️',
    title: '行走江湖',
    subtitle: 'AI Agent 的历史与本质',
  },
  {
    id: 'c4-mystery',
    type: 'mystery',
    chapter: 4,
    title: 'ChatGPT 无所不知',
    question: '为什么让它查「今天深圳天气」，它做不到？',
    context: 'ChatGPT 能写诗、写代码、解数学题，却不知道今天天气、不知道昨天的新闻、不能帮你发邮件、不能订机票。一个「什么都懂」的 AI，为什么这么多事情都「不会做」？',
    emoji: '🌤️',
  },
  {
    id: 'c4-comparison',
    type: 'comparison',
    chapter: 4,
    title: '知识 ≠ 行动能力',
    before: [
      { icon: '📚', label: '纯 LLM', value: '知识库：训练截止日前的互联网文本，冻结的' },
      { icon: '🧠', label: '能做什么', value: '推理、写作、分析、解释——都在「大脑」里完成' },
      { icon: '🚫', label: '不能做什么', value: '获取实时信息、执行动作、操控文件、与外部系统交互' },
    ],
    after: [
      { icon: '🤖', label: 'AI Agent', value: 'LLM 大脑 + 工具（搜索/代码执行/API调用）+ 记忆 + 规划' },
      { icon: '⚡', label: '能做什么', value: '查天气、写并运行代码、浏览网页、发邮件、订机票……' },
      { icon: '🔑', label: '关键差异', value: 'Agent 能「感知-思考-行动」循环，LLM 只能「输入-输出」' },
    ],
    emoji: '🔓',
    analogy: {
      character: '书生 vs 侠客',
      scene: '一个博览群书的书生，知道所有武功招式，却因为没有真刀实练，上了擂台什么都做不到。Agent = 书生 + 兵器 + 实战经验：有知识，有工具，能行动。',
      insight: 'LLM 是大脑，Agent 是整个人。',
    },
  },
  {
    id: 'c4-timeline',
    type: 'timeline',
    chapter: 4,
    title: 'Agent 的前世：AI 行动者的历史',
    timeline: [
      { year: '1966', event: 'ELIZA', detail: '第一个聊天机器人，靠模板匹配对话，让人以为在和真人说话。会说不会做。', icon: '💬', highlight: false },
      { year: '1972', event: 'MYCIN', detail: '斯坦福专家系统，能推断血液感染并推荐抗生素。有行动（建议）但规则写死。', icon: '🏥', highlight: false },
      { year: '1994', event: 'BDI Agent', detail: '信念-欲望-意图架构，第一次形式化了 Agent 的「思考结构」，影响深远', icon: '🧩', highlight: false },
      { year: '2000s', event: '游戏 AI', detail: '星际争霸、《Dota》的 AI Bot——在封闭环境中，Agent 能复杂规划和执行', icon: '🎮', highlight: false },
      { year: '2022', event: 'ReAct 论文', detail: 'Google：让 LLM 交替进行「推理（Reason）」和「行动（Act）」，首次系统化 LLM Agent', icon: '💡', highlight: true },
      { year: '2023', event: 'AutoGPT 爆红', detail: '第一个广泛传播的 LLM Agent 框架，虽然不稳定，但让大众看见了 Agent 的可能', icon: '🚀', highlight: true },
    ],
  },
  {
    id: 'c4-concept-react',
    type: 'concept',
    chapter: 4,
    title: 'ReAct：侠客的行事方式',
    subtitle: '想→做→看结果→再想——LLM Agent 的核心循环',
    bullets: [
      { icon: '💭', text: 'Thought（思考）', sub: '「我需要知道今天深圳的天气，应该调用天气 API」' },
      { icon: '⚡', text: 'Action（行动）', sub: '调用工具：weather_api("深圳")' },
      { icon: '👁️', text: 'Observation（观察）', sub: '工具返回：「深圳今日：晴，28°C，东风2级」' },
      { icon: '🔄', text: '再思考', sub: '「已经拿到结果了，现在可以回答用户了」' },
    ],
    diagram: `flowchart TD
    A[用户提问] --> B[💭 Thought\n分析问题，决定行动]
    B --> C[⚡ Action\n调用工具/API]
    C --> D[👁️ Observation\n获得工具结果]
    D --> E{目标达成?}
    E -->|否| B
    E -->|是| F[✅ 最终回答]`,
    analogy: {
      character: '郭靖行走江湖',
      scene: '郭靖接了个任务：找到欧阳锋。他不会直接冲过去，而是：「想」——欧阳锋可能在西域，「查」——去客栈打听消息，「看」——得知西毒上周去了桃花岛，「再想」——那去桃花岛。循环推进，直到找到人。',
      insight: 'ReAct 让 LLM 从「一问一答机器」变成「能自主推进任务的侠客」。',
    },
  },
  {
    id: 'c4-concept-memory',
    type: 'concept',
    chapter: 4,
    title: 'Agent 的记忆系统',
    subtitle: '没有记忆，行动就没有积累',
    bullets: [
      { icon: '🔤', text: '短期记忆（Context Window）', sub: '当前对话的全部内容，存在模型输入里。现代模型支持 100K-1M tokens' },
      { icon: '📝', text: '外部记忆（向量数据库）', sub: '把历史对话/文档转成向量存储，需要时检索相关片段放入 Context（RAG）' },
      { icon: '🗂️', text: '工具记忆（文件/数据库）', sub: 'Agent 可以把中间结果写入文件或数据库，下次任务继续使用' },
      { icon: '🧠', text: '模型权重（长期记忆）', sub: '训练阶段学到的知识，永久内化，但无法实时更新' },
    ],
    analogy: {
      character: '武林人士的记忆',
      scene: '黄蓉的记忆系统：脑子里（短期）记着今天要办的事；怀里秘籍（外部记忆）记着所有武功心法；武林档案馆（向量DB）查江湖人物；而她自幼修炼的聪明才智（权重）是改不了的。',
      insight: 'Agent 的强大，很大程度来自记忆架构的设计。记忆决定了它能「记住多少、调用多快」。',
    },
  },
  {
    id: 'c4-concept-tools',
    type: 'concept',
    chapter: 4,
    title: 'Tools：Agent 的十八般武器',
    subtitle: '工具把 LLM 从「书生」变成「侠客」',
    bullets: [
      { icon: '🔍', text: '搜索工具', sub: 'Google Search、Bing——获取实时信息，打破训练数据截止日期限制' },
      { icon: '💻', text: '代码执行', sub: 'Python Interpreter——不只是写代码，还能真正运行它，看结果' },
      { icon: '🌐', text: 'Browser（浏览器）', sub: '打开网页、点击按钮、填写表单——能操控真实的互联网' },
      { icon: '📁', text: '文件系统', sub: '读写文件——有了持久化存储，任务可以分步完成' },
      { icon: '📡', text: 'API 调用', sub: '发邮件、查天气、订机票、发推文——接入所有外部服务' },
    ],
    analogy: {
      character: '十八般武器',
      scene: '一个武林高手，单靠拳脚能做的有限。配上长剑（搜索）、暗器（代码）、望远镜（浏览器）、口袋（文件）、信鸽（API），能做的事情指数级增加。',
      insight: '工具是 Agent 的手和脚。LLM 是大脑，工具是四肢。',
    },
  },
  {
    id: 'c4-quote',
    type: 'quote',
    chapter: 4,
    quote: '语言模型是一个很好的推理引擎，\n但它需要工具才能真正与世界交互。\nAgent = 推理 + 行动 + 记忆。',
    quoteAuthor: '— ReAct 论文，Google Brain 2022',
    emoji: '⚔️',
  },
  {
    id: 'c4-summary',
    type: 'summary',
    chapter: 4,
    title: '第四章总结',
    subtitle: '行走江湖：从会说话到能做事',
    takeaways: [
      'LLM ≠ Agent：LLM 是大脑，Agent = 大脑 + 工具 + 记忆 + 规划',
      'ReAct 循环：Thought → Action → Observation → 再 Thought',
      '工具是 Agent 的四肢：搜索、代码、浏览器、文件、API',
      '记忆架构：短期（Context）+ 外部（向量DB）+ 工具（文件）+ 内化（权重）',
      '下一章：今天的 Agent 能做什么？能做到什么程度？',
    ],
    emoji: '⚔️',
  },
]
