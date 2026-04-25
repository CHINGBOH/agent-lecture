import { makeTimeline, type ChartDef } from './theme'

// ch0 accent: #D4A843 (gold)
const A = '#D4A843'

export const pTimeline: ChartDef = makeTimeline([
  { year: 1950, label: '图灵提问', highlight: false },
  { year: 1956, label: 'AI 诞生' },
  { year: 1969, label: '感知器困境', highlight: true },
  { year: 1986, label: '反向传播', highlight: false },
  { year: 1997, label: 'Deep Blue' },
  { year: 2006, label: '深度学习复兴', highlight: false },
  { year: 2012, label: 'AlexNet 震撼', highlight: true },
  { year: 2017, label: 'Transformer', highlight: true },
  { year: 2022, label: 'ChatGPT 爆发', highlight: true },
], A)
