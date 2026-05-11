import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Global error trap — shows errors on white screen before React mounts
window.onerror = (msg, src, line, col, err) => {
  const root = document.getElementById('root')!
  root.style.cssText = 'padding:40px;font-family:monospace;background:#111;color:#ff6b6b;white-space:pre-wrap'
  root.textContent = `💥 Global Error\n${msg}\n${src}:${line}:${col}\n\n${err?.stack ?? ''}`
}
window.onunhandledrejection = (e) => {
  const root = document.getElementById('root')!
  root.style.cssText = 'padding:40px;font-family:monospace;background:#111;color:#ff6b6b;white-space:pre-wrap'
  root.textContent = `💥 Unhandled Promise Rejection\n${e.reason?.message ?? e.reason}\n\n${e.reason?.stack ?? ''}`
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
