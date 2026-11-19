import { isHex, normalizeHex } from './color'
import {
  DEFAULT_ROUNDNESS,
  DENSITIES,
  DENSITY_VARS,
  densityTokens,
  FONT_VARS,
  fontValue,
  roundnessTokens,
  TYPE_SCALE_VARS,
  typeScaleTokens,
  type Density,
  type FontRole,
} from './controls'
import { generateSeedRamps, SEED_KEYS, seedRampVars, type SeedKey } from './ramps'
import { TOKENS } from './schema'

export type Mode = 'light' | 'dark'

/**
 * A payloadtwist theme for Payload v4. Output CSS is built only from `ramps`, `light`, `dark`
 * and `customCss`; `seeds` and `controls` remember how the editor produced them.
 */
export interface ThemeConfig {
  version: 4
  seeds: Partial<Record<SeedKey, string>>
  controls: {
    roundness?: number
    density?: Density
    typeScale?: number
    fonts?: Partial<Record<FontRole, string>>
  }
  /** `--ramp-*` overrides — mode-independent palette */
  ramps: Record<string, string>
  /** Token overrides for light mode (and dark mode when Payload has no separate dark value) */
  light: Record<string, string>
  /** Token overrides for `[data-theme='dark']` */
  dark: Record<string, string>
  customCss: string
}

export function defaultTheme(): ThemeConfig {
  return { version: 4, seeds: {}, controls: {}, ramps: {}, light: {}, dark: {}, customCss: '' }
}

const without = (obj: Record<string, string>, keys: string[]) => {
  const next = { ...obj }
  for (const k of keys) delete next[k]
  return next
}

/** Sets (or with `null` resets) a seed and regenerates the ramps it controls. */
export function setSeed(theme: ThemeConfig, key: SeedKey, hex: string | null): ThemeConfig {
  const ramps = without(theme.ramps, seedRampVars(key))
  const seeds = { ...theme.seeds }
  if (hex === null) {
    delete seeds[key]
    return { ...theme, seeds, ramps }
  }
  seeds[key] = normalizeHex(hex)
  return { ...theme, seeds, ramps: { ...ramps, ...generateSeedRamps(key, hex) } }
}

export function setRamp(theme: ThemeConfig, varName: string, value: string | null): ThemeConfig {
  if (!varName.startsWith('--ramp-')) throw new Error(`Not a ramp variable: ${varName}`)
  const ramps = without(theme.ramps, [varName])
  return { ...theme, ramps: value === null ? ramps : { ...ramps, [varName]: value } }
}

/** Sets (or with `null` resets) a token override for one mode. */
export function setToken(theme: ThemeConfig, varName: string, value: string | null, mode: Mode): ThemeConfig {
  if (!TOKENS[varName]) throw new Error(`Unknown Payload token: ${varName}`)
  const map = without(theme[mode], [varName])
  return { ...theme, [mode]: value === null ? map : { ...map, [varName]: value } }
}

export function setRoundness(theme: ThemeConfig, mediumPx: number | null): ThemeConfig {
  const light = without(theme.light, Object.keys(roundnessTokens(DEFAULT_ROUNDNESS)))
  const controls = { ...theme.controls }
  if (mediumPx === null || mediumPx === DEFAULT_ROUNDNESS) {
    delete controls.roundness
    return { ...theme, controls, light }
  }
  controls.roundness = mediumPx
  return { ...theme, controls, light: { ...light, ...roundnessTokens(mediumPx) } }
}

export function setDensity(theme: ThemeConfig, density: Density): ThemeConfig {
  const controls: ThemeConfig['controls'] = { ...theme.controls, density }
  if (density === 'compact') delete controls.density
  return { ...theme, controls, light: { ...without(theme.light, DENSITY_VARS), ...densityTokens(density) } }
}

export function setTypeScale(theme: ThemeConfig, scale: number): ThemeConfig {
  const controls: ThemeConfig['controls'] = { ...theme.controls, typeScale: scale }
  if (scale === 1) delete controls.typeScale
  return { ...theme, controls, light: { ...without(theme.light, TYPE_SCALE_VARS), ...typeScaleTokens(scale) } }
}

