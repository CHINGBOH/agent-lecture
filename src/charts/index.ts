import { type ChartDef } from './theme'
import { pTimeline } from './prologue'
import { c1Timeline, c1Feature, c1Backprop } from './chapter1'
import { c2Timeline, c2Attention, c2Scaling } from './chapter2'
import { c3Rl, c3Rlhf } from './chapter3'
import { c4Timeline } from './chapter4'

export type { ChartDef }

export const CHART_MAP: Record<string, ChartDef> = {
  'p-timeline':           pTimeline,
  'c1-timeline':          c1Timeline,
  'c1-concept-feature':   c1Feature,
  'c1-concept-backprop':  c1Backprop,
  'c2-timeline':          c2Timeline,
  'c2-concept-attention': c2Attention,
  'c2-concept-scaling':   c2Scaling,
  'c3-concept-rl':        c3Rl,
  'c3-concept-rlhf':      c3Rlhf,
  'c4-timeline':          c4Timeline,
}
