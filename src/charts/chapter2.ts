import { makeTimeline, baseLayout, baseConfig, TEXT_COLOR, MUTED_COLOR, type ChartDef } from './theme'

// ch2 accent: #FFB74D (orange)
const A = '#FFB74D'

// ─── Timeline ────────────────────────────────────────────────────────────────
export const c2Timeline: ChartDef = makeTimeline([
  { year: 2017, label: 'Transformer', highlight: true },
  { year: 2018, label: 'BERT + GPT-1' },
  { year: 2020, label: 'GPT-3 震撼', highlight: true },
  { year: 2022, label: 'ChatGPT 发布', highlight: true },
  { year: 2023, label: 'GPT-4 + 百模战' },
  { year: 2024, label: '多模态时代', highlight: false },
], A)

// ─── Attention Heatmap ────────────────────────────────────────────────────────
// Uses scatter + large square markers (heatmap fill unreliable in basic-dist)
const tokens = ['我', '学', '会', '了', '注', '意', '力']
const attentionWeights = [
  [0.25, 0.08, 0.07, 0.05, 0.35, 0.12, 0.08],
  [0.10, 0.30, 0.20, 0.12, 0.10, 0.10, 0.08],
  [0.06, 0.12, 0.22, 0.08, 0.08, 0.18, 0.26],
  [0.08, 0.10, 0.20, 0.32, 0.10, 0.12, 0.08],
  [0.30, 0.08, 0.06, 0.10, 0.22, 0.15, 0.09],
  [0.05, 0.06, 0.10, 0.08, 0.18, 0.38, 0.15],
  [0.08, 0.10, 0.26, 0.10, 0.10, 0.18, 0.18],
]

// Flatten into scatter arrays
const _sx: string[] = [], _sy: string[] = [], _sv: number[] = [], _st: string[] = []
for (let r = 0; r < tokens.length; r++) {
  for (let c = 0; c < tokens.length; c++) {
    _sx.push(tokens[c])
    _sy.push(tokens[r])
    _sv.push(attentionWeights[r][c])
    _st.push(attentionWeights[r][c].toFixed(2))
  }
}

// Color interpolation: low → #1a3f6f (dark blue), high → #FF4500 (orange-red)
function _attnColor(v: number): string {
  // 3-stop: 0=#1a3f6f, 0.4=#CC7000, 1=#FF1A00
  if (v < 0.4) {
    const t = v / 0.4
    const r = Math.round(26 + t * (204 - 26))
    const g = Math.round(63 + t * (112 - 63))
    const b = Math.round(111 + t * (0 - 111))
    return `rgb(${r},${g},${b})`
  } else {
    const t = (v - 0.4) / 0.6
    const r = Math.round(204 + t * (255 - 204))
    const g = Math.round(112 + t * (26 - 112))
    const b = 0
    return `rgb(${r},${g},${b})`
  }
}

export const c2Attention: ChartDef = {
  data: [{
    type: 'scatter',
    mode: 'markers+text',
    x: _sx,
    y: _sy,
    text: _st,
    textfont: { size: 10, color: '#fff' },
    textposition: 'middle center',
    marker: {
      symbol: 'square',
      size: 58,
      color: _sv.map(_attnColor),
      line: { width: 1, color: 'rgba(255,255,255,0.12)' },
    },
    hoverinfo: 'none',
  }],
  layout: baseLayout({
    plot_bgcolor: '#0a1828',
    xaxis: {
      title: { text: '被关注的字（Key）', font: { size: 12, color: MUTED_COLOR } },
      showgrid: false, zeroline: false, tickfont: { size: 16 },
      categoryorder: 'array', categoryarray: tokens,
    },
    yaxis: {
      title: { text: '提问的字（Query）', font: { size: 12, color: MUTED_COLOR } },
      showgrid: false, zeroline: false, tickfont: { size: 16 },
      categoryorder: 'array', categoryarray: [...tokens].reverse(),
    },
    margin: { t: 16, b: 56, l: 56, r: 8 },
    annotations: [{
      x: 0.5, y: -0.18, xref: 'paper', yref: 'paper',
      text: '颜色越深 = 注意力权重越高',
      showarrow: false, font: { size: 11, color: MUTED_COLOR },
    }],
  }),
  config: baseConfig(),
}

// ─── Scaling Law ──────────────────────────────────────────────────────────────
const paramsCounts = [1e7, 3e7, 1e8, 3e8, 1e9, 3e9, 1e10, 1e11, 1e12]
const paramLabels  = ['10M', '30M', '100M', '300M', '1B', '3B', '10B', '100B', '1T']
// Power law loss ≈ C / N^α
const loss = paramsCounts.map(n => 3.5 * Math.pow(1e7 / n, 0.076))

const milestones = [
  { x: 1.5e9,   y: 3.5 * Math.pow(1e7 / 1.5e9, 0.076),   label: 'GPT-2 (1.5B)' },
  { x: 1.75e11, y: 3.5 * Math.pow(1e7 / 1.75e11, 0.076), label: 'GPT-3 (175B)' },
  { x: 1e12,    y: 3.5 * Math.pow(1e7 / 1e12, 0.076),    label: 'GPT-4 (~1T)' },
]

export const c2Scaling: ChartDef = {
  data: [
    {
      type: 'scatter', mode: 'lines', name: '规模定律曲线',
      x: paramsCounts, y: loss,
      line: { color: A, width: 3, shape: 'spline' },
      fill: 'tozeroy',
      fillcolor: A.replace('#', 'rgba(255,183,77,') + '0.08)',
    },
    {
      type: 'scatter', mode: 'markers+text',
      x: milestones.map(m => m.x),
      y: milestones.map(m => m.y),
      text: milestones.map(m => m.label),
      textposition: 'top right',
      textfont: { size: 12, color: TEXT_COLOR },
      marker: { size: 14, color: '#FF7043', line: { color: '#fff', width: 2 } },
      hoverinfo: 'none',
    },
  ],
  layout: baseLayout({
    xaxis: {
      type: 'log', title: { text: '模型参数量', font: { size: 12, color: MUTED_COLOR } },
      tickvals: paramsCounts, ticktext: paramLabels,
      showgrid: true, gridcolor: 'rgba(255,255,255,0.07)', zeroline: false,
      tickfont: { size: 10 },
    },
    yaxis: {
      title: { text: '预训练损失', font: { size: 12, color: MUTED_COLOR } },
      showgrid: true, gridcolor: 'rgba(255,255,255,0.07)', zeroline: false,
    },
    annotations: [{
      x: 0.5, y: 1.08, xref: 'paper', yref: 'paper',
      text: '参数越多，损失越低——规模就是力量',
      showarrow: false, font: { size: 12, color: MUTED_COLOR },
    }],
  }),
  config: baseConfig(),
}
