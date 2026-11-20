import { hexToHsl, hexToRgb, hslToHex, parseColor, rgbToHex } from './color'
import { schema, TOKENS } from './schema'

// High-level editor controls. Each maps one input onto the group of Payload tokens it drives;
// the result is merged into ThemeConfig.light (mode-independent tokens).

const px = (n: number) => `${+(n / 16).toFixed(4)}rem`
const remToPx = (v: string) => (v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v))

// ─── Roundness ──────────────────────────────────────────────────────────────

/** Payload default: --radius-medium = 5px. Other steps keep Payload's ratios to medium. */
export const DEFAULT_ROUNDNESS = remToPx(TOKENS['--radius-medium'].light)

const RADIUS_RATIOS = {
  '--radius-small': remToPx(TOKENS['--radius-small'].light) / DEFAULT_ROUNDNESS,
  '--radius-chip': remToPx(TOKENS['--radius-chip'].light) / DEFAULT_ROUNDNESS,
  '--radius-medium': 1,
  '--radius-large': remToPx(TOKENS['--radius-large'].light) / DEFAULT_ROUNDNESS,
}

/** Button, field and popup radii reference these tokens, so one value restyles them all. */
export function roundnessTokens(mediumPx: number): Record<string, string> {
  return Object.fromEntries(
    Object.entries(RADIUS_RATIOS).map(([v, ratio]) => [v, px(Math.round(mediumPx * ratio * 4) / 4)]),
  )
}

// ─── Density ────────────────────────────────────────────────────────────────

export const DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type Density = (typeof DENSITIES)[number]

const DENSITY_TOKENS: Record<Density, Record<string, string>> = {
  // Payload's defaults
  compact: {},
  comfortable: {
    '--field-min-height-large': '2.75rem',
    '--field-min-height-medium': '2.5rem',
    '--field-padding-inline': '0.875rem',
    '--button-height': '2.5rem',
    '--control-height': '2.5rem',
  },
  spacious: {
    '--field-min-height-large': '3.25rem',
    '--field-min-height-medium': '2.875rem',
    '--field-padding-inline': '1.125rem',
    '--button-height': '2.875rem',
    '--control-height': '2.875rem',
  },
}

export function densityTokens(density: Density): Record<string, string> {
  return DENSITY_TOKENS[density]
}

export const DENSITY_VARS = Object.keys(DENSITY_TOKENS.spacious)

// ─── Spacing scale ──────────────────────────────────────────────────────────

/** Literal `--spacer-*` steps; gutters, gaps and paddings reference these. */
const SPACER_TOKENS = schema.tokens.filter((t) => /^--spacer-/.test(t.var) && /rem$/.test(t.light))

/** Follows var() aliases to Payload's literal default. */
function literal(v: string): string {
  const value = TOKENS[v].light
  const ref = value.match(/^var\((--[\w-]+)\)$/)
  return ref ? literal(ref[1]) : value
}

// Control heights are spacer aliases; pinned so the spacing scale leaves them to Control size
const HEIGHT_VARS = ['--field-min-height-large', '--field-min-height-medium', '--button-height', '--control-height']

export const SPACING_VARS = [...SPACER_TOKENS.map((t) => t.var), ...HEIGHT_VARS]

/** Multiplies Payload's spacing steps (1 = default) without resizing controls. */
export function spacingTokens(scale: number): Record<string, string> {
  if (scale === 1) return {}
  return {
    ...Object.fromEntries(SPACER_TOKENS.map((t) => [t.var, px(Math.round(remToPx(t.light) * scale * 4) / 4)])),
    ...Object.fromEntries(HEIGHT_VARS.map((v) => [v, literal(v)])),
  }
}

// ─── Type scale ─────────────────────────────────────────────────────────────

/** Every literal `--text-*-font-size` / `-line-height` Payload defines (aliases follow them). */
const TYPE_SIZE_TOKENS = schema.tokens.filter(
  (t) => t.file === 'typography' && /-(font-size|line-height)$/.test(t.var) && /rem$/.test(t.light),
)

export const TYPE_SCALE_VARS = TYPE_SIZE_TOKENS.map((t) => t.var)

export type TypeProp = 'font-size' | 'line-height' | 'font-weight' | 'letter-spacing'

