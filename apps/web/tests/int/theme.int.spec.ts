import { describe, expect, it } from 'vitest'
import { contrastRatio, flatten, hexToHsl, hslToHex, parseColor } from '@/payload-theme/color'
import { buildThemeCss, buildThemePackage, darkDeclarations, isDefaultTheme } from '@/payload-theme/css'
import { generateSeedRamps, seedRampVars } from '@/payload-theme/ramps'
import { DEFAULT_RAMPS, resolveToken, TOKENS } from '@/payload-theme/schema'
import {
  defaultTheme,
  parseTheme,
  setDensity,
  setFont,
  setRoundness,
  setSeed,
  setToken,
  setTypeScale,
} from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'

describe('color', () => {
  it('round-trips hex through HSL', () => {
    for (const hex of ['#0d99ff', '#14ae5c', '#f24822', '#444444', '#ffffff', '#000000']) {
      const [h, s, l] = hexToHsl(hex)
      expect(hslToHex(h, s, l)).toBe(hex)
    }
  })
  it('parses rgba and composites translucent colors', () => {
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 })
    expect(parseColor('var(--x)')).toBeNull()
    expect(flatten('rgba(0, 0, 0, 0.5)', '#ffffff')).toBe('#808080')
    expect(flatten('#123456', '#ffffff')).toBe('#123456')
  })
  it('computes WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    expect(contrastRatio('#777777', '#777777')).toBe(1)
  })
})

