import { useRef, useEffect } from 'react'
import type { ChartDef } from '../charts'

// Use vanilla Plotly.js API to avoid react-plotly.js CJS/ESM interop issues in Vite
// @ts-ignore — no TS declarations for the minified dist bundle
import Plotly from 'plotly.js-basic-dist-min'

interface Props {
  chart: ChartDef
  style?: React.CSSProperties
}

export default function PlotlyChart({ chart, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    Plotly.newPlot(el, chart.data, chart.layout, {
      responsive: true,
      displayModeBar: false,
      staticPlot: true,
      ...(chart.config ?? {}),
    })
    // Force Plotly to fill the flex/absolute container after first paint
    const ro = new ResizeObserver(() => { Plotly.Plots.resize(el) })
    ro.observe(el)
    // Also do an immediate resize so the initial size is correct
    requestAnimationFrame(() => { Plotly.Plots.resize(el) })
    return () => {
      ro.disconnect()
      Plotly.purge(el)
    }
  }, [chart])

  return <div ref={ref} style={{ width: '100%', height: '100%', ...style }} />
}
