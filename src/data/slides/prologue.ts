import type { Slide } from '../types'

// 序章：远古武林 —— AI 的史前文明（1950-2010）
// 叙事弧：Deep Blue 赢了国际象棋，为什么还是「蠢」的？
export const prologueSlides: Slide[] = [
  {
    id: 'p-cover',
    type: 'cover',
    chapter: 0,
    emoji: '📜',
    title: '远古武林',
    subtitle: 'AI 的史前文明 · 1950—2010',
    speakerNote: '从这里开始，整个 AI 江湖的故事',
  },
  {
    id: 'p-mystery',
    type: 'mystery',
    chapter: 0,
    title: '1997年，Deep Blue 赢了国际象棋世界冠军',
    question: '那为什么，它连「猫和狗的区别」都不知道？',
    context: '一台能击败人类最强棋手的机器，却看不懂一张小孩都能秒懂的图片。这不是 bug，这是那个时代 AI 的根本困境。',
    emoji: '♟️',
  },
  {
    id: 'p-timeline',
    type: 'timeline',
    chapter: 0,
    title: 'AI 江湖的兴衰史',
    subtitle: '两起两落，跌宕七十年',
    image: '/diagrams/ch0_timeline.png',
    timeline: [
      { year: '1950', event: '图灵提问', detail: '艾伦·图灵发表《计算机器与智能》，提出图灵测试，人类第一次严肃地问：机器能思考吗？', icon: '🤔', highlight: false },
      { year: '1956', event: '达特茅斯会议', detail: '"人工智能"这个词正式诞生。一群科学家相信，20年内就能造出像人一样的机器。', icon: '🎯', highlight: false },
      { year: '1965-1985', event: '第一次繁荣', detail: '专家系统横空出世，MYCIN 能诊断血液病，DENDRAL 能分析化学结构。资本疯狂涌入。', icon: '🌅', highlight: false },
      { year: '1987', event: '第一次 AI 寒冬', detail: '专家系统维护成本爆炸，规则越写越多越出错。投资人撤资，实验室关门。', icon: '❄️', highlight: true },
      { year: '1997', event: 'Deep Blue 称雄', detail: 'IBM Deep Blue 以 3.5:2.5 击败卡斯帕罗夫。全世界震惊——但这台机器靠的是暴力穷举，每秒算 2 亿步棋。', icon: '♟️', highlight: true },
      { year: '2000s', event: '第二次寒冬', detail: '神经网络被证明训练不了深层的。机器学习各家各派，没有统一突破。资本再次离场。', icon: '❄️', highlight: false },
    ],
  },
  {
    id: 'p-comparison',
    type: 'comparison',
    chapter: 0,
    title: '专家系统：招式多，没有内力',
    before: [
      { icon: '📋', label: '规则驱动', value: '用 IF-THEN 规则描述知识，写了 50万条规则的 MYCIN' },
      { icon: '🎯', label: '能做什么', value: '在特定领域表现极好，甚至超过专科医生' },
      { icon: '😤', label: '遇到新问题', value: '完全崩溃，没有对应规则就不知道怎么办' },
    ],
    after: [
      { icon: '🧠', label: '本质', value: '人类把知识「写」进机器，机器只是查表' },
      { icon: '💔', label: '致命缺陷', value: '现实世界无穷多种情况，规则永远写不完' },
      { icon: '🔑', label: '缺少的东西', value: '泛化能力——从有限样本推断无限情况的能力' },
    ],
    emoji: '🤖',
    analogy: {
      character: '只会招式册的武功',
      scene: '想象一个武林高手，武功秘籍背了一万招，遇到书上没有的奇招就完全不知道怎么应对。',
      insight: 'Deep Blue 就是这样——它把国际象棋所有局面都算遍了，换个游戏，它什么都不会。这不是智能，这是暴力。',
    },
  },
  {
    id: 'p-concept-nn',
    type: 'concept',
    chapter: 0,
    title: '神经网络的雏形：感知机（1958）',
    subtitle: '天才的直觉，被时代埋没的答案',
    image: '/diagrams/ch0_perceptron.png',
    bullets: [
      { icon: '🧬', text: '受大脑神经元启发', sub: 'Frank Rosenblatt 发明感知机，模仿神经元的「激活」机制' },
      { icon: '✅', text: '能学习简单规律', sub: '通过调整权重，自动找到分类边界，不需要手写规则' },
      { icon: '💀', text: 'XOR 困境（1969）', sub: 'Minsky 证明感知机无法解决 XOR 问题，研究资金被切断' },
      { icon: '🌱', text: '种子已埋下', sub: '多层感知机的想法存在，但没有高效训练方法' },
    ],
    analogy: {
      character: '天赋异禀的少年',
      scene: '有个少年，天生就有习武的潜质，大家都说他将来必成大器。结果被人说"你连这个简单动作都做不到"，整个武林就放弃他了。',
      insight: '三十年后，大家才发现——不是他不行，是当时没有好的训练方法。感知机的失败不是终点，是深度学习革命的起点。',
    },
  },
  {
    id: 'p-quote',
    type: 'quote',
    chapter: 0,
    quote: '我们那时候以为，只要把知识给机器，机器就会思考。\n后来才明白，真正的智能不是「知道」，而是「学会怎么学」。',
    quoteAuthor: '— 一位 AI 寒冬的亲历者',
    emoji: '💬',
  },
  {
    id: 'p-summary',
    type: 'summary',
    chapter: 0,
    title: '序章总结',
    subtitle: '远古武林的教训',
    takeaways: [
      '规则 AI 是「招式」，没有「内力」——遇到新情况就破功',
      'Deep Blue 的胜利是暴力穷举，不是真正的智能',
      '神经网络的想法早在 1958 年就有了，差的只是训练方法',
      '两次 AI 寒冬都在告诉我们：缺少的是泛化能力',
      '下一章：一个突破性的发现，改变了一切……',
    ],
    emoji: '📜',
  },
]
