import { describe, expect, it } from 'vitest'
import { buildComponentCss, COMPONENTS, isValidComponentValue } from '@/payload-theme/components'
import { buildThemeCss, buildThemePackage } from '@/payload-theme/css'
import { defaultTheme, parseTheme, setComponentProp } from '@/payload-theme/theme'

describe('component layer', () => {
  it('scopes light-only colors to light mode and dark colors to dark regions', () => {
    let t = setComponentProp(defaultTheme(), 'sidebar', 'bg', '#1e1b4b', 'light')
    t = setComponentProp(t, 'sidebar', 'bg', '#0b0a1f', 'dark')
    const css = buildComponentCss(t.components)
    expect(css).toContain("html:not([data-theme='dark']) .nav {\n  background: #1e1b4b;")
    expect(css).toContain("html[data-theme='dark'] .nav,\nhtml [data-theme='dark'] .nav {\n  background: #0b0a1f;")
  })

  it('applies shared props in both modes and states via pseudo-classes', () => {
    let t = setComponentProp(defaultTheme(), 'buttonPrimary', 'radius', '999px', 'dark') // shared: mode ignored
    t = setComponentProp(t, 'buttonPrimary', 'bgHover', '#ff0000', 'light')
    t = setComponentProp(t, 'tableHeader', 'case', 'uppercase', 'light')
    const css = buildComponentCss(t.components)
    expect(css).toContain('html .btn--style-primary {\n  border-radius: 999px;')
    expect(css).toContain("html:not([data-theme='dark']) .btn--style-primary:hover {\n  background: #ff0000;")
    expect(css).toContain('html .table thead th {\n  text-transform: uppercase;')
    expect(t.components.buttonPrimary.dark).toBeUndefined()
  })

  it('removes empty components and is included in exports', () => {
    let t = setComponentProp(defaultTheme(), 'card', 'shadow', 'var(--elevation-400-menu-panel)', 'light')
    expect(buildThemeCss(t)).toContain('box-shadow: var(--elevation-400-menu-panel);')
    expect(buildThemePackage(t, { id: 'x', label: 'X' })['theme.css']).toContain('html[data-admin-theme="x"] .card')
    t = setComponentProp(t, 'card', 'shadow', null, 'light')
    expect(t.components).toEqual({})
  })

  it('validates values and keys at the trust boundary', () => {
    expect(isValidComponentValue('bg', 'var(--color-bg-brand)')).toBe(true)
    expect(isValidComponentValue('bg', 'url(https://evil.test)')).toBe(false)
    expect(isValidComponentValue('bg', 'red; } body { display: none')).toBe(false)
    expect(isValidComponentValue('weight', '650')).toBe(false)
    expect(() => setComponentProp(defaultTheme(), 'sidebar', 'case', 'uppercase', 'light')).toThrow()
    expect(() => parseTheme({ version: 4, components: { nope: { light: { bg: '#fff' } } } })).toThrow()
    expect(() => parseTheme({ version: 4, components: { sidebar: { dark: { shadow: 'none' } } } })).toThrow()
    const ok = setComponentProp(defaultTheme(), 'sidebarGroup', 'tracking', '0.08em', 'light')
    expect(parseTheme(JSON.parse(JSON.stringify(ok)))).toEqual(ok)
  })

  it('every component has selectors and props', () => {
    for (const c of COMPONENTS) {
      expect(c.selectors.length).toBeGreaterThan(0)
      expect(c.props.length).toBeGreaterThan(0)
    }
  })
})
