import { makeTimeline, type ChartDef } from './theme'

// ch4 accent: #81C784 (green)
const A = '#81C784'

export const c4Timeline: ChartDef = makeTimeline([
  { year: 1966, label: 'ELIZA' },
  { year: 1972, label: 'MYCIN' },
  { year: 1994, label: 'BDI Agent' },
  { year: 2003, label: '游戏 AI' },
  { year: 2016, label: 'AlphaGo', highlight: true },
  { year: 2022, label: 'ReAct 论文', highlight: true },
  { year: 2023, label: 'AutoGPT 爆红', highlight: true },
  { year: 2024, label: 'Agentic AI', highlight: false },
], A)
