import { describe, expect, it } from 'vitest'
import { hexToHsl } from '@/payload-theme/color'
import { buildThemeCss, darkDeclarations } from '@/payload-theme/css'
import { SHADOW_VARS } from '@/payload-theme/controls'
import { defaultTheme, parseTheme, setBorders, setSeed, setShadows, setSurfaces } from '@/payload-theme/theme'

describe('surfaces', () => {
  it('tints light and dark surfaces from the neutral seed', () => {
    const t = setSurfaces(setSeed(defaultTheme(), 'neutral', '#78716c'), { tint: 1, depth: 0 })
    // hue is only measurable on mid-lightness surfaces (near-white hex rounding scrambles it)
    const [h, s] = hexToHsl(t.light['--color-bg-secondary-pressed'])
    expect(Math.abs(h - hexToHsl('#78716c')[0])).toBeLessThan(6)
    expect(s).toBeGreaterThan(10)
    expect(hexToHsl(t.light['--color-bg'])[2]).toBeGreaterThan(92)
    expect(t.dark['--color-bg']).toBeDefined()
    expect(darkDeclarations(t)['--color-bg']).toBe(t.dark['--color-bg'])
  })

  it('falls back to the brand hue when the neutral seed is grey, and follows seed changes', () => {
    let t = setSurfaces(setSeed(defaultTheme(), 'brand', '#e11d48'), { tint: 0.6, depth: 0 })
    const hue = (hex: string) => hexToHsl(hex)[0]
    expect(Math.abs(hue(t.light['--color-bg-secondary-pressed']) - hue('#e11d48'))).toBeLessThan(6)
    t = setSeed(t, 'brand', '#059669')
    expect(Math.abs(hue(t.light['--color-bg-secondary-pressed']) - hue('#059669'))).toBeLessThan(6)
  })

  it('depth darkens dark mode, and resetting removes every surface override', () => {
    const deep = setSurfaces(defaultTheme(), { tint: 0, depth: -1 })
    expect(hexToHsl(deep.dark['--color-bg'])[2]).toBeLessThan(13)
    expect(deep.light).toEqual({})
    const reset = setSurfaces(deep, null)
    expect(reset.dark).toEqual({})
    expect(reset.controls.surfaces).toBeUndefined()
  })
})

describe('shadows and borders', () => {
  it('writes all four elevations for both modes and glows in the brand color', () => {
    const t = setShadows(setSeed(defaultTheme(), 'brand', '#ff0000'), 'glow')
    for (const v of SHADOW_VARS) {
      expect(t.light[v]).toContain('rgba(255, 0, 0')
      expect(t.dark[v]).toBeDefined()
    }
    expect(setShadows(t, 'default').light).toEqual({})
  })

  it('border presets round-trip through parseTheme and CSS', () => {
    const t = setBorders(setShadows(setSurfaces(defaultTheme(), { tint: 0.5, depth: 0.3 }), 'soft'), 'strong')
    expect(parseTheme(JSON.parse(JSON.stringify(t)))).toEqual(t)
    expect(buildThemeCss(t)).toContain('--special-border-translucent: var(--ramp-black-300);')
    expect(() => parseTheme({ version: 4, controls: { surfaces: { tint: 3, depth: 0 } } })).toThrow()
    expect(() => parseTheme({ version: 4, controls: { shadows: 'neon' } })).toThrow()
  })
})
