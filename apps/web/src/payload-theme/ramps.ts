import { clamp, contrastRatio, hexToHsl, hslToHex, isHex, normalizeHex } from './color'
import { DEFAULT_RAMPS, rampVar, TOKENS } from './schema'

// Seeds are the editor's primary lever: one color per role regenerates the Payload ramp
// families that role drives. Generated ramps follow Payload's own lightness curve, so
// contrast between steps stays close to what Payload's semantic tokens were designed for.

export const SEED_KEYS = ['brand', 'accent', 'neutral', 'success', 'warning', 'danger'] as const
export type SeedKey = (typeof SEED_KEYS)[number]

interface SeedSpec {
  label: string
  description: string
  /** The family whose anchor step becomes exactly the seed color */
  family: string
  anchor: string
  /** Related families (dark-mode "pale"/"dark" variants) re-hued to match */
  related: string[]
}

export const SEEDS: Record<SeedKey, SeedSpec> = {
  brand: {
    label: 'Brand',
    description: 'Primary buttons, links, checkboxes, switches, focus rings and selected items',
    family: 'blue',
    anchor: '500',
    related: ['pale-blue'],
  },
  accent: {
    label: 'Accent',
    description: 'Payload’s purple “component” colors — not used by the admin today',
    family: 'purple',
    anchor: '500',
    related: ['pale-purple'],
  },
  neutral: {
    label: 'Neutral',
    description: 'All the greys: panels, borders, hover states and secondary text',
    family: 'grey',
    anchor: '500',
    related: [],
  },
  success: { label: 'Success', description: 'Success messages, published states and confirmations', family: 'green', anchor: '500', related: ['pale-green'] },
  warning: { label: 'Warning', description: 'Warnings, draft states and cautions', family: 'yellow', anchor: '500', related: ['pale-yellow'] },
  danger: {
    label: 'Danger',
    description: 'Errors, validation messages and delete buttons',
    family: 'red',
    anchor: '500',
    related: ['dark-red', 'pale-red'],
  },
}

/** Payload's default anchor color for a seed (what the editor shows before any change). */
export function defaultSeed(key: SeedKey): string {
  const { family, anchor } = SEEDS[key]
  return DEFAULT_RAMPS[family][anchor]
}

const steps = (family: string) => Object.keys(DEFAULT_RAMPS[family]).sort((a, b) => Number(a) - Number(b))

/**
 * Re-hues one family to a seed. Hue and saturation follow the seed (keeping each step's
 * hue/saturation offset from the anchor); lightness keeps Payload's curve, pulled toward the
 * seed near the anchor and fading out toward the ends of the ramp.
 */
function deriveFamily(
  family: string,
  seed: [number, number, number],
  anchorDefault: [number, number, number],
  anchor: string | null,
): Record<string, string> {
  const [h, s, l] = seed
  const [ha, sa, la] = anchorDefault
  const satRatio = sa > 1 ? s / sa : 1
  const out: Record<string, string> = {}

  for (const step of steps(family)) {
    const [dh, ds, dl] = hexToHsl(DEFAULT_RAMPS[family][step])
    // Lightness maps proportionally: steps lighter than Payload's anchor scale into seed→white,
    // darker ones into black→seed. Never clips (a bright seed can't push a step to pure white)
    // and keeps Payload's spacing. Related families (no anchor) keep their own lightness.
    const lig = !anchor ? dl : dl >= la ? l + ((dl - la) * (100 - l)) / Math.max(1e-6, 100 - la) : (dl * l) / Math.max(1e-6, la)
    // Grey has no hue of its own: every step takes the seed's tint, capped so it stays neutral
    const sat = sa > 1 ? ds * satRatio : Math.min(s, 30)
    const hue = sa > 1 ? h + (dh - ha) : h
    out[rampVar(family, step)] = hslToHex(hue, clamp(sat), clamp(lig))
  }
  return out
}

/** All `--ramp-*` values a seed controls. */
export function generateSeedRamps(key: SeedKey, seedHex: string): Record<string, string> {
  if (!isHex(seedHex)) throw new Error(`Seed must be a hex color, got "${seedHex}"`)
  const seedHexNorm = normalizeHex(seedHex)
  const spec = SEEDS[key]
  const seed = hexToHsl(seedHexNorm)
  const anchorDefault = hexToHsl(DEFAULT_RAMPS[spec.family][spec.anchor])

  const ramps = deriveFamily(spec.family, seed, anchorDefault, spec.anchor)
  ramps[rampVar(spec.family, spec.anchor)] = seedHexNorm

  for (const related of spec.related) {
    // Related families keep their own lightness; only hue/saturation follow the seed.
    Object.assign(ramps, deriveFamily(related, seed, anchorDefault, null))
  }
  return ramps
}

/** Every ramp var a seed writes, so resetting a seed can remove exactly those overrides. */
export function seedRampVars(key: SeedKey): string[] {
  const { family, related } = SEEDS[key]
  return [family, ...related].flatMap((f) => steps(f).map((s) => rampVar(f, s)))
}

// ─── Text on brand / accent ─────────────────────────────────────────────────
//
// Payload paints labels on brand and component colors white. That fails WCAG on light or
// mid-tone seeds (even Payload's own #0d99ff is 3:1), so a seed also picks white or near-black
// labels — whichever contrasts more.

const DARK_LABEL = '#111111'

export const ON_COLOR_VARS: Partial<Record<SeedKey, string[]>> = {
  brand: ['--color-text-onbrand', '--color-icon-onbrand', '--color-text-onbrand-secondary', '--color-icon-onbrand-secondary'],
  accent: ['--color-text-oncomponent', '--color-icon-oncomponent'],
}

export function onColorTokens(key: SeedKey, seedHex: string): Record<string, string> {
  const vars = ON_COLOR_VARS[key]
  if (!vars) return {}
  const hex = normalizeHex(seedHex)
  if (contrastRatio('#ffffff', hex) >= contrastRatio(DARK_LABEL, hex)) return {}
  return Object.fromEntries(vars.map((v) => [v, v.endsWith('-secondary') ? 'rgba(17, 17, 17, 0.7)' : DARK_LABEL]))
}

/** Payload component blocks that use any step of the scales a seed controls. */
export function seedUsage(key: SeedKey): string[] {
  const blocks = new Set<string>()
  for (const v of seedRampVars(key)) for (const b of TOKENS[v]?.usedBy ?? []) blocks.add(b)
  return [...blocks].sort()
}
