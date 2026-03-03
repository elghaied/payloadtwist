// ─── Palette Mapper ──────────────────────────────────────────────────────────
//
// Maps a neutral color (+ optional accent) to a complete PayloadThemeConfig.
// Reuses the existing HSL interpolation from scale-generator.ts.

import type { PayloadThemeConfig } from './types'
import { hexToHsl, hslToHex, lerpHsl, generateBaseScale } from './scale-generator'
import { getDefaultTheme } from './config'

export interface Palette {
  neutral: string     // hex
  accent?: string     // hex
  mode?: 'light' | 'dark' | 'both'  // default 'both'
}

const STATUS_STEPS = [
  50, 100, 150, 200, 250, 300, 350, 400, 450,
  500, 550, 600, 650, 700, 750, 800, 850, 900, 950,
] as const

export function detectAccentRole(hex: string): 'success' | 'warning' | 'error' | 'none' {
  const [h] = hexToHsl(hex)
  if (h >= 330 || h <= 30) return 'error'
  if (h > 30 && h <= 80) return 'warning'
  if (h > 80 && h <= 180) return 'success'
  return 'none'
}

function generateStatusScale(accentHex: string, role: 'success' | 'warning' | 'error'): Record<string, string> {
  const [h, s] = hexToHsl(accentHex)
  const result: Record<string, string> = {}

  // 3 anchors: step 50 (light tint), step 500 (accent), step 950 (dark shade)
  const anchors: Array<{ step: number; h: number; s: number; l: number }> = [
    { step: 50,  h, s: s * 0.3, l: 95 },
    { step: 500, h, s,          l: hexToHsl(accentHex)[2] },
    { step: 950, h, s: s * 0.3, l: 15 },
  ]

  for (const step of STATUS_STEPS) {
    let lo = 0
    for (let i = 1; i < anchors.length; i++) {
      if (anchors[i].step >= step) { lo = i - 1; break }
    }
    const hi = lo + 1
    const range = anchors[hi].step - anchors[lo].step
    const t = range === 0 ? 0 : (step - anchors[lo].step) / range
    const [rh, rs, rl] = lerpHsl(
      anchors[lo].h, anchors[lo].s, anchors[lo].l,
      anchors[hi].h, anchors[hi].s, anchors[hi].l,
      t,
    )
    result[`--color-${role}-${step}`] = hslToHex(rh, rs, rl)
  }

  return result
}

/**
 * Derives dark-mode semantic vars from a base scale.
 * Maps base scale steps to --theme-bg, --theme-text, --theme-input-bg, --theme-overlay.
 */
export function deriveDarkVarsFromScale(scaleVars: Record<string, string>): Record<string, string> {
  const dark: Record<string, string> = {}

  if (scaleVars['--color-base-950']) dark['--theme-bg'] = scaleVars['--color-base-950']
  if (scaleVars['--color-base-50']) dark['--theme-text'] = scaleVars['--color-base-50']
  if (scaleVars['--color-base-900']) dark['--theme-input-bg'] = scaleVars['--color-base-900']

  const base1000 = scaleVars['--color-base-1000']
  if (base1000) {
    const [r, g, b] = hexToRgb(base1000)
    dark['--theme-overlay'] = `rgba(${r}, ${g}, ${b}, 0.75)`
  }

  return dark
}

export function mapPaletteToTheme(palette: Palette): PayloadThemeConfig {
  const defaults = getDefaultTheme()
  const [h] = hexToHsl(palette.neutral)

  // Generate base scale from 3 anchors derived from the neutral hue
  const lightest = hslToHex(h, 8, 97)
  const darkest = hslToHex(h, 8, 8)
  const baseScaleVars = generateBaseScale(lightest, palette.neutral, darkest)

  // Build light config: defaults + base scale overlay
  const light: Record<string, string> = { ...defaults.light, ...baseScaleVars }

  // Build dark config: defaults + semantic dark vars derived from generated scale
  const dark: Record<string, string> = {
    ...defaults.dark,
    ...deriveDarkVarsFromScale(baseScaleVars),
  }

  // Status colors from accent
  if (palette.accent) {
    const role = detectAccentRole(palette.accent)
    if (role !== 'none') {
      const statusVars = generateStatusScale(palette.accent, role)
      Object.assign(light, statusVars)
    }
  }

  return {
    light,
    dark,
    bemOverrides: {},
    componentOverrides: {},
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}