export const TYPE_LEVELS: { id: string; label: string; group: 'Body text' | 'Headings' | 'Code' }[] = [
  ...['small', 'medium', 'large', 'xl', '2xl'].map((s) => ({ id: `body-${s}`, label: s, group: 'Body text' as const })),
  ...['small', 'medium', 'large', 'xl', '2xl', '3xl', '4xl'].map((s) => ({ id: `heading-${s}`, label: s, group: 'Headings' as const })),
  ...['small', 'medium', 'large', 'xl'].map((s) => ({ id: `mono-${s}`, label: s, group: 'Code' as const })),
]

/** Token holding one property of a type level (Payload names the mono weight `-weight`). */
export const typeVar = (level: string, prop: TypeProp) =>
  `--text-${level}-${level.startsWith('mono') && prop === 'font-weight' ? 'weight' : prop}`

/**
 * Tokens for one property of a type level, in px (unitless for weight). Body levels also have
 * bold and paragraph variants: size and spacing follow, paragraphs keep their extra line height,
 * and bold keeps its own weight (see `boldWeightTokens`).
 */
export function typeLevelTokens(level: string, prop: TypeProp, value: number): Record<string, string> {
  const css = prop === 'font-weight' ? String(value) : prop === 'letter-spacing' ? `${value}px` : px(value)
  if (!level.startsWith('body')) return { [typeVar(level, prop)]: css }
  const out: Record<string, string> = { [typeVar(level, prop)]: css }
  if (prop !== 'font-weight') out[typeVar(`${level}-bold`, prop)] = css
  if (prop === 'line-height') {
    const extra = remToPx(TOKENS[typeVar(`${level}-paragraph`, prop)].light) - remToPx(TOKENS[typeVar(level, prop)].light)
    out[typeVar(`${level}-paragraph`, prop)] = px(value + extra)
  } else {
    out[typeVar(`${level}-paragraph`, prop)] = css
  }
  return out
}

/** Weight of every bold body variant. */
export function boldWeightTokens(weight: number): Record<string, string> {
  return Object.fromEntries(
    schema.tokens.filter((t) => /^--text-body-[a-z0-9]+-bold-font-weight$/.test(t.var)).map((t) => [t.var, String(weight)]),
  )
}

/** Multiplies Payload's type scale (1 = default; Payload's body text is 12px). */
export function typeScaleTokens(scale: number): Record<string, string> {
  if (scale === 1) return {}
  return Object.fromEntries(TYPE_SIZE_TOKENS.map((t) => [t.var, px(Math.round(remToPx(t.light) * scale * 4) / 4)]))
}

// ─── Fonts ──────────────────────────────────────────────────────────────────

export type FontRole = 'body' | 'heading' | 'mono'

export const FONT_VARS: Record<FontRole, string> = {
  body: '--text-body-family',
  heading: '--text-heading-family',
  mono: '--text-mono-family',
}

/** Payload uses the family token unquoted in a stack (`var(--x), sans-serif`), so quote names. */
export function fontValue(family: string): string {
  return family.includes(',') || family.startsWith("'") ? family : `'${family}'`
}

