import { hexToHsl, isHex, normalizeHex } from './color'
import {
  BORDER_STYLES,
  BORDER_VARS,
  borderTokens,
  DEFAULT_ROUNDNESS,
  DENSITIES,
  DENSITY_VARS,
  densityTokens,
  FONT_VARS,
  fontValue,
  roundnessTokens,
  TYPE_SCALE_VARS,
  typeScaleTokens,
  SHADOW_STYLES,
  SHADOW_VARS,
  shadowTokens,
  SURFACE_VARS,
  surfaceTokens,
  type BorderStyle,
  type Density,
  type FontRole,
  type ShadowStyle,
  type SurfaceOptions,
} from './controls'
import { COMPONENT_BY_ID, isColorProp, isValidComponentValue, PROPS, type ComponentStyles, type PropKey } from './components'
import { defaultSeed, generateSeedRamps, ON_COLOR_VARS, onColorTokens, SEED_KEYS, seedRampVars, type SeedKey } from './ramps'
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
    surfaces?: SurfaceOptions
    shadows?: ShadowStyle
    borders?: BorderStyle
  }
  /** `--ramp-*` overrides — mode-independent palette */
  ramps: Record<string, string>
  /** Token overrides for light mode (and dark mode when Payload has no separate dark value) */
  light: Record<string, string>
  /** Token overrides for `[data-theme='dark']` */
  dark: Record<string, string>
  /** Component layer: typed properties on Payload's BEM classes (components.ts) */
  components: ComponentStyles
  customCss: string
}

export function defaultTheme(): ThemeConfig {
  return { version: 4, seeds: {}, controls: {}, ramps: {}, light: {}, dark: {}, components: {}, customCss: '' }
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
  if (hex === null) delete seeds[key]
  else seeds[key] = normalizeHex(hex)
  // Labels on the seed color follow it (white or near-black, whichever reads better)
  const onVars = ON_COLOR_VARS[key] ?? []
  const light = { ...without(theme.light, onVars), ...(hex === null ? {} : onColorTokens(key, hex)) }
  const next = { ...theme, seeds, light, ramps: hex === null ? ramps : { ...ramps, ...generateSeedRamps(key, hex) } }
  // Surfaces and glow shadows are derived from seeds: keep them in sync
  return applyShadows(applySurfaces(next))
}

/** Color that tints surfaces: the neutral seed when it has a hue, otherwise the brand seed. */
export function surfaceSource(theme: ThemeConfig): string {
  const neutral = theme.seeds.neutral
  if (neutral && hexToHsl(neutral)[1] > 3) return neutral
  return theme.seeds.brand ?? defaultSeed('brand')
}

const mergeModes = (theme: ThemeConfig, vars: string[], tokens: { light: Record<string, string>; dark: Record<string, string> }) => ({
  ...theme,
  light: { ...without(theme.light, vars), ...tokens.light },
  dark: { ...without(theme.dark, vars), ...tokens.dark },
})

function applySurfaces(theme: ThemeConfig): ThemeConfig {
  const opts = theme.controls.surfaces
  if (!opts) return theme
  return mergeModes(theme, SURFACE_VARS, surfaceTokens(surfaceSource(theme), opts))
}

function applyShadows(theme: ThemeConfig): ThemeConfig {
  const style = theme.controls.shadows
  if (!style) return theme
  return mergeModes(theme, SHADOW_VARS, shadowTokens(style, theme.seeds.brand ?? defaultSeed('brand')))
}

/** Surface tint (0–1) and dark depth (-1–1); both 0 restores Payload's surfaces. */
export function setSurfaces(theme: ThemeConfig, opts: SurfaceOptions | null): ThemeConfig {
  const controls: ThemeConfig['controls'] = { ...theme.controls }
  if (!opts || (opts.tint === 0 && opts.depth === 0)) {
    delete controls.surfaces
    return mergeModes({ ...theme, controls }, SURFACE_VARS, { light: {}, dark: {} })
  }
  controls.surfaces = { tint: opts.tint, depth: opts.depth }
  return applySurfaces({ ...theme, controls })
}

export function setShadows(theme: ThemeConfig, style: ShadowStyle): ThemeConfig {
  const controls: ThemeConfig['controls'] = { ...theme.controls, shadows: style }
  if (style === 'default') {
    delete controls.shadows
    return mergeModes({ ...theme, controls }, SHADOW_VARS, { light: {}, dark: {} })
  }
  return applyShadows({ ...theme, controls })
}

