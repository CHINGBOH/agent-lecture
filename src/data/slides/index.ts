import type { Chapter } from '../types'
import { prologueSlides } from './prologue'
import { chapter1Slides } from './chapter1'
import { chapter2Slides } from './chapter2'
import { chapter3Slides } from './chapter3'
import { chapter4Slides } from './chapter4'
import { chapter5Slides } from './chapter5'

export const chapters: Chapter[] = [
  {
    id: 0,
    title: '远古武林',
    subtitle: 'AI 的史前文明 · 1950—2010',
    emoji: '📜',
    slides: prologueSlides,
  },
  {
    id: 1,
    title: '内力觉醒',
    subtitle: '深度学习革命 · 2006—2017',
    emoji: '⚡',
    slides: chapter1Slides,
  },
  {
    id: 2,
    title: '绝世秘籍',
    subtitle: 'Transformer 与 LLM · 2017—2023',
    emoji: '📖',
    slides: chapter2Slides,
  },
  {
    id: 3,
    title: '修炼之道',
    subtitle: '强化学习的秘密 · RL & RLHF',
    emoji: '🔥',
    slides: chapter3Slides,
  },
  {
    id: 4,
    title: '行走江湖',
    subtitle: 'AI Agent 的历史与本质',
    emoji: '⚔️',
    slides: chapter4Slides,
  },
  {
    id: 5,
    title: '天下大势',
    subtitle: '当下应用与未来边界',
    emoji: '🌐',
    slides: chapter5Slides,
  },
]

export const allSlides = chapters.flatMap(c => c.slides)
export const totalSlides = allSlides.length
