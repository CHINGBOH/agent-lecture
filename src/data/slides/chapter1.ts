import type { Slide } from '../types'

// 第一章：内力觉醒 —— 深度学习革命（2006-2017）
// 悬念：5岁小孩能认出猫，顶尖程序员写10万行代码也做不到——为什么？
export const chapter1Slides: Slide[] = [
  {
    id: 'c1-cover',
    type: 'cover',
    chapter: 1,
    emoji: '⚡',
    title: '内力觉醒',
    subtitle: '深度学习革命 · 2006—2017',
    speakerNote: '从这里开始，AI 的故事真正变得有趣',
  },
  {
    id: 'c1-mystery',
    type: 'mystery',
    chapter: 1,
    title: '5岁小孩能秒认「猫」',
    question: '为什么顶尖程序员写了10万行规则，机器还是认不出来？',
    context: '2011年，ImageNet 挑战赛上，最好的计算机视觉系统识别错误率是 25%。人类错误率是 5%。差距大得像武林高手和武功废人。是什么在卡脖子？',
    emoji: '🐱',
  },
  {
    id: 'c1-concept-feature',
    type: 'concept',
    chapter: 1,
    title: '问题的根源：特征从哪来？',
    subtitle: '手工特征 vs 自动学习特征',
    bullets: [
      { icon: '✋', text: '手工特征时代', sub: '工程师手动设计：检测边缘、颜色直方图、HOG 描述子……费时费力效果差' },
      { icon: '❓', text: '现实的残酷', sub: '猫有几千种姿势、光照、角度，穷举不完' },
      { icon: '💡', text: '关键洞见', sub: '与其让人告诉机器「猫长什么样」，不如让机器自己从数百万张图片中「学」出来' },
      { icon: '🧠', text: '深度学习的本质', sub: '多层神经网络 = 自动的分层特征学习器：边缘→形状→部位→物体' },
    ],
    analogy: {
      character: '郭靖学武的故事',
      scene: '江南七怪手把手教郭靖每一招：左拳怎么出、右腿怎么踢……学了十几年，遇到对手一变招就不行了。直到洪七公让他在实战中自己领悟降龙十八掌的精髓——内力带动招式，举一反三。',
      insight: '手工特征 = 江南七怪教法：费劲但死板。深度学习 = 洪七公教法：自己领悟内力，自然泛化到所有招式。',
    },
  },
  {
    id: 'c1-concept-backprop',
    type: 'concept',
    chapter: 1,
    title: '反向传播：内力如何运转',
    subtitle: 'Hinton 1986 年的突破',
    bullets: [
      { icon: '➡️', text: '前向传播', sub: '输入数据，逐层计算，最终得到预测结果' },
      { icon: '📏', text: '计算误差', sub: '对比预测值与真实值，得到 Loss（损失）' },
      { icon: '⬅️', text: '反向传播', sub: '误差从输出层往回传，用链式法则计算每个权重的梯度' },
      { icon: '🔧', text: '梯度下降', sub: '按梯度方向微调权重，一点点减小误差，迭代数百万次' },
    ],
    diagram: `flowchart LR
    A[输入图片] -->|前向| B[第1层<br/>边缘检测]
    B -->|前向| C[第2层<br/>形状识别]
    C -->|前向| D[第3层<br/>部位识别]
    D -->|前向| E[预测:猫🐱]
    E -->|误差| F[Loss损失]
    F -->|反向传播| D
    F -->|反向传播| C
    F -->|反向传播| B`,
    analogy: {
      character: '气走小周天',
      scene: '内力运转要打通任督二脉：先从丹田出发（前向），遇到阻碍（误差），再反向疏通经脉（反向传播），循环往复，内力越来越深厚。',
      insight: '反向传播就是这个「反向疏通」的过程，是深度学习能训练多层网络的核心秘密。',
    },
  },
  {
    id: 'c1-comparison',
    type: 'comparison',
    chapter: 1,
    title: '深度学习为什么之前不行？三个关卡',
    before: [
      { icon: '💀', label: '梯度消失', value: '深层网络训练时，梯度越传越小，前几层几乎学不到东西' },
      { icon: '📦', label: '数据不够', value: 'ImageNet 之前没有百万级标注数据集，网络吃不饱' },
      { icon: '🐌', label: '算力不够', value: 'CPU 训练一个深度网络要几个月，根本不实用' },
    ],
    after: [
      { icon: '⚡', label: 'ReLU 激活函数', value: '2010年，简单粗暴：x>0 就输出x，否则输出0。梯度消失问题大幅缓解' },
      { icon: '🗄️', label: 'ImageNet 数据集', value: '120万张标注图片，14000类，给深度网络提供了充足的训练食材' },
      { icon: '🎮', label: 'GPU 并行计算', value: '显卡原来是给游戏设计的，结果完美适配矩阵运算，训练速度提升百倍' },
    ],
    emoji: '🔓',
  },
  {
    id: 'c1-timeline',
    type: 'timeline',
    chapter: 1,
    title: 'AlexNet 时刻：震惊整个武林',
    timeline: [
      { year: '2006', event: 'Hinton 重燃希望', detail: 'Hinton 发表深度信念网络，证明深层网络可以训练，AI 研究者重新聚集', icon: '🕯️', highlight: false },
      { year: '2009', event: 'ImageNet 诞生', detail: 'Fei-Fei Li 历时3年建成 ImageNet，120万张人工标注图片，深度学习的「粮草」', icon: '🗄️', highlight: false },
      { year: '2012', event: 'AlexNet 称霸', detail: 'Hinton 学生 Krizhevsky 用 GPU + 深度CNN，ImageNet 错误率从 26% 暴降到 15%，第二名 26%。整个领域震惊', icon: '💥', highlight: true },
      { year: '2014', event: 'GAN 诞生', detail: 'Goodfellow 发明生成对抗网络，AI 第一次能「创作」，不只是「识别」', icon: '🎨', highlight: false },
      { year: '2015', event: 'ResNet 突破', detail: '残差网络解决了更深层网络的训练问题，152层网络，错误率 3.57%，超过人类', icon: '🏆', highlight: true },
      { year: '2017', event: 'Transformer 到来', detail: 'Google 发表 Attention Is All You Need，一切即将改变……（下章揭晓）', icon: '📖', highlight: false },
    ],
  },
  {
    id: 'c1-concept-cnn',
    type: 'concept',
    chapter: 1,
    title: 'CNN vs RNN：眼功与耳力',
    subtitle: '两种不同的「感知内力」',
    bullets: [
      { icon: '👁️', text: 'CNN（卷积神经网络）= 眼功', sub: '扫描图片的局部区域，识别空间特征：边缘、纹理、形状' },
      { icon: '👂', text: 'RNN（循环神经网络）= 耳力', sub: '按顺序处理序列，有「记忆」，适合语言、时序数据' },
      { icon: '😵', text: 'RNN 的致命缺陷', sub: '序列太长就「健忘」：说到第100个字，前10个字的信息早已稀释殆尽' },
      { icon: '⏳', text: '训练慢', sub: '必须串行处理（下一步依赖上一步），无法并行，GPU 白白浪费' },
    ],
    diagram: `flowchart LR
    IMG[🖼️ 输入图像<br/>224x224x3] --> C1[卷积层<br/>Conv+ReLU<br/>边缘/纹理]
    C1 --> P1[池化层<br/>MaxPool /2]
    P1 --> C2[深层卷积<br/>Conv+ReLU<br/>形状/部件]
    C2 --> P2[池化层<br/>MaxPool /2]
    P2 --> FC[全连接层<br/>特征融合]
    FC --> OUT[🏷️ 分类输出<br/>1000类 Softmax]`,
    analogy: {
      character: '听琴辨位 vs 过目不忘',
      scene: '独孤求败的剑法，讲究「以静制动，以慢打快」——但如果对手说了100招，你只记得最近10招，前90招的规律你全错过了。这就是 RNN 的困境。',
      insight: '这个「健忘」问题，呼唤出了下一章的绝世秘籍：Attention 机制。',
    },
  },
  {
    id: 'c1-quote',
    type: 'quote',
    chapter: 1,
    quote: '我们不需要告诉机器「猫长什么样」。\n我们只需要给它足够多的猫的图片，然后问它：「你学到什么了？」',
    quoteAuthor: '— 深度学习的核心思想',
    emoji: '🧠',
  },
  {
    id: 'c1-summary',
    type: 'summary',
    chapter: 1,
    title: '第一章总结',
    subtitle: '内力觉醒：三把钥匙打开了深度学习',
    takeaways: [
      'ReLU + GPU + 大数据，三管齐下解锁了深层网络',
      '2012 年 AlexNet：错误率从 26% → 15%，震惊整个领域',
      '深度学习 = 自动学习分层特征，不需要手工设计',
      'RNN 的「健忘」问题还没解决——序列建模需要新武功',
      '下一章：2017年，一本改变历史的秘籍出现了……',
    ],
    emoji: '⚡',
  },
]
