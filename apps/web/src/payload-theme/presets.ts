import type { ComponentStyles, PropKey } from './components'
import type { BorderStyle, Density, FontRole, ShadowStyle, SurfaceOptions } from './controls'
import type { SeedKey } from './ramps'
import {
  defaultTheme,
  setBorders,
  setComponentProp,
  setDensity,
  setFont,
  setRoundness,
  setSeed,
  setShadows,
  setSurfaces,
  setToken,
  setTypeScale,
  type ThemeConfig,
} from './theme'

// Built-in, art-directed themes. Each is expressed through the editor's own reducers, so a preset
// is exactly what a user could have built by hand — and every value is validated on the way in.

export interface ThemePreset {
  id: string
  name: string
  description: string
  group: 'light' | 'dark-sidebar' | 'expressive'
  seeds?: Partial<Record<SeedKey, string>>
  surfaces?: SurfaceOptions
  shadows?: ShadowStyle
  borders?: BorderStyle
  roundness?: number
  density?: Density
  typeScale?: number
  fonts?: Partial<Record<FontRole, string>>
  light?: Record<string, string>
  dark?: Record<string, string>
  components?: ComponentStyles
}

export const PRESET_GROUPS = [
  { id: 'light', label: 'Calm' },
  { id: 'dark-sidebar', label: 'Bold sidebar' },
  { id: 'expressive', label: 'Expressive' },
] as const

