import type { Density, FontRole } from './controls'
import type { SeedKey } from './ramps'
import {
  defaultTheme,
  setDensity,
  setFont,
  setRoundness,
  setSeed,
  setToken,
  setTypeScale,
  type ThemeConfig,
} from './theme'

// Built-in starting points. Each is expressed through the same reducers the editor uses,
// so a preset is exactly what a user could have produced by hand.

export interface ThemePreset {
  id: string
  name: string
  description: string
  group: 'neutral' | 'color' | 'character'
  seeds?: Partial<Record<SeedKey, string>>
  roundness?: number
  density?: Density
  typeScale?: number
  fonts?: Partial<Record<FontRole, string>>
  light?: Record<string, string>
  dark?: Record<string, string>
}

export const PRESET_GROUPS = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'color', label: 'Color' },
  { id: 'character', label: 'Character' },
] as const

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'payload', name: 'Payload', description: 'Payload v4 defaults', group: 'neutral' },
  { id: 'slate', name: 'Slate', description: 'Cool blue-grey neutrals, indigo brand', group: 'neutral', seeds: { neutral: '#64748b', brand: '#4f46e5' } },
  { id: 'stone', name: 'Stone', description: 'Warm greys, charcoal brand', group: 'neutral', seeds: { neutral: '#78716c', brand: '#44403c', accent: '#a16207' } },
  { id: 'zinc', name: 'Zinc', description: 'Monochrome, black primary actions', group: 'neutral', seeds: { neutral: '#71717a', brand: '#18181b', accent: '#52525b' } },
  { id: 'indigo', name: 'Indigo', description: 'Deep indigo brand with violet accents', group: 'color', seeds: { brand: '#4f46e5', accent: '#7c3aed', neutral: '#6b7280' } },
  { id: 'emerald', name: 'Emerald', description: 'Fresh green brand', group: 'color', seeds: { brand: '#059669', accent: '#0d9488', neutral: '#6b7280' } },
  { id: 'rose', name: 'Rose', description: 'Rose brand with warm neutrals', group: 'color', seeds: { brand: '#e11d48', accent: '#db2777', neutral: '#78716c' } },
  { id: 'amber', name: 'Amber', description: 'Golden brand, earthy greys', group: 'color', seeds: { brand: '#d97706', accent: '#b45309', neutral: '#78716c' } },
  { id: 'ocean', name: 'Ocean', description: 'Teal brand, blue-grey neutrals', group: 'color', seeds: { brand: '#0e7490', accent: '#2563eb', neutral: '#64748b' } },
  { id: 'grape', name: 'Grape', description: 'Purple brand and accent', group: 'color', seeds: { brand: '#7c3aed', accent: '#c026d3', neutral: '#71717a' } },
  {
    id: 'light-cream',
    name: 'Light Cream',
    description: 'Cream surfaces, sage green brand, comfortable density',
    group: 'character',
    seeds: { brand: '#83bf78', accent: '#68a75f', neutral: '#8a8470' },
    roundness: 10,
    density: 'comfortable',
    typeScale: 1.1667,
    fonts: { body: 'Inter', heading: 'Inter' },
    light: {
      '--color-bg': '#faf7ed',
      '--color-bg-elevated': '#faf7ed',
      '--color-bg-hover': '#f3eedf',
      '--color-bg-secondary': '#f5f0e3',
      '--color-text-brand': 'var(--ramp-blue-800)',
    },
    dark: {
      '--color-bg': '#171a16',
      '--color-bg-elevated': '#1d211c',
      '--color-bg-hover': '#252b23',
      '--color-bg-secondary': '#20251f',
      '--color-text-brand': 'var(--ramp-blue-400)',
    },
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Rounded, airy, friendly',
    group: 'character',
    seeds: { brand: '#6366f1', accent: '#ec4899', neutral: '#6b7280' },
    roundness: 12,
    density: 'comfortable',
    typeScale: 1.1667,
    fonts: { body: 'DM Sans', heading: 'DM Sans' },
  },
  {
    id: 'brutal',
    name: 'Brutal',
    description: 'Square corners, black and yellow',
    group: 'character',
    seeds: { brand: '#111111', accent: '#facc15', neutral: '#525252' },
    roundness: 0,
    fonts: { body: 'Space Grotesk', heading: 'Space Grotesk', mono: 'Space Mono' },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Serif headings on paper tones',
    group: 'character',
    seeds: { brand: '#9a3412', accent: '#b45309', neutral: '#857a6c' },
    roundness: 3,
    density: 'comfortable',
    typeScale: 1.1667,
    fonts: { body: 'Source Sans 3', heading: 'Playfair Display' },
    light: { '--color-bg': '#fbf8f3', '--color-bg-secondary': '#f4efe6' },
  },
]

export function presetTheme(preset: ThemePreset): ThemeConfig {
  let t = defaultTheme()
  for (const [key, hex] of Object.entries(preset.seeds ?? {})) t = setSeed(t, key as SeedKey, hex)
  if (preset.roundness !== undefined) t = setRoundness(t, preset.roundness)
  if (preset.density) t = setDensity(t, preset.density)
  if (preset.typeScale) t = setTypeScale(t, preset.typeScale)
  for (const [role, family] of Object.entries(preset.fonts ?? {})) t = setFont(t, role as FontRole, family)
  for (const [v, value] of Object.entries(preset.light ?? {})) t = setToken(t, v, value, 'light')
  for (const [v, value] of Object.entries(preset.dark ?? {})) t = setToken(t, v, value, 'dark')
  return t
}
