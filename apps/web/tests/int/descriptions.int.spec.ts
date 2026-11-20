import { describe, expect, it } from 'vitest'
import { describeToken, usedByNames } from '@/payload-theme/descriptions'
import { extractUsage, type Token } from '@/payload-theme/extract'
import { seedUsage } from '@/payload-theme/ramps'
import { schema } from '@/payload-theme/schema'

describe('extractUsage', () => {
  const tokens: Token[] = [
    { var: '--ramp-blue-500', file: 'x', section: 'x', type: 'color', light: '#00f' },
    { var: '--color-bg-brand', file: 'x', section: 'x', type: 'color', light: 'var(--ramp-blue-500)' },
    { var: '--unused', file: 'x', section: 'x', type: 'color', light: '#000' },
  ]
  const css = `
    .btn--style-primary { background: var(--color-bg-brand); }
    .pill { &:hover { color: var(--ramp-blue-500) } }
    .active .nav__link { border-color: var(--color-bg-brand) }`

  it('maps tokens to component blocks directly, through nesting and through other tokens', () => {
    const usage = extractUsage([{ css }], tokens)
    expect(usage['--color-bg-brand']).toEqual(['btn', 'nav'])
    expect(usage['--ramp-blue-500']).toEqual(['btn', 'nav', 'pill'])
    expect(usage['--unused']).toEqual([])
  })
})

describe('descriptions', () => {
  it('describes every Payload variable in a sentence', () => {
    for (const t of schema.tokens) {
      const d = describeToken(t.var)
      expect(d.length, t.var).toBeGreaterThan(8)
      expect(d.endsWith('.'), t.var).toBe(true)
    }
  })

  it('uses plain language for common roles', () => {
    expect(describeToken('--color-text-onbrand')).toMatch(/primary button/)
    expect(describeToken('--color-bg-danger-tertiary-hover')).toBe('Background for errors and destructive actions (soft tint) on hover.')
    expect(describeToken('--ramp-green-500')).toMatch(/success color scale/)
  })

  it('names the components a token reaches', () => {
    expect(usedByNames('--color-bg-brand')).toContain('Buttons')
  })

  it('knows which seeds Payload actually uses', () => {
    expect(seedUsage('brand').length).toBeGreaterThan(20)
    expect(seedUsage('accent')).toEqual([])
  })
})
