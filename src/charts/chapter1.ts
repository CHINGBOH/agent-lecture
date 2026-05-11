import { makeTimeline, baseLayout, baseConfig, TEXT_COLOR, MUTED_COLOR, type ChartDef } from './theme'

// ch1 accent: #4FC3F7 (light blue)
const A = '#4FC3F7'

// ─── Timeline ────────────────────────────────────────────────────────────────
export const c1Timeline: ChartDef = makeTimeline([
  { year: 2006, label: 'Hinton 重燃希望' },
  { year: 2009, label: 'ImageNet 数据集' },
  { year: 2012, label: 'AlexNet 称霸', highlight: true },
  { year: 2014, label: 'GAN 诞生' },
  { year: 2015, label: 'ResNet 超越人类', highlight: true },
  { year: 2017, label: 'Transformer 到来', highlight: true },
], A)

// ─── Feature Engineering vs Deep Learning (grouped bar) ──────────────────────
const categories = ['数据需求', '专家知识', '训练时间', '准确率', '泛化能力', '可解释性']
const featureEngValues = [2, 5, 2, 3, 2, 5]
const deepLearnValues  = [5, 1, 4, 5, 5, 2]

export const c1Feature: ChartDef = {
  data: [
    {
      type: 'bar',
      name: '传统特征工程',
      x: categories,
      y: featureEngValues,
      marker: { color: '#64B5F6CC' },
      text: featureEngValues.map(String),
      textposition: 'outside',
      textfont: { color: '#90CAF9', size: 12 },
    },
    {
      type: 'bar',
      name: '深度学习',
      x: categories,
      y: deepLearnValues,
      marker: { color: '#FFB74DCC' },
      text: deepLearnValues.map(String),
      textposition: 'outside',
      textfont: { color: '#FFCC80', size: 12 },
    },
  ],
  layout: baseLayout({
    barmode: 'group',
    showlegend: true,
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.08, font: { size: 12, color: TEXT_COLOR } },
    xaxis: { showgrid: false, zeroline: false, tickfont: { size: 11 } },
    yaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.08)', zeroline: false, range: [0, 6.5], showticklabels: false },
    margin: { t: 48, b: 40, l: 10, r: 10 },
  }),
  config: baseConfig(),
}

// ─── Backprop: training loss curve ───────────────────────────────────────────
const epochs = Array.from({ length: 50 }, (_, i) => i + 1)
// Simulated loss curves (exponential decay + noise)
const rng = (seed: number) => {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}
const rand1 = rng(42)
const trainLoss = epochs.map(e => 2.5 * Math.exp(-e / 12) + 0.18 + (rand1() - 0.5) * 0.06)
const rand2 = rng(99)
const valLoss   = epochs.map(e => 2.5 * Math.exp(-e / 15) + 0.28 + (rand2() - 0.5) * 0.09)

export const c1Backprop: ChartDef = {
  data: [
    {
      type: 'scatter', mode: 'lines', name: '训练损失',
      x: epochs, y: trainLoss,
      line: { color: A, width: 2.5, shape: 'spline', smoothing: 0.8 },
    },
    {
      type: 'scatter', mode: 'lines', name: '验证损失',
      x: epochs, y: valLoss,
      line: { color: '#FFB74D', width: 2, dash: 'dot', shape: 'spline', smoothing: 0.8 },
    },
  ],
  layout: baseLayout({
    showlegend: true,
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.08, font: { size: 12, color: TEXT_COLOR } },
    xaxis: { title: { text: '训练轮次 (Epoch)', font: { size: 11, color: MUTED_COLOR } }, showgrid: false, zeroline: false },
    yaxis: { title: { text: '损失值', font: { size: 11, color: MUTED_COLOR } }, showgrid: true, gridcolor: 'rgba(255,255,255,0.07)', zeroline: false },
    annotations: [{
      x: 10, y: trainLoss[9],
      text: '梯度下降<br>收敛中…',
      showarrow: true, arrowhead: 2, arrowcolor: A + 'CC',
      font: { size: 11, color: TEXT_COLOR },
      bgcolor: 'rgba(0,0,0,0.5)',
    }],
  }),
  config: baseConfig(),
}