/** First family of a CSS font value, unquoted — used to load it from Google Fonts. */
export function primaryFamily(value: string): string {
  return value.split(',')[0].trim().replace(/^['"]|['"]$/g, '')
}

// ─── Surfaces ───────────────────────────────────────────────────────────────
//
// Payload's light page is pure white and its greys are neutral, so seeds alone barely touch the
// "feel" of the admin. Tint re-hues every surface role toward a source color (the neutral seed,
// or the brand seed when the neutral is a pure grey); depth lightens or darkens dark mode.

export interface SurfaceOptions {
  /** 0 = Payload's neutral surfaces, 1 = clearly tinted */
  tint: number
  /** -1 = deep/near-black dark mode, 0 = Payload, 1 = dim/lifted dark mode */
  depth: number
}

// Lightness of each role in Payload's defaults (white/grey ramp steps)
const LIGHT_SURFACES: Record<string, number> = {
  '--color-bg': 100,
  '--color-bg-elevated': 100,
  '--color-bg-secondary': 96.1,
  '--color-bg-hover': 96.1,
  '--color-bg-tertiary': 90.2,
  '--color-bg-pressed': 90.2,
  '--color-bg-secondary-hover': 90.2,
  '--color-bg-secondary-pressed': 85.1,
}
const DARK_SURFACES: Record<string, number> = {
  '--color-bg': 17.3,
  '--color-bg-elevated': 11.8,
  '--color-bg-secondary': 22,
  '--color-bg-hover': 22,
  '--color-bg-tertiary': 26.7,
  '--color-bg-pressed': 26.7,
  '--color-bg-secondary-hover': 26.7,
  '--color-bg-secondary-pressed': 45.9,
}

export const SURFACE_VARS = [...Object.keys(LIGHT_SURFACES), '--special-bg-transparent', '--color-border']

const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function surfaceTokens(source: string, { tint, depth }: SurfaceOptions): { light: Record<string, string>; dark: Record<string, string> } {
  if (tint === 0 && depth === 0) return { light: {}, dark: {} }
  // The source only supplies the hue; tint alone decides how colored surfaces get. Full tint
  // lands near hand-made themes like Light Cream (#faf7ed: ~64% sat, ~95% lightness).
  const [h] = hexToHsl(source)
  const sat = 70 * tint
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}
  if (tint > 0) {
    for (const [v, l] of Object.entries(LIGHT_SURFACES)) {
      // White can't carry a hue, so tinted surfaces step slightly down from it
      // Elevated surfaces stay lighter than the page so cards and popups lift off it
      light[v] = hslToHex(h, sat, l - (v === '--color-bg-elevated' ? 2 : 6) * tint)
    }
    light['--color-border'] = hslToHex(h, sat * 0.45, 88 - 7 * tint)
    light['--special-bg-transparent'] = rgba(light['--color-bg'], 0.6)
  }
  for (const [v, l] of Object.entries(DARK_SURFACES)) {
    dark[v] = hslToHex(h, sat * 0.3, Math.max(3, l + depth * (v === '--color-bg-secondary-pressed' ? 4 : 6)))
  }
  dark['--color-border'] = hslToHex(h, sat * 0.25, Math.max(14, 26.7 + depth * 5))
  dark['--special-bg-transparent'] = rgba(dark['--color-bg'], 0.6)
  return { light, dark }
}

// ─── Shadows ────────────────────────────────────────────────────────────────

export const SHADOW_STYLES = ['default', 'flat', 'soft', 'deep', 'glow'] as const
export type ShadowStyle = (typeof SHADOW_STYLES)[number]

export const SHADOW_VARS = ['--elevation-100-canvas', '--elevation-300-tooltip', '--elevation-400-menu-panel', '--elevation-500-modal-window']

/** `c(a)` is the shadow color at alpha a — black, or the glow color */
function shadowSet(style: Exclude<ShadowStyle, 'default'>, c: (a: number) => string, dark: boolean): string[] {
  const k = dark ? 2.2 : 1
  const a = (n: number) => c(Math.min(0.9, +(n * k).toFixed(3)))
  switch (style) {
    case 'flat':
      return [`0 0 0 1px ${a(0.06)}`, `0 0 0 1px ${a(0.1)}`, `0 0 0 1px ${a(0.1)}`, `0 0 0 1px ${a(0.12)}`]
    case 'soft':
      return [
        `0 1px 2px ${a(0.05)}`,
        `0 4px 14px ${a(0.08)}, 0 1px 3px ${a(0.06)}`,
        `0 12px 32px ${a(0.1)}, 0 2px 8px ${a(0.06)}`,
        `0 24px 64px ${a(0.16)}, 0 4px 14px ${a(0.08)}`,
      ]
    case 'deep':
      return [
        `0 1px 3px ${a(0.12)}, 0 1px 2px ${a(0.08)}`,
        `0 10px 24px ${a(0.2)}, 0 2px 6px ${a(0.14)}`,
        `0 20px 44px ${a(0.24)}, 0 4px 12px ${a(0.16)}`,
        `0 32px 80px ${a(0.32)}, 0 8px 20px ${a(0.18)}`,
      ]
    case 'glow':
      return [
        `0 0 0 1px ${a(0.12)}`,
        `0 0 0 1px ${a(0.2)}, 0 6px 20px ${a(0.22)}`,
        `0 0 0 1px ${a(0.2)}, 0 14px 36px ${a(0.26)}`,
        `0 0 0 1px ${a(0.24)}, 0 28px 72px ${a(0.32)}`,
      ]
  }
}

export function shadowTokens(style: ShadowStyle, glowHex: string): { light: Record<string, string>; dark: Record<string, string> } {
  if (style === 'default') return { light: {}, dark: {} }
  const color = style === 'glow' ? glowHex : '#000000'
  const c = (alpha: number) => rgba(color, alpha)
  const zip = (vals: string[]) => Object.fromEntries(SHADOW_VARS.map((v, i) => [v, vals[i]]))
  return { light: zip(shadowSet(style, c, false)), dark: zip(shadowSet(style, c, true)) }
}

export interface ShadowLayer {
  x: number
  y: number
  blur: number
  spread: number
  /** #rrggbb */
  color: string
  /** 0–1 */
  opacity: number
}

/** Splits a box-shadow on top-level commas. */
const layersOf = (v: string) => v.split(/,(?![^(]*\))/).map((l) => l.trim()).filter(Boolean)

/** The most visible (largest blur) outer layer of a box-shadow, or null for none / unparseable. */
export function parseShadow(value: string): ShadowLayer | null {
  let best: ShadowLayer | null = null
  for (const layer of layersOf(value)) {
    if (/\binset\b/.test(layer)) continue
    const color = layer.match(/(rgba?\([^)]*\)|#[0-9a-f]{3,8})/i)?.[0]
    const nums = layer.replace(color ?? '', '').trim().split(/\s+/).map((n) => parseFloat(n))
    if (nums.length < 2 || nums.some((n) => Number.isNaN(n))) continue
    const c = parseColor(color ?? '#000000')
    if (!c) continue
    const [x, y, blur = 0, spread = 0] = nums
    if (!best || blur >= best.blur) best = { x, y, blur, spread, color: rgbToHex(c.r, c.g, c.b), opacity: +c.a.toFixed(3) }
  }
  return best
}

/** A custom shadow level; dark mode gets the same shape, stronger, like the presets. */
export function shadowLayerTokens(l: ShadowLayer): { light: string; dark: string } {
  const at = (a: number) => `${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba(l.color, +a.toFixed(3))}`
  return { light: at(l.opacity), dark: at(Math.min(0.9, l.opacity * 2.2)) }
}

export function isValidShadowLayer(l: unknown): l is ShadowLayer {
  if (!l || typeof l !== 'object') return false
  const s = l as ShadowLayer
  const inRange = (n: unknown, min: number, max: number) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max
  return (
    inRange(s.x, -100, 100) &&
    inRange(s.y, -100, 100) &&
    inRange(s.blur, 0, 200) &&
    inRange(s.spread, -100, 100) &&
    inRange(s.opacity, 0, 1) &&
    typeof s.color === 'string' &&
    /^#[0-9a-f]{6}$/i.test(s.color)
  )
}

// ─── Borders ────────────────────────────────────────────────────────────────

export const BORDER_STYLES = ['subtle', 'default', 'strong'] as const
export type BorderStyle = (typeof BORDER_STYLES)[number]

export const BORDER_VARS = ['--special-border-translucent', '--special-border-translucent-strong', '--stroke-width-small']

export function borderTokens(style: BorderStyle): { light: Record<string, string>; dark: Record<string, string> } {
  if (style === 'subtle') {
    return {
      light: { '--special-border-translucent': 'var(--ramp-black-100)', '--special-border-translucent-strong': 'var(--ramp-black-200)' },
      dark: { '--special-border-translucent': 'var(--ramp-white-100)', '--special-border-translucent-strong': 'var(--ramp-white-200)' },
    }
  }
  if (style === 'strong') {
    return {
      light: {
        '--special-border-translucent': 'var(--ramp-black-300)',
        '--special-border-translucent-strong': 'var(--ramp-black-500)',
        '--stroke-width-small': '1.5px',
      },
      dark: { '--special-border-translucent': 'var(--ramp-white-300)', '--special-border-translucent-strong': 'var(--ramp-white-400)' },
    }
  }
  return { light: {}, dark: {} }
}
