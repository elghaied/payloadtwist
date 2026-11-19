import { describe, expect, it } from 'vitest'
import { contrastRatio, flatten } from '@/payload-theme/color'
import { isDefaultTheme } from '@/payload-theme/css'
import { presetTheme, THEME_PRESETS } from '@/payload-theme/presets'
import { resolveAll } from '@/payload-theme/schema'
import { parseTheme } from '@/payload-theme/theme'

const ratio = (fg: string, bg: string, page: string) => {
  const b = flatten(bg, page)
  const f = b ? flatten(fg, b) : null
  return b && f ? contrastRatio(f, b) : null
}

describe('built-in presets', () => {
  for (const preset of THEME_PRESETS) {
    describe(preset.name, () => {
      const theme = presetTheme(preset)

      it('is a valid theme', () => {
        expect(parseTheme(JSON.parse(JSON.stringify(theme)))).toEqual(theme)
        if (preset.id !== 'payload') expect(isDefaultTheme(theme)).toBe(false)
      })

      for (const mode of ['light', 'dark'] as const) {
        it(`meets AA contrast in ${mode} mode`, () => {
          const r = resolveAll(mode, theme)
          const page = flatten(r['--color-bg'], mode === 'light' ? '#ffffff' : '#000000')!
          expect(ratio(r['--color-text'], r['--color-bg'], page)).toBeGreaterThanOrEqual(4.5)
          expect(ratio(r['--color-text'], r['--color-bg-secondary'], page)).toBeGreaterThanOrEqual(4.5)
          // primary button label (skip gradients — checked visually)
          const btn = theme.components.buttonPrimary?.light?.bg
          // Payload's own default (white on #0d99ff, 3:1) is the one known exception
          if (!btn?.startsWith('linear-gradient') && preset.id !== 'payload') {
            expect(ratio(r['--color-text-onbrand'], r['--color-bg-brand'], page)).toBeGreaterThanOrEqual(4.5)
          }
          // custom sidebar: link text vs sidebar background
          const side = theme.components.sidebar
          const sideBg = (mode === 'dark' ? side?.dark?.bg : undefined) ?? side?.light?.bg
          const linkText =
            (mode === 'dark' ? theme.components.sidebarLink?.dark?.text : undefined) ?? theme.components.sidebarLink?.light?.text
          if (sideBg && !sideBg.startsWith('linear-gradient') && linkText && (mode === 'light' || side?.dark?.bg)) {
            expect(ratio(linkText, sideBg, page)).toBeGreaterThanOrEqual(4.5)
          }
        })
      }
    })
  }
})
