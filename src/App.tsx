import { Component, type ReactNode } from 'react'
import SlideShow from './components/SlideShow'
import { allSlides, chapters } from './data/slides/index'
import './styles/index.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    const { error } = this.state
    if (error) {
      return (
        <div style={{
          padding: '40px', fontFamily: 'monospace', color: '#ff6b6b',
          background: '#111', minHeight: '100vh', whiteSpace: 'pre-wrap',
        }}>
          <h2 style={{ color: '#ff4444' }}>💥 Runtime Error</h2>
          <p style={{ color: '#ffd700' }}>{(error as Error).message}</p>
          <pre style={{ color: '#ccc', fontSize: '12px' }}>{(error as Error).stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SlideShow slides={allSlides} chapters={chapters} />
    </ErrorBoundary>
  )
}
