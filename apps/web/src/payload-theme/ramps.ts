import { clamp, hexToHsl, hslToHex, isHex, normalizeHex } from './color'
import { DEFAULT_RAMPS, rampVar } from './schema'

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
    description: 'Primary buttons, links, focus rings and selection',
    family: 'blue',
    anchor: '500',
    related: ['pale-blue'],
  },
  accent: {
    label: 'Accent',
    description: 'Component highlights (Payload uses purple)',
    family: 'purple',
    anchor: '500',
    related: ['pale-purple'],
  },
  neutral: {
    label: 'Neutral',
    description: 'Greys for surfaces, borders and secondary text',
    family: 'grey',
    anchor: '500',
    related: [],
  },
  success: { label: 'Success', description: 'Published states, confirmations', family: 'green', anchor: '500', related: ['pale-green'] },
  warning: { label: 'Warning', description: 'Drafts, cautions', family: 'yellow', anchor: '500', related: ['pale-yellow'] },
  danger: {
    label: 'Danger',
    description: 'Errors, destructive actions',
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
  const list = steps(family)
  const anchorIdx = anchor ? list.indexOf(anchor) : -1
  const out: Record<string, string> = {}

  list.forEach((step, i) => {
    const [dh, ds, dl] = hexToHsl(DEFAULT_RAMPS[family][step])
    const falloff = anchorIdx < 0 ? 0 : Math.max(0, 1 - Math.abs(i - anchorIdx) / Math.max(anchorIdx, list.length - 1 - anchorIdx))
    // Grey has no hue of its own: every step takes the seed's tint, capped so it stays neutral
    const sat = sa > 1 ? ds * satRatio : Math.min(s, 30)
    const hue = sa > 1 ? h + (dh - ha) : h
    out[rampVar(family, step)] = hslToHex(hue, clamp(sat), clamp(dl + (l - la) * falloff))
  })
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
