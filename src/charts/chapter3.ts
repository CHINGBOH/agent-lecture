import { baseLayout, baseConfig, TEXT_COLOR, MUTED_COLOR, type ChartDef } from './theme'

// ch3 accent: #CE93D8 (purple)
const A = '#CE93D8'

// ─── RL training reward chart ─────────────────────────────────────────────────
const episodes = Array.from({ length: 80 }, (_, i) => i + 1)

const rng = (seed: number) => {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

const rand = rng(7)
// Random policy: noisy low reward
const randomReward = episodes.map(() => (rand() - 0.5) * 20 - 10)
// RL policy: starts low, gradually improves with noise
const rlReward = episodes.map(e => {
  const base = -20 + 40 * (1 - Math.exp(-e / 18))
  return base + (rand() - 0.5) * 8
})

export const c3Rl: ChartDef = {
  data: [
    {
      type: 'scatter', mode: 'lines', name: '随机策略（无学习）',
      x: episodes, y: randomReward,
      line: { color: 'rgba(255,255,255,0.3)', width: 1.5, dash: 'dot' },
    },
    {
      type: 'scatter', mode: 'lines', name: 'RL 智能体学习中',
      x: episodes, y: rlReward,
      line: { color: A, width: 2.5, shape: 'spline', smoothing: 0.6 },
    },
  ],
  layout: baseLayout({
    showlegend: true,
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.1, font: { size: 12, color: TEXT_COLOR } },
    xaxis: { title: { text: '训练回合 (Episode)', font: { size: 11, color: MUTED_COLOR } }, showgrid: false, zeroline: false },
    yaxis: { title: { text: '累计奖励', font: { size: 11, color: MUTED_COLOR } }, showgrid: true, gridcolor: 'rgba(255,255,255,0.07)', zeroline: true, zerolinecolor: 'rgba(255,255,255,0.2)' },
    annotations: [
      { x: 30, y: rlReward[29], text: '开始学会策略', showarrow: true, arrowhead: 2, arrowcolor: A + 'BB', font: { size: 11, color: TEXT_COLOR }, bgcolor: 'rgba(0,0,0,0.5)' },
      { x: 65, y: rlReward[64], text: '策略收敛', showarrow: true, arrowhead: 2, arrowcolor: A + 'BB', font: { size: 11, color: TEXT_COLOR }, bgcolor: 'rgba(0,0,0,0.5)' },
    ],
  }),
  config: baseConfig(),
}

// ─── RLHF preference comparison ───────────────────────────────────────────────
const aspects = ['有帮助', '无害', '诚实', '语气', '逻辑性', '综合评分']
const beforeRlhf = [3.1, 2.8, 3.5, 3.0, 3.2, 2.9]
const afterRlhf  = [4.7, 4.8, 4.5, 4.6, 4.4, 4.7]

export const c3Rlhf: ChartDef = {
  data: [
    {
      type: 'bar', name: 'RLHF 之前',
      x: aspects, y: beforeRlhf,
      marker: { color: 'rgba(206,147,216,0.45)' },
      text: beforeRlhf.map(v => v.toFixed(1)),
      textposition: 'outside', textfont: { size: 11, color: '#CE93D8' },
    },
    {
      type: 'bar', name: 'RLHF 之后',
      x: aspects, y: afterRlhf,
      marker: { color: '#CE93D8' },
      text: afterRlhf.map(v => v.toFixed(1)),
      textposition: 'outside', textfont: { size: 11, color: '#fff' },
    },
  ],
  layout: baseLayout({
    barmode: 'group',
    showlegend: true,
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.1, font: { size: 12, color: TEXT_COLOR } },
    xaxis: { showgrid: false, zeroline: false, tickfont: { size: 11 } },
    yaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.08)', zeroline: false, range: [0, 5.8], showticklabels: false },
    annotations: [{ x: 0.5, y: -0.18, xref: 'paper', yref: 'paper', text: '人类评估评分（1-5分）', showarrow: false, font: { size: 11, color: MUTED_COLOR } }],
  }),
  config: baseConfig(),
}