export function setBorders(theme: ThemeConfig, style: BorderStyle): ThemeConfig {
  const controls: ThemeConfig['controls'] = { ...theme.controls, borders: style }
  if (style === 'default') delete controls.borders
  return mergeModes({ ...theme, controls }, BORDER_VARS, borderTokens(style))
}

export function setRamp(theme: ThemeConfig, varName: string, value: string | null): ThemeConfig {
  if (!varName.startsWith('--ramp-')) throw new Error(`Not a ramp variable: ${varName}`)
  const ramps = without(theme.ramps, [varName])
  return { ...theme, ramps: value === null ? ramps : { ...ramps, [varName]: value } }
}

/** Sets (or with `null` resets) a token override for one mode. */
export function setToken(theme: ThemeConfig, varName: string, value: string | null, mode: Mode): ThemeConfig {
  if (!Object.hasOwn(TOKENS, varName)) throw new Error(`Unknown Payload token: ${varName}`)
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

/** Sets (or with `null` resets) one component property. Non-color props are shared by both modes. */
export function setComponentProp(theme: ThemeConfig, id: string, prop: PropKey, value: string | null, mode: Mode): ThemeConfig {
  const def = Object.hasOwn(COMPONENT_BY_ID, id) ? COMPONENT_BY_ID[id] : undefined
  if (!def || !def.props.includes(prop)) throw new Error(`Unknown component property: ${id}.${prop}`)
  if (value !== null && !isValidComponentValue(prop, value)) throw new Error(`Invalid value for ${id}.${prop}`)
  const m: Mode = isColorProp(prop) ? mode : 'light'
  const current = theme.components[id] ?? {}
  const map = { ...current[m] }
  if (value === null) delete map[prop]
  else map[prop] = value
  const next = { ...current, [m]: map }
  const components = { ...theme.components, [id]: next }
  if (!Object.keys(next.light ?? {}).length && !Object.keys(next.dark ?? {}).length) delete components[id]
  return { ...theme, components }
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
      if (!Object.hasOwn(TOKENS, k) || (name === 'ramps') !== k.startsWith('--ramp-') || typeof v !== 'string') {
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
      if (!Object.hasOwn(FONT_VARS, role) || typeof family !== 'string' || !isSafeValue(family)) {
        throw new Error(`controls.fonts: invalid entry ${role}`)
      }
      controls.fonts[role as FontRole] = family
    }
  }

  if (c.surfaces !== undefined) {
    const { tint, depth } = c.surfaces ?? ({} as SurfaceOptions)
    if (typeof tint !== 'number' || tint < 0 || tint > 1 || typeof depth !== 'number' || depth < -1 || depth > 1) {
      throw new Error('controls.surfaces out of range')
    }
    controls.surfaces = { tint, depth }
  }
  if (c.shadows !== undefined) {
    if (!SHADOW_STYLES.includes(c.shadows)) throw new Error('controls.shadows invalid')
    controls.shadows = c.shadows
  }
  if (c.borders !== undefined) {
    if (!BORDER_STYLES.includes(c.borders)) throw new Error('controls.borders invalid')
    controls.borders = c.borders
  }

  const components: ComponentStyles = {}
  const rawComponents = (t as { components?: unknown }).components ?? {}
  if (!rawComponents || typeof rawComponents !== 'object' || Array.isArray(rawComponents)) throw new Error('components must be an object')
  for (const [id, styles] of Object.entries(rawComponents as Record<string, unknown>)) {
    if (!Object.hasOwn(COMPONENT_BY_ID, id) || !styles || typeof styles !== 'object') throw new Error(`components: unknown component ${id}`)
    const def = COMPONENT_BY_ID[id]
    for (const mode of ['light', 'dark'] as const) {
      const values = (styles as Record<string, unknown>)[mode]
      if (values === undefined) continue
      if (!values || typeof values !== 'object') throw new Error(`components.${id}.${mode} must be an object`)
      for (const [prop, value] of Object.entries(values)) {
        if (!Object.hasOwn(PROPS, prop) || !def.props.includes(prop as PropKey) || typeof value !== 'string' || !isValidComponentValue(prop as PropKey, value)) {
          throw new Error(`components.${id}.${mode}: invalid ${prop}`)
        }
        if (mode === 'dark' && !isColorProp(prop as PropKey)) throw new Error(`components.${id}.dark: ${prop} is shared, set it in light`)
      }
      ;(components[id] ??= {})[mode] = values as Partial<Record<PropKey, string>>
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
    components,
    customCss,
  }
}