describe('generateSeedRamps', () => {
  it('puts the seed exactly at the anchor step and covers related families', () => {
    const ramps = generateSeedRamps('brand', '#83BF78')
    expect(ramps['--ramp-blue-500']).toBe('#83bf78')
    expect(Object.keys(ramps).sort()).toEqual(seedRampVars('brand').sort())
    expect(Object.values(ramps).every((v) => /^#[0-9a-f]{6}$/.test(v))).toBe(true)
  })

  it('keeps Payload’s light→dark ordering of steps', () => {
    const ramps = generateSeedRamps('brand', '#83bf78')
    const steps = Object.keys(DEFAULT_RAMPS.blue).sort((a, b) => +a - +b)
    const lightness = steps.map((s) => hexToHsl(ramps[`--ramp-blue-${s}`])[2])
    for (let i = 1; i < lightness.length; i++) expect(lightness[i]).toBeLessThanOrEqual(lightness[i - 1] + 0.5)
  })

  it('reproduces Payload’s defaults for the default seed', () => {
    const ramps = generateSeedRamps('danger', DEFAULT_RAMPS.red['500'])
    for (const [step, hex] of Object.entries(DEFAULT_RAMPS.red)) {
      const [, , l1] = hexToHsl(ramps[`--ramp-red-${step}`])
      const [, , l2] = hexToHsl(hex)
      expect(Math.abs(l1 - l2)).toBeLessThan(1)
    }
  })

  it('never clips light steps to white for bright seeds', () => {
    for (const seed of ['#6366f1', '#facc15', '#22d3ee', '#f0abfc']) {
      const ramps = generateSeedRamps('brand', seed)
      expect(ramps['--ramp-blue-200']).not.toBe('#ffffff')
      expect(hexToHsl(ramps['--ramp-blue-200'])[2]).toBeLessThan(99)
      expect(hexToHsl(ramps['--ramp-blue-200'])[2]).toBeGreaterThan(hexToHsl(ramps['--ramp-blue-400'])[2])
    }
  })

  it('tints the grey family with the neutral seed', () => {
    const ramps = generateSeedRamps('neutral', '#64748b')
    expect(hexToHsl(ramps['--ramp-grey-100'])[1]).toBeGreaterThan(0)
    expect(() => generateSeedRamps('neutral', 'red')).toThrow()
  })
})

describe('theme updates', () => {
  it('brand seed picks readable button labels and resets them', () => {
    const light = setSeed(defaultTheme(), 'brand', '#83bf78') // light green: white fails
    expect(light.light['--color-text-onbrand']).toBe('#111111')
    const dark = setSeed(light, 'brand', '#1e3a8a') // navy: white wins
    expect(dark.light['--color-text-onbrand']).toBeUndefined()
    expect(setSeed(light, 'brand', null).light).toEqual({})
  })

  it('setSeed(null) removes exactly the generated ramps', () => {
    let t = setSeed(defaultTheme(), 'brand', '#ff0000')
    t = setSeed(t, 'danger', '#00ff00')
    t = setSeed(t, 'brand', null)
    expect(t.seeds).toEqual({ danger: '#00ff00' })
    expect(Object.keys(t.ramps).some((k) => k.includes('blue'))).toBe(false)
  })

  it('roundness, density, type scale and fonts write and clear their tokens', () => {
    let t = setRoundness(defaultTheme(), 10)
    expect(t.light['--radius-medium']).toBe('0.625rem')
    expect(t.light['--radius-large']).toBe('1.625rem')
    t = setDensity(t, 'comfortable')
    expect(t.light['--button-height']).toBe('2.5rem')
    t = setTypeScale(t, 1.25)
    expect(t.light['--text-body-medium-font-size']).toBe('0.9375rem')
    t = setFont(t, 'body', 'DM Sans')
    expect(t.light['--text-body-family']).toBe("'DM Sans'")

    t = setRoundness(setDensity(setTypeScale(setFont(t, 'body', null), 1), 'compact'), null)
    expect(t.light).toEqual({})
    expect(t.controls).toEqual({ fonts: {} })
  })

  it('rejects unknown tokens', () => {
    expect(() => setToken(defaultTheme(), '--theme-bg', '#000', 'light')).toThrow()
  })
})

describe('parseTheme (trust boundary)', () => {
  it('accepts a valid theme and rejects v3 or malicious input', () => {
    const t = setSeed(defaultTheme(), 'brand', '#123456')
    expect(parseTheme(JSON.parse(JSON.stringify(t)))).toEqual(t)
    expect(() => parseTheme({ light: {}, dark: {} })).toThrow(/version/)
    expect(() => parseTheme({ version: 4, light: { '--color-bg': 'red; } body { display:none' } })).toThrow()
    expect(() => parseTheme({ version: 4, seeds: { brand: 'javascript:1' } })).toThrow()
    expect(() => parseTheme({ version: 4, customCss: '</style><script>' })).toThrow()
    expect(() => parseTheme({ version: 4, controls: { fonts: { body: "x'; }" } } })).toThrow()
    // exfiltration vectors and unknown/misplaced keys
    expect(() => parseTheme({ version: 4, light: { '--color-bg': 'url(https://evil.test/x)' } })).toThrow()
    expect(() => parseTheme({ version: 4, light: { '--color-bg': 'u\\72l(x)' } })).toThrow()
    expect(() => parseTheme({ version: 4, light: { '--made-up': '#fff' } })).toThrow()
    expect(() => parseTheme({ version: 4, light: { '--ramp-blue-500': '#fff' } })).toThrow()
    expect(() => parseTheme({ version: 4, ramps: { '--color-bg': '#fff' } })).toThrow()
    // prototype keys from JSON.parse are own properties: they must be rejected, not looked up
    expect(() => parseTheme(JSON.parse('{"version":4,"light":{"__proto__":"#fff"}}'))).toThrow()
    expect(() => parseTheme(JSON.parse('{"version":4,"components":{"__proto__":{"light":{"bg":"#fff"}}}}'))).toThrow(/unknown component/)
    expect(() => parseTheme(JSON.parse('{"version":4,"components":{"sidebar":{"light":{"constructor":"#fff"}}}}'))).toThrow()
    expect(() => parseTheme(JSON.parse('{"version":4,"controls":{"fonts":{"toString":"Inter"}}}'))).toThrow()
  })
})

describe('buildThemeCss', () => {
  it('is empty for the default theme', () => {
    expect(isDefaultTheme(defaultTheme())).toBe(true)
  })

  it('scopes light overrides to html and nested light regions, dark to dark regions', () => {
    const t = setToken(setToken(defaultTheme(), '--color-bg', '#faf7ed', 'light'), '--color-bg', '#171a16', 'dark')
    const css = buildThemeCss(t)
    expect(css).toContain("html,\nhtml [data-theme='light'] {\n  --color-bg: #faf7ed;")
    expect(css).toContain("html[data-theme='dark'],\nhtml [data-theme='dark'] {\n  --color-bg: #171a16;")
    expect(css).not.toMatch(/:[^;\n]*!important/)
  })

  it("restates Payload's dark default when only light is overridden", () => {
    const t = setToken(defaultTheme(), '--color-bg', '#faf7ed', 'light')
    expect(darkDeclarations(t)).toEqual({ '--color-bg': TOKENS['--color-bg'].dark })
  })

  it('does not emit dark for mode-independent tokens overridden in light', () => {
    const t = setRoundness(defaultTheme(), 8)
    expect(darkDeclarations(t)).toEqual({})
  })

  it('emits a dark value for a mode-independent token only when it differs', () => {
    const t = setToken(defaultTheme(), '--accessibility-focus-color', '#ff0000', 'dark')
    expect(darkDeclarations(t)).toEqual({ '--accessibility-focus-color': '#ff0000' })
  })

  it('imports Google fonts but not system stacks', () => {
    expect(buildThemeCss(setFont(defaultTheme(), 'body', 'Inter'))).toContain('fonts.googleapis.com/css2?family=Inter:')
    expect(buildThemeCss(setFont(defaultTheme(), 'body', 'Georgia, serif'))).not.toContain('@import')
  })

  it('builds a scoped theme package', () => {
    const files = buildThemePackage(setSeed(defaultTheme(), 'brand', '#83bf78'), { id: 'Light Cream', label: 'Light Cream' })
    expect(files['theme.css']).toContain('html[data-admin-theme="light-cream"],')
    expect(files['index.ts']).toContain("id: \"light-cream\"")
    expect(files['client.tsx']).toContain('export function LightCreamThemeProvider')
  })
})

describe('resolveToken', () => {
  it('resolves through ramps and respects mode rules', () => {
    const t = setSeed(defaultTheme(), 'brand', '#83bf78')
    expect(resolveToken('--color-bg-brand', 'light', t)).toBe('#83bf78')
    const lightOnly = setToken(defaultTheme(), '--color-bg', '#faf7ed', 'light')
    expect(resolveToken('--color-bg', 'light', lightOnly)).toBe('#faf7ed')
    expect(resolveToken('--color-bg', 'dark', lightOnly)).toBe(DEFAULT_RAMPS.grey['800'])
  })
})

describe('editor store', () => {
  it('coalesces rapid edits and supports undo/redo', () => {
    const s = useEditorStore.getState()
    s.resetTheme()
    s.setSeed('brand', '#111111')
    s.setSeed('brand', '#222222') // coalesced with the previous edit
    expect(useEditorStore.getState().theme.seeds.brand).toBe('#222222')
    useEditorStore.getState().undo()
    expect(useEditorStore.getState().theme.seeds.brand).toBeUndefined()
    useEditorStore.getState().redo()
    expect(useEditorStore.getState().theme.seeds.brand).toBe('#222222')
  })

  it('loadTheme validates input', () => {
    expect(() => useEditorStore.getState().loadTheme({ version: 3 })).toThrow()
  })
})