const upperLabel = { case: 'uppercase', tracking: '0.08em', weight: '600' } as const

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'payload', name: 'Payload', description: 'Payload v4 defaults', group: 'light' },
  {
    id: 'light-cream',
    name: 'Light Cream',
    description: 'Cream paper, sage green, soft and roomy',
    group: 'light',
    seeds: { brand: '#5f9a55', accent: '#68a75f', neutral: '#c2a35a' },
    surfaces: { tint: 0.75, depth: -0.2 },
    shadows: 'soft',
    roundness: 10,
    density: 'comfortable',
    typeScale: 1.1667,
    fonts: { body: 'Inter', heading: 'Inter' },
    components: {
      sidebar: { light: { bg: '#f3edda' }, dark: { bg: '#151813' } },
      sidebarLinkActive: { light: { bg: '#e2ecd8', text: '#2f5a2a', weight: '600' }, dark: { bg: '#25331f', text: '#b4dba8' } },
      card: { light: { shadow: 'var(--elevation-300-tooltip)', radius: '14px' } },
      widget: { light: { radius: '16px', shadow: 'var(--elevation-300-tooltip)' } },
      buttonPrimary: { light: { radius: '10px', weight: '600' } },
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic blues, cool greys, quiet flat surfaces',
    group: 'light',
    seeds: { brand: '#5e81ac', accent: '#88c0d0', neutral: '#4c566a', success: '#a3be8c', warning: '#ebcb8b', danger: '#bf616a' },
    surfaces: { tint: 0.35, depth: 0.15 },
    shadows: 'flat',
    roundness: 6,
    fonts: { body: 'IBM Plex Sans', heading: 'IBM Plex Sans', mono: 'IBM Plex Mono' },
    dark: { '--color-bg': '#2e3440', '--color-bg-secondary': '#3b4252', '--color-bg-elevated': '#262b35', '--color-bg-hover': '#3b4252' },
    components: {
      sidebar: { light: { bg: '#e5e9f0' }, dark: { bg: '#272c36' } },
      sidebarLinkActive: { light: { bg: '#d8dee9', text: '#2e3440', accent: '#5e81ac' }, dark: { bg: '#3b4252', text: '#eceff4', accent: '#88c0d0' } },
      tableHeader: { light: { ...upperLabel, text: '#4c566a' }, dark: { text: '#d8dee9' } },
      pageTitle: { light: { weight: '600', tracking: '-0.01em' } },
    },
  },
  {
    id: 'paper',
    name: 'Editorial',
    description: 'Serif headlines on warm paper, rust ink',
    group: 'light',
    seeds: { brand: '#9a3412', accent: '#b45309', neutral: '#857a6c' },
    surfaces: { tint: 0.55, depth: -0.4 },
    shadows: 'flat',
    borders: 'subtle',
    roundness: 2,
    density: 'comfortable',
    typeScale: 1.1667,
    fonts: { body: 'Source Sans 3', heading: 'Playfair Display' },
    components: {
      pageTitle: { light: { weight: '700', tracking: '-0.02em' } },
      sidebarGroup: { light: { ...upperLabel, tracking: '0.14em' } },
      tableHeader: { light: { ...upperLabel, tracking: '0.12em' } },
      fieldLabel: { light: { case: 'uppercase', tracking: '0.06em', weight: '600' } },
      header: { light: { divider: '#d6c9b6' }, dark: { divider: '#3b342d' } },
      buttonPrimary: { light: { case: 'uppercase', tracking: '0.08em', radius: '2px' } },
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Navy sidebar, crisp white workspace, compact',
    group: 'dark-sidebar',
    seeds: { brand: '#1d4ed8', accent: '#0891b2', neutral: '#64748b' },
    surfaces: { tint: 0.12, depth: -0.3 },
    shadows: 'soft',
    roundness: 4,
    fonts: { body: 'IBM Plex Sans', heading: 'IBM Plex Sans' },
    components: {
      sidebar: { light: { bg: '#0f1e3d', scheme: 'dark', border: '#0f1e3d' }, dark: { bg: '#0b1529', border: '#1e293b' } },
      sidebarLink: { light: { text: '#c7d2fe', textHover: '#ffffff', bgHover: 'rgba(255, 255, 255, 0.06)' } },
      sidebarLinkActive: { light: { bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff', accent: '#60a5fa', weight: '600' } },
      sidebarGroup: { light: { text: '#7c8db5', ...upperLabel } },
      header: { light: { bg: '#ffffff', divider: '#e2e8f0', shadow: 'var(--elevation-100-canvas)' }, dark: { bg: '#111827', divider: '#1f2937' } },
      tableHeader: { light: { bg: '#f8fafc', text: '#475569', ...upperLabel }, dark: { bg: '#111827', text: '#94a3b8' } },
      card: { light: { shadow: 'var(--elevation-100-canvas)' } },
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep indigo sidebar, violet glow, near-black dark mode',
    group: 'dark-sidebar',
    seeds: { brand: '#6366f1', accent: '#a855f7', neutral: '#6b6f8f' },
    surfaces: { tint: 0.25, depth: -0.85 },
    shadows: 'glow',
    roundness: 8,
    fonts: { body: 'Manrope', heading: 'Manrope' },
    components: {
      sidebar: { light: { bg: 'linear-gradient(180deg, #1e1b4b 0%, #13112e 100%)', scheme: 'dark', border: '#1e1b4b' }, dark: { bg: '#0a0918', border: '#1c1a3a' } },
      sidebarLink: { light: { text: '#c7c4f5', textHover: '#ffffff', bgHover: 'rgba(255, 255, 255, 0.06)', radius: '8px' } },
      sidebarLinkActive: { light: { bg: 'rgba(129, 140, 248, 0.2)', text: '#ffffff', weight: '600' }, dark: { bg: 'rgba(129, 140, 248, 0.18)' } },
      sidebarGroup: { light: { text: '#8481c4', ...upperLabel } },
      buttonPrimary: { light: { bg: 'linear-gradient(135deg, #6366f1, #a855f7)', bgHover: 'linear-gradient(135deg, #4f46e5, #9333ea)', radius: '9px', weight: '600', shadow: 'var(--elevation-300-tooltip)' } },
      card: { light: { radius: '12px', shadow: 'var(--elevation-300-tooltip)' } },
      widget: { light: { radius: '14px' } },
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Moss sidebar, emerald accents, Lora headings',
    group: 'dark-sidebar',
    seeds: { brand: '#047857', accent: '#65a30d', neutral: '#6b7a6a' },
    surfaces: { tint: 0.35, depth: -0.5 },
    shadows: 'soft',
    roundness: 8,
    fonts: { body: 'Karla', heading: 'Lora' },
    components: {
      sidebar: { light: { bg: '#163a2c', scheme: 'dark', border: '#163a2c' }, dark: { bg: '#0d221a', border: '#183327' } },
      sidebarLink: { light: { text: '#cfe7da', textHover: '#ffffff', bgHover: 'rgba(255, 255, 255, 0.07)' } },
      sidebarLinkActive: { light: { bg: '#21533f', text: '#ffffff', weight: '600' }, dark: { bg: '#1c4434' } },
      sidebarGroup: { light: { text: '#8fbfa6', ...upperLabel } },
      pageTitle: { light: { weight: '700' } },
      card: { light: { radius: '12px', shadow: 'var(--elevation-100-canvas)' } },
    },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Monospace everything, phosphor green, hard edges',
    group: 'dark-sidebar',
    seeds: { brand: '#16a34a', accent: '#22d3ee', neutral: '#4b5a50', warning: '#eab308', danger: '#ef4444' },
    surfaces: { tint: 0.2, depth: -1 },
    shadows: 'flat',
    borders: 'strong',
    roundness: 0,
    fonts: { body: 'JetBrains Mono', heading: 'JetBrains Mono', mono: 'JetBrains Mono' },
    typeScale: 1.0833,
    components: {
      sidebar: { light: { bg: '#0a0f0c', scheme: 'dark', border: '#14532d' }, dark: { bg: '#050806', border: '#14532d' } },
      sidebarLink: { light: { text: '#86efac', textHover: '#dcfce7', bgHover: 'rgba(34, 197, 94, 0.12)' } },
      sidebarLinkActive: { light: { bg: 'rgba(34, 197, 94, 0.2)', text: '#dcfce7', accent: '#22c55e' } },
      sidebarGroup: { light: { text: '#4ade80', ...upperLabel } },
      buttonPrimary: { light: { case: 'uppercase', tracking: '0.06em' } },
      tableHeader: { light: { ...upperLabel } },
      fieldLabel: { light: { case: 'uppercase', tracking: '0.04em' } },
      pill: { light: { radius: '0px', case: 'uppercase', tracking: '0.04em' } },
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Coral to pink, warm surfaces, generous radius',
    group: 'expressive',
    seeds: { brand: '#ea580c', accent: '#db2777', neutral: '#a8786a' },
    surfaces: { tint: 0.55, depth: -0.4 },
    shadows: 'soft',
    roundness: 14,
    density: 'comfortable',
    fonts: { body: 'DM Sans', heading: 'Sora' },
    typeScale: 1.1667,
    components: {
      buttonPrimary: { light: { bg: 'linear-gradient(135deg, #f97316, #db2777)', bgHover: 'linear-gradient(135deg, #ea580c, #be185d)', radius: '999px', weight: '600', shadow: 'var(--elevation-300-tooltip)' } },
      buttonSecondary: { light: { radius: '999px' } },
      pill: { light: { radius: '999px', weight: '600' } },
      sidebarLinkActive: { light: { bg: '#ffe4d6', text: '#9a3412', weight: '600' }, dark: { bg: '#4a2418', text: '#fed7aa' } },
      card: { light: { radius: '18px', shadow: 'var(--elevation-300-tooltip)' } },
      widget: { light: { radius: '20px', shadow: 'var(--elevation-300-tooltip)' } },
      pageTitle: { light: { weight: '700', tracking: '-0.02em' } },
    },
  },
  {
    id: 'candy',
    name: 'Candy',
    description: 'Bubblegum pink, violet glow, round everything',
    group: 'expressive',
    seeds: { brand: '#db2777', accent: '#8b5cf6', neutral: '#b07a9e' },
    surfaces: { tint: 0.6, depth: -0.3 },
    shadows: 'glow',
    roundness: 16,
    density: 'comfortable',
    fonts: { body: 'Nunito', heading: 'Nunito' },
    typeScale: 1.1667,
    components: {
      buttonPrimary: { light: { radius: '999px', weight: '700' } },
      buttonSecondary: { light: { radius: '999px' } },
      pill: { light: { radius: '999px', weight: '700' } },
      input: { light: { radius: '12px' } },
      sidebarLink: { light: { radius: '999px' } },
      sidebarLinkActive: { light: { bg: '#fce7f3', text: '#9d174d', weight: '700' }, dark: { bg: '#4a1d36', text: '#fbcfe8' } },
      card: { light: { radius: '22px' } },
      widget: { light: { radius: '24px' } },
    },
  },
  {
    id: 'brutal',
    name: 'Brutal',
    description: 'Black and yellow, hard offset shadows, square',
    group: 'expressive',
    seeds: { brand: '#111111', accent: '#facc15', neutral: '#57534e', warning: '#facc15' },
    borders: 'strong',
    roundness: 0,
    fonts: { body: 'Space Grotesk', heading: 'Space Grotesk', mono: 'Space Mono' },
    light: { '--color-bg': '#fffdf5', '--color-bg-secondary': '#fef9c3' },
    components: {
      buttonPrimary: { light: { case: 'uppercase', tracking: '0.04em', weight: '700', shadow: '3px 3px 0 #facc15' } },
      buttonSecondary: { light: { outline: '#111111', weight: '700' }, dark: { outline: '#fafaf9' } },
      card: { light: { border: '#111111', shadow: '4px 4px 0 #111111' }, dark: { border: '#fafaf9' } },
      widget: { light: { border: '#111111', shadow: '5px 5px 0 #111111' }, dark: { border: '#fafaf9' } },
      sidebar: { light: { bg: '#facc15', border: '#111111' }, dark: { bg: '#1c1917', border: '#facc15' } },
      sidebarLink: { light: { text: '#111111', weight: '600', bgHover: 'rgba(0, 0, 0, 0.08)' }, dark: { text: '#fafaf9' } },
      sidebarLinkActive: { light: { bg: '#111111', text: '#facc15', weight: '700' }, dark: { bg: '#facc15', text: '#111111' } },
      sidebarGroup: { light: { text: '#111111', ...upperLabel }, dark: { text: '#facc15' } },
      tableHeader: { light: { bg: '#111111', text: '#facc15', ...upperLabel }, dark: { bg: '#facc15', text: '#111111' } },
      pill: { light: { radius: '0px', weight: '700', case: 'uppercase' } },
      pageTitle: { light: { weight: '700', tracking: '-0.03em' } },
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'Strict black and white, OLED dark mode',
    group: 'expressive',
    seeds: { brand: '#18181b', accent: '#52525b', neutral: '#71717a' },
    surfaces: { tint: 0, depth: -1 },
    shadows: 'flat',
    roundness: 6,
    fonts: { body: 'Inter', heading: 'Inter' },
    light: { '--color-text-onbrand': '#ffffff' },
    dark: { '--color-bg-brand': '#fafafa', '--color-text-onbrand': '#09090b', '--color-text-brand': '#fafafa' },
    components: {
      sidebarLinkActive: { light: { bg: '#18181b', text: '#ffffff' }, dark: { bg: '#fafafa', text: '#09090b' } },
      tableHeader: { light: { ...upperLabel } },
      pageTitle: { light: { weight: '700', tracking: '-0.03em' } },
    },
  },
]

export function presetTheme(preset: ThemePreset): ThemeConfig {
  let t = defaultTheme()
  for (const [key, hex] of Object.entries(preset.seeds ?? {})) t = setSeed(t, key as SeedKey, hex)
  if (preset.surfaces) t = setSurfaces(t, preset.surfaces)
  if (preset.shadows) t = setShadows(t, preset.shadows)
  if (preset.borders) t = setBorders(t, preset.borders)
  if (preset.roundness !== undefined) t = setRoundness(t, preset.roundness)
  if (preset.density) t = setDensity(t, preset.density)
  if (preset.typeScale) t = setTypeScale(t, preset.typeScale)
  for (const [role, family] of Object.entries(preset.fonts ?? {})) t = setFont(t, role as FontRole, family)
  for (const [v, value] of Object.entries(preset.light ?? {})) t = setToken(t, v, value, 'light')
  for (const [v, value] of Object.entries(preset.dark ?? {})) t = setToken(t, v, value, 'dark')
  for (const [id, styles] of Object.entries(preset.components ?? {})) {
    for (const mode of ['light', 'dark'] as const) {
      for (const [prop, value] of Object.entries(styles[mode] ?? {})) {
        if (value !== undefined) t = setComponentProp(t, id, prop as PropKey, value, mode)
      }
    }
  }
  return t
}
