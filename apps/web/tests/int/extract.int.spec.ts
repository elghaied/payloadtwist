import { describe, expect, it } from 'vitest'
import { extractTokens, resolveValue } from '@/payload-theme/extract'

const css = `
@layer payload-default {
  :root, :host {
    /* Blue */
    --ramp-blue-500: #0d99ff;
    --ramp-pale-blue-800: #394360;
  }
}
@layer payload-default {
  :root, :host, [data-theme='light'] {
    /* ——————
       Background
       —————— */
    --color-bg: var(--ramp-white-1000);
    --color-bg-brand: var(--ramp-blue-500);
    /* Border */
    --color-border: var(--ramp-black-200);
  }
  :host([data-theme='dark']), [data-theme='dark'] {
    --color-bg: var(--ramp-grey-800);
    --color-bg-brand: var(--ramp-blue-500);
  }
  html[data-enhanced-contrast], html[data-enhanced-contrast] [data-theme] {
    --color-border: var(--color-border-control);
  }
  html[data-enhanced-contrast][data-theme='dark'] {
    --color-bg-brand: var(--ramp-blue-700);
  }
  .button { --not-a-token: 1px; }
  @media (max-width: 768px) {
    :root, :host { --nav-width: 100vw; }
  }
  :root { --nav-width: 275px;
    --elevation-100: 0 0 0.5px
      0 rgba(0, 0, 0, 0.3); }
}`

describe('extractTokens', () => {
  const schema = extractTokens([{ name: 'colors.css', css }], '4.0.0-test')
  const get = (v: string) => schema.tokens.find((t) => t.var === v)!

  it('groups ramps by family, including hyphenated families', () => {
    expect(schema.ramps).toEqual({ blue: { '500': '#0d99ff' }, 'pale-blue': { '800': '#394360' } })
  })

  it('splits light and dark values and drops identical dark values', () => {
    expect(get('--color-bg')).toMatchObject({ light: 'var(--ramp-white-1000)', dark: 'var(--ramp-grey-800)' })
    expect(get('--color-bg-brand').dark).toBeUndefined()
  })

  it('captures enhanced contrast per mode', () => {
    expect(get('--color-border').contrast).toEqual({ both: 'var(--color-border-control)' })
    expect(get('--color-bg-brand').contrast).toEqual({ dark: 'var(--ramp-blue-700)' })
  })

  it('records the nearest heading comment as section', () => {
    expect(get('--color-bg').section).toBe('Background')
    expect(get('--color-border').section).toBe('Border')
  })

  it('keeps media-query values as responsive, ignores component-scoped vars', () => {
    expect(get('--nav-width')).toMatchObject({ light: '275px', responsive: { '(max-width: 768px)': '100vw' } })
    expect(schema.tokens.some((t) => t.var === '--not-a-token')).toBe(false)
  })

  it('infers types and normalises whitespace', () => {
    expect(get('--color-bg').type).toBe('color')
    expect(get('--nav-width').type).toBe('length')
    expect(get('--elevation-100')).toMatchObject({ type: 'shadow', light: '0 0 0.5px 0 rgba(0, 0, 0, 0.3)' })
  })
})

describe('resolveValue', () => {
  it('follows var chains and fallbacks', () => {
    const values = { '--a': 'var(--b)', '--b': '#fff' }
    expect(resolveValue('var(--a)', values)).toBe('#fff')
    expect(resolveValue('var(--missing, var(--b))', values)).toBe('#fff')
    expect(resolveValue('12px', values)).toBe('12px')
  })
})
