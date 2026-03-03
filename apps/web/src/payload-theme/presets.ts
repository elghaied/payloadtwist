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
  group: 'classic' | 'vibrant' | 'bold'
}

export const PRESET_GROUPS = [
  { id: 'classic' as const, label: 'Classic' },
  { id: 'vibrant' as const, label: 'Vibrant' },
  { id: 'bold' as const, label: 'Bold' },
]

export const THEME_PRESETS: ThemePreset[] = [
  // ── Classic ─────────────────────────────────────────────
  {
    id: 'default',
    name: 'Default',
    description: 'Payload defaults — neutral gray',
    palette: null,
    group: 'classic',
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Cool blue-gray tones',
    palette: { neutral: '#64748b' },
    group: 'classic',
  },
  {
    id: 'zinc',
    name: 'Zinc',
    description: 'True neutral zinc',
    palette: { neutral: '#71717a' },
    group: 'classic',
  },
  {
    id: 'stone',
    name: 'Stone',
    description: 'Warm sandy undertones',
    palette: { neutral: '#78716c' },
    group: 'classic',
  },

  // ── Vibrant ─────────────────────────────────────────────
  {
    id: 'indigo',
    name: 'Indigo',
    description: 'Rich indigo-blue surfaces',
    palette: { neutral: '#7c83db' },
    group: 'vibrant',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    description: 'Vivid sapphire blue',
    palette: { neutral: '#5b93d4' },
    group: 'vibrant',
  },
  {
    id: 'violet',
    name: 'Violet',
    description: 'Soft purple violet',
    palette: { neutral: '#9b7ecf' },
    group: 'vibrant',
  },
  {
    id: 'teal',
    name: 'Teal',
    description: 'Fresh modern teal',
    palette: { neutral: '#4db8a4' },
    group: 'vibrant',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Lively emerald green',
    palette: { neutral: '#5cb893', accent: '#10b981' },
    group: 'vibrant',
  },
  {
    id: 'sky',
    name: 'Sky',
    description: 'Bright sky blue',
    palette: { neutral: '#4dabce' },
    group: 'vibrant',
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Vibrant rose pink',
    palette: { neutral: '#d47b8e', accent: '#f43f5e' },
    group: 'vibrant',
  },
  {
    id: 'coral',
    name: 'Coral',
    description: 'Warm coral orange',
    palette: { neutral: '#d4886b', accent: '#f97316' },
    group: 'vibrant',
  },
  {
    id: 'amber',
    name: 'Amber',
    description: 'Rich golden amber',
    palette: { neutral: '#c9a34d', accent: '#f59e0b' },
    group: 'vibrant',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Gentle lavender haze',
    palette: { neutral: '#9b8ec4' },
    group: 'vibrant',
  },
  {
    id: 'mint',
    name: 'Mint',
    description: 'Cool fresh mint',
    palette: { neutral: '#5cc0a0' },
    group: 'vibrant',
  },

  // ── Bold ────────────────────────────────────────────────
  {
    id: 'fuchsia',
    name: 'Fuchsia',
    description: 'Electric fuchsia pink',
    palette: { neutral: '#c477d4', accent: '#d946ef' },
    group: 'bold',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep electric blue',
    palette: { neutral: '#4d8dba' },
    group: 'bold',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep indigo night',
    palette: { neutral: '#5b6aad' },
    group: 'bold',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    description: 'Deep rich crimson',
    palette: { neutral: '#c46b6b', accent: '#ef4444' },
    group: 'bold',
  },
  {
    id: 'plum',
    name: 'Plum',
    description: 'Dark luxurious plum',
    palette: { neutral: '#8b5e8b', accent: '#a855f7' },
    group: 'bold',
  },
]
