import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '@/payload-theme/color'

// Editor chrome must stay readable: every text token ≥ 4.5:1 on every surface, both themes.
const css = fs.readFileSync(path.resolve(__dirname, '../../src/app/(frontend)/globals.css'), 'utf8')

function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(selector)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  return Object.fromEntries([...body.matchAll(/(--pt-[a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]))
}

const THEMES = { dark: tokens(':root {'), light: { ...tokens(':root {'), ...tokens('[data-editor-theme="light"] {') } }
const TEXT = ['--pt-text', '--pt-text-muted', '--pt-text-label', '--pt-text-subtle', '--pt-text-faint']
const SURFACES = ['--pt-bg', '--pt-surface', '--pt-surface-alt', '--pt-surface-hover']

describe('editor chrome contrast', () => {
  for (const [name, t] of Object.entries(THEMES)) {
    it(`${name}: text tokens are AA on every surface`, () => {
      for (const fg of TEXT) {
        for (const bg of SURFACES) {
          expect(contrastRatio(t[fg], t[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
        }
      }
    })
  }
})
