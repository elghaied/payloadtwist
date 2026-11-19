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

// ─── Type scale ─────────────────────────────────────────────────────────────

/** Every literal `--text-*-font-size` / `-line-height` Payload defines (aliases follow them). */
const TYPE_SIZE_TOKENS = schema.tokens.filter(
  (t) => t.file === 'typography' && /-(font-size|line-height)$/.test(t.var) && /rem$/.test(t.light),
)

export const TYPE_SCALE_VARS = TYPE_SIZE_TOKENS.map((t) => t.var)

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
