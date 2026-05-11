// ─────────────────────────────────────────────────────────────────────────────
// Chart theme helpers — dark, transparent background, high-contrast labels
// ─────────────────────────────────────────────────────────────────────────────

export interface ChartDef {
  data: object[]
  layout: object
  config?: object
}

const TRANSPARENT = 'rgba(0,0,0,0)'
export const TEXT_COLOR = '#e8eaf6'
export const MUTED_COLOR = 'rgba(232,234,246,0.55)'
const FONT = '"Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'

export function baseLayout(overrides: object = {}): object {
  return {
    paper_bgcolor: TRANSPARENT,
    plot_bgcolor: TRANSPARENT,
    font: { family: FONT, color: TEXT_COLOR, size: 13 },
    margin: { t: 24, b: 32, l: 48, r: 24 },
    autosize: true,
    showlegend: false,
    ...overrides,
  }
}

export function baseConfig(): object {
  return {
    responsive: true,
    displayModeBar: false,
    staticPlot: true,
  }
}

// ─── Timeline builder ─────────────────────────────────────────────────────────

export interface TimelineEvent {
  year: number
  label: string
  highlight?: boolean
}

export function makeTimeline(events: TimelineEvent[], accent: string): ChartDef {
  const years = events.map(e => e.year)
  const minY = Math.min(...years)
  const maxY = Math.max(...years)
  const pad = (maxY - minY) * 0.06

  // Alternate above / below the baseline
  const offsets = events.map((_, i) => (i % 2 === 0 ? 0.6 : -0.6))
  const textpos = events.map((_, i) => (i % 2 === 0 ? 'top center' : 'bottom center'))

  const shapes: object[] = [
    // Horizontal baseline
    {
      type: 'line',
      x0: minY - pad, x1: maxY + pad, y0: 0, y1: 0,
      line: { color: accent + 'AA', width: 2 },
    },
    // Vertical connector lines
    ...events.map((e, i) => ({
      type: 'line',
      x0: e.year, x1: e.year, y0: 0, y1: offsets[i] * 0.92,
      line: { color: accent + '60', width: 1, dash: 'dot' },
    })),
  ]

  return {
    data: [
      {
        type: 'scatter',
        mode: 'markers+text',
        x: years,
        y: offsets,
        text: events.map(e => `<b>${e.label}</b>`),
        textposition: textpos,
        marker: {
          size: events.map(e => (e.highlight ? 18 : 13)),
          color: events.map(e => (e.highlight ? accent : accent + '99')),
          line: { color: '#fff', width: 2 },
          symbol: events.map(e => (e.highlight ? 'star' : 'circle')),
        },
        textfont: { size: 12, color: TEXT_COLOR, family: FONT },
        hoverinfo: 'none',
      },
      {
        // Year labels at baseline
        type: 'scatter',
        mode: 'text',
        x: years,
        y: events.map((_, i) => (i % 2 === 0 ? -0.15 : 0.15)),
        text: years.map(String),
        textfont: { size: 10, color: accent + 'DD', family: FONT },
        hoverinfo: 'none',
      },
    ],
    layout: baseLayout({
      xaxis: {
        showgrid: false, zeroline: false, showticklabels: false,
        range: [minY - pad * 2, maxY + pad * 2],
      },
      yaxis: {
        showgrid: false, zeroline: false, showticklabels: false,
        range: [-0.78, 0.78], fixedrange: true,
      },
      shapes,
      margin: { t: 16, b: 14, l: 10, r: 10 },
    }),
    config: baseConfig(),
  }
}
