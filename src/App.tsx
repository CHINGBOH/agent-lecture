import SlideShow from './components/SlideShow'
import { allSlides, chapters } from './data/slides/index'
import './styles/index.css'

export default function App() {
  return <SlideShow slides={allSlides} chapters={chapters} />
}
