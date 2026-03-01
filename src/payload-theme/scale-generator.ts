// ─── Scale Generator ─────────────────────────────────────────────────────────
//
// Generates all 16 --color-base-* steps via two-segment linear HSL interpolation.
// Segment A: steps 0–500  (lightest → mid)
// Segment B: steps 500–1000 (mid → darkest)

const BASE_STEPS = [0, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 950, 1000] as const

export function hexToHsl(hex: string): [number, number, number] {
  let r: number, g: number, b: number

  // Handle rgb() format (Payload's default values use this)
  const rgbMatch = hex.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (rgbMatch) {
    r = parseInt(rgbMatch[1]) / 255
    g = parseInt(rgbMatch[2]) / 255
    b = parseInt(rgbMatch[3]) / 255
  } else {
    const clean = hex.replace('#', '')
    r = parseInt(clean.slice(0, 2), 16) / 255
    g = parseInt(clean.slice(2, 4), 16) / 255
    b = parseInt(clean.slice(4, 6), 16) / 255
  }

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return [h * 360, s * 100, l * 100]
}

export function hslToHex(h: number, s: number, l: number): string {
  const hNorm = h / 360
  const sNorm = s / 100
  const lNorm = l / 100

  let r: number, g: number, b: number

  if (sNorm === 0) {
    r = g = b = lNorm
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
    const p = 2 * lNorm - q
    r = hue2rgb(p, q, hNorm + 1 / 3)
    g = hue2rgb(p, q, hNorm)
    b = hue2rgb(p, q, hNorm - 1 / 3)
  }

  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpHsl(
  h1: number, s1: number, l1: number,
  h2: number, s2: number, l2: number,
  t: number,
): [number, number, number] {
  // Interpolate hue via shortest path
  let dh = h2 - h1
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  return [h1 + dh * t, lerp(s1, s2, t), lerp(l1, l2, t)]
}

/**
 * Generates all 16 base-scale CSS custom properties via two-segment HSL interpolation.
 * lightest → mid covers steps 0–500; mid → darkest covers steps 500–1000.
 *
 * @param lightest - hex color for step 0
 * @param mid      - hex color for step 500
 * @param darkest  - hex color for step 1000
 * @returns Record of `{ "--color-base-0": "#...", "--color-base-50": "...", ... }`
 */
export interface ScaleAnchor {
  step: number  // 0–1000
  color: string // hex
}

/**
 * N-point interpolation across the 16 base steps.
 * Anchors are sorted by step. Steps before the first anchor use the first anchor's color;
 * steps after the last use the last anchor's color.
 */
export function generateBaseScaleFromAnchors(anchors: ScaleAnchor[]): Record<string, string> {
  const sorted = [...anchors].sort((a, b) => a.step - b.step)
  const parsed = sorted.map(a => ({ step: a.step, hsl: hexToHsl(a.color) }))
  const result: Record<string, string> = {}

  for (const step of BASE_STEPS) {
    if (parsed.length === 0) {
      result[`--color-base-${step}`] = '#888888'
      continue
    }
    if (parsed.length === 1 || step <= parsed[0].step) {
      const [h, s, l] = parsed[0].hsl
      result[`--color-base-${step}`] = hslToHex(h, s, l)
      continue
    }
    if (step >= parsed[parsed.length - 1].step) {
      const [h, s, l] = parsed[parsed.length - 1].hsl
      result[`--color-base-${step}`] = hslToHex(h, s, l)
      continue
    }

    // Find the two anchors this step falls between
    let lo = 0
    for (let i = 1; i < parsed.length; i++) {
      if (parsed[i].step >= step) { lo = i - 1; break }
    }
    const hi = lo + 1
    const range = parsed[hi].step - parsed[lo].step
    const t = range === 0 ? 0 : (step - parsed[lo].step) / range
    const [h1, s1, l1] = parsed[lo].hsl
    const [h2, s2, l2] = parsed[hi].hsl
    const [h, s, l] = lerpHsl(h1, s1, l1, h2, s2, l2, t)
    result[`--color-base-${step}`] = hslToHex(h, s, l)
  }

  return result
}

export function generateBaseScale(
  lightest: string,
  mid: string,
  darkest: string,
): Record<string, string> {
  const [h0, s0, l0] = hexToHsl(lightest)
  const [hm, sm, lm] = hexToHsl(mid)
  const [h1, s1, l1] = hexToHsl(darkest)

  const result: Record<string, string> = {}

  for (const step of BASE_STEPS) {
    let h: number, s: number, l: number
    if (step <= 500) {
      const t = step / 500
      ;[h, s, l] = lerpHsl(h0, s0, l0, hm, sm, lm, t)
    } else {
      const t = (step - 500) / 500
      ;[h, s, l] = lerpHsl(hm, sm, lm, h1, s1, l1, t)
    }
    result[`--color-base-${step}`] = hslToHex(h, s, l)
  }

  return result
}
