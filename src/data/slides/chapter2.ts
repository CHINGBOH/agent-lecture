import type { Slide } from '../types'

// 第二章：绝世秘籍 —— Transformer 与大语言模型（2017-2023）
// 悬念：GPT-2 写的文章已经像人了，为什么 GPT-3 突然「开窍」了？
export const chapter2Slides: Slide[] = [
  {
    id: 'c2-cover',
    type: 'cover',
    chapter: 2,
    emoji: '📖',
    title: '绝世秘籍',
    subtitle: 'Transformer 与大语言模型 · 2017—2023',
  },
  {
    id: 'c2-mystery',
    type: 'mystery',
    chapter: 2,
    title: 'GPT-2 写的文章已经以假乱真',
    question: 'GPT-3 只是更大了一些，为什么突然「开窍」，什么都会了？',
    context: 'GPT-2（2019）有 15 亿参数，能写文章，但不会做数学，不会翻译，不会写代码。GPT-3（2020）有 1750 亿参数，放大了 100 倍，突然就什么都会了，甚至没训练过的任务它也能做。这是魔法吗？',
    emoji: '🤯',
  },
  {
    id: 'c2-concept-attention',
    type: 'concept',
    chapter: 2,
    title: 'Attention 机制：解决 RNN 的健忘症',
    subtitle: '2014年的一个小想法，引发了一场革命',
    chart: 'c2-concept-attention',
    bullets: [
      { icon: '❓', text: '问题：这句话里「它」指什么？', sub: '「小明打了小红，因为它太烦了」——「它」指小红。RNN 到这里可能已经忘了「小红」' },
      { icon: '👁️', text: 'Attention 的想法', sub: '预测每个词时，给句子中所有其他词分配「注意力权重」，越相关权重越高' },
      { icon: '🔗', text: '直接连接', sub: '不再靠「传递记忆」，而是直接从任意位置「看」任意位置，没有距离限制' },
      { icon: '⚡', text: '可并行', sub: '所有位置同时计算，不用串行等待，GPU 可以全速运转' },
    ],
    analogy: {
      character: '郭靖全场扫描',
      scene: '华山论剑，郭靖面对多个对手。不是一个一个看（RNN串行），而是同时扫视全场，哪个威胁最大就重点关注（高注意力权重），哪个不重要就忽略（低权重）。',
      insight: 'Attention 机制让模型能像武林高手一样「同时感知全局」，不再被「记忆长度」卡住。',
    },
  },
  {
    id: 'c2-concept-transformer',
    type: 'concept',
    chapter: 2,
    title: 'Transformer：Attention Is All You Need',
    subtitle: '2017 年 Google 的一篇论文，改写了 AI 历史',
    bullets: [
      { icon: '📖', text: '论文标题即宣言', sub: '「注意力就是你所需要的一切」——抛弃 RNN，纯注意力机制构建模型' },
      { icon: '🔄', text: 'Multi-Head Attention', sub: '同时用多个「注意力头」看不同维度的关系：语法/语义/指代/位置……' },
      { icon: '🏗️', text: 'Encoder-Decoder', sub: 'Encoder 理解输入，Decoder 生成输出，两者通过 Attention 交互' },
      { icon: '📏', text: 'Position Encoding', sub: '纯 Attention 没有顺序感，加入位置编码，让模型知道「谁在哪个位置」' },
    ],
    diagram: `flowchart TD
    A[输入文本\n我爱北京] --> B[Tokenizer\n分词]
    B --> C[Embedding\n向量化]
    C --> D[位置编码]
    D --> E[Multi-Head\nAttention\n×12层]
    E --> F[FFN前馈网络]
    F --> G[输出向量]
    G --> H[预测下一个词]`,
  },
  {
    id: 'c2-comparison',
    type: 'comparison',
    chapter: 2,
    title: 'BERT vs GPT：两种截然不同的修炼路线',
    before: [
      { icon: '📚', label: 'BERT（Google, 2018）', value: '双向理解：同时看左边和右边的上下文，擅长「理解」任务' },
      { icon: '🎯', label: '代表任务', value: '问答、分类、命名实体识别——给一段话，问它「这句话什么意思」' },
      { icon: '🔍', label: '训练方式', value: '遮住句子中某些词，让模型猜出来（完形填空）' },
    ],
    after: [
      { icon: '✍️', label: 'GPT（OpenAI, 2018+）', value: '自回归生成：只看左边，一个词一个词往右预测，擅长「生成」任务' },
      { icon: '🚀', label: '代表任务', value: '写文章、写代码、回答问题——给个开头，让它续写' },
      { icon: '📈', label: '训练方式', value: '预测下一个词（语言模型），越做越大越强' },
    ],
    emoji: '⚔️',
    analogy: {
      character: '看书派 vs 写书派',
      scene: '同样是绝顶高手，黄蓉擅长快速看破对手招式（BERT：理解），杨过擅长临场发挥出奇制胜（GPT：生成）。两条路，各有所长。',
      insight: '后来证明：「写书派」GPT 走得更远，因为生成能力的天花板更高，能力涌现更惊人。',
    },
  },
  {
    id: 'c2-concept-scaling',
    type: 'concept',
    chapter: 2,
    title: 'Scaling Law：越大，越强，越神奇',
    subtitle: '量变引发质变——这不是玄学，这是规律',
    bullets: [
      { icon: '📏', text: 'Scaling Law（规模法则）', sub: 'OpenAI 2020 年发现：模型性能和参数量/数据量/算力呈幂律关系，可以预测' },
      { icon: '🌊', text: '涌现能力', sub: '小模型完全做不到，大模型突然就会了——这种「质变」叫 Emergent Abilities' },
      { icon: '📝', text: '典型涌现', sub: '少样本学习（GPT-3）、思维链推理（GPT-4）、代码生成——都是参数达到阈值后突然出现' },
      { icon: '💰', text: '代价', sub: 'GPT-3 训练一次 = 460万美元；GPT-4 = 数千万美元。智能是烧出来的' },
    ],
    analogy: {
      character: '九阳神功的境界',
      scene: '练九阳神功，前九层每天都在进步，但没有质变。到第十层，突然打通任督二脉，内力自动运转，举手投足皆是武功。GPT 的涌现就是这个"打通任督二脉"的时刻。',
      insight: '这就解答了开头的谜题：GPT-3 不只是"更大了一些"，而是越过了某个临界点，进入了新的能力层次。',
    },
  },
  {
    id: 'c2-timeline',
    type: 'timeline',
    chapter: 2,
    title: '通往 ChatGPT 的路',
    timeline: [
      { year: '2017', event: 'Transformer 论文', detail: 'Google Brain 发表「Attention Is All You Need」，Transformer 架构诞生', icon: '📖', highlight: true },
      { year: '2018', event: 'BERT + GPT-1', detail: 'Google BERT 和 OpenAI GPT-1 同年发布，NLP 进入预训练时代', icon: '🚀', highlight: false },
      { year: '2020', event: 'GPT-3', detail: '1750亿参数，震惊世界。Few-shot 学习，不需要微调就能做很多任务', icon: '💥', highlight: true },
      { year: '2022-03', event: 'InstructGPT', detail: 'OpenAI 用 RLHF 让 GPT-3 学会「听指令」，是 ChatGPT 的直接前身', icon: '🎯', highlight: false },
      { year: '2022-11', event: 'ChatGPT 发布', detail: '5天100万用户，2个月1亿用户。全世界第一次感受到了 AI 的力量', icon: '🌏', highlight: true },
      { year: '2023', event: 'GPT-4 + 百模大战', detail: 'GPT-4 多模态，Claude/Gemini/Llama/Qwen 群雄并起', icon: '⚔️', highlight: false },
    ],
  },
  {
    id: 'c2-quote',
    type: 'quote',
    chapter: 2,
    quote: '我们训练了一个语言模型，\n然后它突然开始推理了。\n这不是我们设计的，这是它自己长出来的。',
    quoteAuthor: '— OpenAI 研究员，谈 GPT-3 的涌现能力',
    emoji: '✨',
  },
  {
    id: 'c2-summary',
    type: 'summary',
    chapter: 2,
    title: '第二章总结',
    subtitle: '绝世秘籍：Transformer 一统江湖',
    takeaways: [
      'Attention 机制解决了 RNN 的健忘问题，可并行可长程',
      'Transformer（2017）是这场革命的起点：Attention Is All You Need',
      'GPT 路线（生成）比 BERT 路线（理解）走得更远',
      'Scaling Law：参数越大，能力越强，越过临界点出现涌现',
      'ChatGPT = GPT-3.5 + RLHF（人类反馈对齐）——下一章揭秘 RLHF',
    ],
    emoji: '📖',
  },
]