/** Sets (or with `null` resets) the font for a role. `family` is a family name or CSS stack. */
export function setFont(theme: ThemeConfig, role: FontRole, family: string | null): ThemeConfig {
  const fonts = { ...theme.controls.fonts }
  const v = FONT_VARS[role]
  if (family === null) {
    delete fonts[role]
    return { ...theme, controls: { ...theme.controls, fonts }, light: without(theme.light, [v]) }
  }
  fonts[role] = family
  return { ...theme, controls: { ...theme.controls, fonts }, light: { ...theme.light, [v]: fontValue(family) } }
}

/**
 * Token values end up in a <style> tag inside the preview (possibly the user's real, logged-in
 * admin) and in exported CSS. Disallow anything that can end the declaration or fetch a URL
 * (CSS-based exfiltration), plus escapes that could spell those out.
 */
export function isSafeValue(v: string): boolean {
  return v.length <= 500 && !/[;{}<>\\]|url\(|@import|expression\(|image-set\(|src\(/i.test(v)
}

/** Accepts unknown input (imports, presets from the DB) and returns a valid ThemeConfig or throws. */
export function parseTheme(input: unknown): ThemeConfig {
  if (!input || typeof input !== 'object') throw new Error('Theme must be an object')
  const t = input as Partial<ThemeConfig>
  if (t.version !== 4) throw new Error('Only Payload v4 themes (version: 4) are supported')
  const strMap = (m: unknown, name: string) => {
    if (m === undefined) return {}
    if (!m || typeof m !== 'object' || Array.isArray(m)) throw new Error(`${name} must be an object`)
    for (const [k, v] of Object.entries(m)) {
      // Only real Payload tokens (ramps only in `ramps`) — no arbitrary custom properties
      if (!TOKENS[k] || (name === 'ramps') !== k.startsWith('--ramp-') || typeof v !== 'string') {
        throw new Error(`${name}: invalid entry ${k}`)
      }
      if (!isSafeValue(v)) throw new Error(`${name}: invalid value for ${k}`)
    }
    return m as Record<string, string>
  }
  const seeds: ThemeConfig['seeds'] = {}
  for (const [k, v] of Object.entries(t.seeds ?? {})) {
    if (!(SEED_KEYS as readonly string[]).includes(k) || typeof v !== 'string' || !isHex(v)) {
      throw new Error(`seeds: invalid entry ${k}`)
    }
    seeds[k as SeedKey] = normalizeHex(v)
  }

  const c = (t.controls ?? {}) as ThemeConfig['controls']
  const controls: ThemeConfig['controls'] = {}
  if (c.roundness !== undefined) {
    if (typeof c.roundness !== 'number' || c.roundness < 0 || c.roundness > 64) throw new Error('controls.roundness out of range')
    controls.roundness = c.roundness
  }
  if (c.density !== undefined) {
    if (!DENSITIES.includes(c.density)) throw new Error('controls.density invalid')
    controls.density = c.density
  }
  if (c.typeScale !== undefined) {
    if (typeof c.typeScale !== 'number' || c.typeScale < 0.5 || c.typeScale > 2) throw new Error('controls.typeScale out of range')
    controls.typeScale = c.typeScale
  }
  if (c.fonts !== undefined) {
    controls.fonts = {}
    for (const [role, family] of Object.entries(c.fonts)) {
      if (!(role in FONT_VARS) || typeof family !== 'string' || !isSafeValue(family)) {
        throw new Error(`controls.fonts: invalid entry ${role}`)
      }
      controls.fonts[role as FontRole] = family
    }
  }

  const customCss = typeof t.customCss === 'string' ? t.customCss : ''
  if (/<\/style/i.test(customCss)) throw new Error('customCss must not contain </style>')

  return {
    version: 4,
    seeds,
    controls,
    ramps: strMap(t.ramps, 'ramps'),
    light: strMap(t.light, 'light'),
    dark: strMap(t.dark, 'dark'),
    customCss,
  }
}
