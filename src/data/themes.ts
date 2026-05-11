// ============================================================
// 各章节视觉主题
// ============================================================

export interface ChapterTheme {
  id: number
  name: string
  emoji: string
  // 背景渐变
  bg: string
  // 主强调色
  accent: string
  // 浅色背景（卡片）
  cardBg: string
  // 文字色
  textPrimary: string
  textSecondary: string
  // 悬念页专用背景
  mysteryBg: string
}

export const themes: ChapterTheme[] = [
  {
    id: 0,
    name: '远古武林',
    emoji: '📜',
    bg: 'linear-gradient(135deg, #1C0A00 0%, #3E1F00 50%, #5C3D1E 100%)',
    accent: '#D4A843',
    cardBg: 'rgba(255,235,180,0.08)',
    textPrimary: '#F5E6C8',
    textSecondary: '#C4A882',
    mysteryBg: 'linear-gradient(135deg, #0D0500 0%, #2C1200 100%)',
  },
  {
    id: 1,
    name: '内力觉醒',
    emoji: '⚡',
    bg: 'linear-gradient(135deg, #020B18 0%, #0D2137 50%, #1565C0 100%)',
    accent: '#4FC3F7',
    cardBg: 'rgba(79,195,247,0.08)',
    textPrimary: '#E3F2FD',
    textSecondary: '#90CAF9',
    mysteryBg: 'linear-gradient(135deg, #000510 0%, #031020 100%)',
  },
  {
    id: 2,
    name: '绝世秘籍',
    emoji: '📖',
    bg: 'linear-gradient(135deg, #1A0500 0%, #7B1F00 50%, #BF360C 100%)',
    accent: '#FFB74D',
    cardBg: 'rgba(255,183,77,0.08)',
    textPrimary: '#FFF3E0',
    textSecondary: '#FFCC80',
    mysteryBg: 'linear-gradient(135deg, #0D0200 0%, #2D0800 100%)',
  },
  {
    id: 3,
    name: '修炼之道',
    emoji: '🔥',
    bg: 'linear-gradient(135deg, #12001A 0%, #4A0072 50%, #7B1FA2 100%)',
    accent: '#CE93D8',
    cardBg: 'rgba(206,147,216,0.08)',
    textPrimary: '#F3E5F5',
    textSecondary: '#CE93D8',
    mysteryBg: 'linear-gradient(135deg, #080010 0%, #1A0025 100%)',
  },
  {
    id: 4,
    name: '行走江湖',
    emoji: '⚔️',
    bg: 'linear-gradient(135deg, #001A05 0%, #1B5E20 50%, #2E7D32 100%)',
    accent: '#81C784',
    cardBg: 'rgba(129,199,132,0.08)',
    textPrimary: '#E8F5E9',
    textSecondary: '#A5D6A7',
    mysteryBg: 'linear-gradient(135deg, #000D02 0%, #021005 100%)',
  },
  {
    id: 5,
    name: '天下大势',
    emoji: '🌐',
    bg: 'linear-gradient(135deg, #05001A 0%, #1A0050 30%, #283593 60%, #0277BD 100%)',
    accent: '#80DEEA',
    cardBg: 'rgba(128,222,234,0.08)',
    textPrimary: '#E0F7FA',
    textSecondary: '#80DEEA',
    mysteryBg: 'linear-gradient(135deg, #02000D 0%, #080020 100%)',
  },
]

export function getTheme(chapterId: number): ChapterTheme {
  return themes[chapterId] ?? themes[0]
}
