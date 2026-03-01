// ─── Theme Presets ───────────────────────────────────────────────────────────
//
// Each preset maps to a Palette that gets passed through mapPaletteToTheme().
// palette: null means "reset to Payload defaults".

import type { Palette } from './palette-mapper'

export interface ThemePreset {
  id: string
  name: string
  description: string
  palette: Palette | null
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Payload defaults — neutral gray',
    palette: null,
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Cool blue-gray tones',
    palette: { neutral: '#64748b' },
  },
  {
    id: 'zinc',
    name: 'Zinc',
    description: 'True neutral zinc',
    palette: { neutral: '#71717a' },
  },
  {
    id: 'stone',
    name: 'Stone',
    description: 'Warm sandy undertones',
    palette: { neutral: '#78716c' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep blue-purple base',
    palette: { neutral: '#334155' },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Earthy green tones',
    palette: { neutral: '#4d6a5a', accent: '#22c55e' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep sea blues',
    palette: { neutral: '#3b6b8a' },
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Warm rose and blush',
    palette: { neutral: '#7a5a65', accent: '#f43f5e' },
  },
]
