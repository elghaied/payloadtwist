import { describe, expect, it } from 'vitest'
import { isValidComponentValue } from '@/payload-theme/components'
import { boldWeightTokens, parseShadow, shadowLayerTokens, typeLevelTokens } from '@/payload-theme/controls'
import { buildThemeCss } from '@/payload-theme/css'
import { TOKENS } from '@/payload-theme/schema'
import { defaultTheme, parseTheme, setComponentProp, setDensity, setSeed, setShadowLevel, setShadows, setSpacing } from '@/payload-theme/theme'

const layer = { x: 0, y: 8, blur: 24, spread: -2, color: '#112233', opacity: 0.2 }

describe('custom shadows', () => {
  it('picks the most visible outer layer of a Payload shadow', () => {
    expect(parseShadow(TOKENS['--elevation-500-modal-window'].light)).toEqual({ x: 0, y: 10, blur: 24, spread: 0, color: '#000000', opacity: 0.18 })
    expect(parseShadow('none')).toBeNull()
  })

  it('writes both modes, dark stronger, and round-trips', () => {
    expect(shadowLayerTokens(layer)).toEqual({ light: '0px 8px 24px -2px rgba(17, 34, 51, 0.2)', dark: '0px 8px 24px -2px rgba(17, 34, 51, 0.44)' })
    expect(parseShadow(shadowLayerTokens(layer).light)).toEqual(layer)
  })

  it('survives seed changes, is replaced by a style, and is validated', () => {
    let t = setShadowLevel(setShadows(defaultTheme(), 'glow'), '--elevation-300-tooltip', layer)
    t = setSeed(t, 'brand', '#ff0000')
    expect(t.light['--elevation-300-tooltip']).toBe(shadowLayerTokens(layer).light)
    expect(t.light['--elevation-500-modal-window']).toContain('255, 0, 0')
    expect(parseTheme(JSON.parse(JSON.stringify(t)))).toEqual(t)
    expect(setShadows(t, 'soft').controls.shadowLevels).toBeUndefined()
    expect(setShadowLevel(setShadowLevel(defaultTheme(), '--elevation-300-tooltip', layer), '--elevation-300-tooltip', null)).toEqual(defaultTheme())
    expect(() => setShadowLevel(defaultTheme(), '--color-bg', layer)).toThrow()
    expect(() => parseTheme({ version: 4, controls: { shadowLevels: { '--elevation-300-tooltip': { ...layer, color: 'red;}' } } } })).toThrow()
  })
})

describe('spacing scale', () => {
  it('scales spacers but keeps control heights, and composes with density', () => {
    const t = setSpacing(defaultTheme(), 1.5)
    expect(t.light['--spacer-3']).toBe('1.5rem')
    expect(t.light['--button-height']).toBe('1.5rem')
    const both = setDensity(t, 'spacious')
    expect(both.light['--spacer-3']).toBe('1.5rem')
    expect(both.light['--button-height']).toBe('2.875rem')
    expect(setDensity(both, 'compact').light['--button-height']).toBe('1.5rem')
    expect(setSpacing(setSpacing(defaultTheme(), 1.5), 1)).toEqual(defaultTheme())
    expect(() => parseTheme({ version: 4, controls: { spacing: 9 } })).toThrow()
  })
})

describe('type levels', () => {
  it('moves bold and paragraph variants with a body level', () => {
    expect(typeLevelTokens('body-medium', 'font-size', 14)).toEqual({
      '--text-body-medium-font-size': '0.875rem',
      '--text-body-medium-bold-font-size': '0.875rem',
      '--text-body-medium-paragraph-font-size': '0.875rem',
    })
    // paragraph keeps its 2px of extra line height
    expect(typeLevelTokens('body-medium', 'line-height', 20)['--text-body-medium-paragraph-line-height']).toBe('1.375rem')
    expect(Object.keys(typeLevelTokens('body-medium', 'font-weight', 500))).not.toContain('--text-body-medium-bold-font-weight')
    expect(typeLevelTokens('mono-small', 'font-weight', 500)).toEqual({ '--text-mono-small-weight': '500' })
    expect(typeLevelTokens('heading-xl', 'letter-spacing', -0.5)).toEqual({ '--text-heading-xl-letter-spacing': '-0.5px' })
    for (const v of Object.keys({ ...typeLevelTokens('body-2xl', 'line-height', 30), ...boldWeightTokens(600) })) expect(TOKENS[v]).toBeDefined()
  })
})

describe('component padding & margin', () => {
  it('accepts lengths only and emits them', () => {
    expect(isValidComponentValue('padding', '8px 12px')).toBe(true)
    expect(isValidComponentValue('margin', '0 -4px')).toBe(true)
    expect(isValidComponentValue('padding', '8px; color: red')).toBe(false)
    expect(isValidComponentValue('padding', 'calc(1px)')).toBe(false)
    const t = setComponentProp(defaultTheme(), 'tableCell', 'padding', '12px 16px', 'light')
    expect(buildThemeCss(t)).toContain('html .table tbody td {\n  padding: 12px 16px;\n}')
  })
})
