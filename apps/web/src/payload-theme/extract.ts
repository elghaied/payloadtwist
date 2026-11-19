import postcss, { type Comment, type Declaration, type Rule } from 'postcss'

// Parses Payload v4's plain-CSS token files (`@payloadcms/ui/dist/css/*.css`) into the
// schema the editor is built on. Pure: callers pass file contents in.

export type TokenType = 'color' | 'shadow' | 'length' | 'font' | 'number' | 'other'

export interface Token {
  var: string
  /** Source file stem: colors, color-ramps, theme, radius, spacing, typography, elevations, z-index, app */
  file: string
  /** Nearest heading comment in the source, e.g. "Background", "Border", "Field Tokens" */
  section: string
  type: TokenType
  /** Value under `:root` / `[data-theme='light']` (applies to both modes unless `dark` is set) */
  light: string
  /** Value under `[data-theme='dark']`, when Payload declares one */
  dark?: string
  /** Enhanced-contrast overrides (`html[data-enhanced-contrast]`) */
  contrast?: { both?: string; light?: string; dark?: string }
  /** Values inside `@media` queries, keyed by the query */
  responsive?: Record<string, string>
}

export interface TokenSchema {
  meta: { payloadUiVersion: string; extractedAt: string; tokenCount: number; rampCount: number }
  /** family → step → value, e.g. ramps.blue['500'] = '#0d99ff' */
  ramps: Record<string, Record<string, string>>
  tokens: Token[]
}

type Mode = 'light' | 'dark' | 'contrast-both' | 'contrast-light' | 'contrast-dark'

function modeOf(selector: string): Mode | null {
  const contrast = selector.includes('data-enhanced-contrast')
  const dark = /data-theme=['"]?dark/.test(selector)
  const light = /data-theme=['"]?light/.test(selector)
  if (contrast) return dark ? 'contrast-dark' : light ? 'contrast-light' : 'contrast-both'
  if (dark) return 'dark'
  if (/(^|,)\s*(:root|:host|html)\s*(,|$)/.test(selector) || light) return 'light'
  return null
}

function sectionFromComment(text: string): string | null {
  const line = text
    .split('\n')
    .map((l) => l.replace(/[—\-=*]+/g, ' ').trim())
    .find((l) => l.length > 0)
  if (!line || /^end\b/i.test(line) || line.length > 40) return null
  return line
}

const COLOR_LITERAL = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|oklch\(|transparent$|currentcolor$)/i

function typeOf(name: string, file: string, resolved: string): TokenType {
  if (file === 'elevations' || name.startsWith('--elevation-')) return 'shadow'
  if (/family$|^--font-family-|^--font-(body|mono)$/.test(name)) return 'font'
  if (/weight$/.test(name) || name.startsWith('--z-')) return 'number'
  if (
    COLOR_LITERAL.test(resolved) ||
    /^--(ramp|color|field-color|special|fullscreen|multiplayer)-/.test(name) ||
    name === '--accessibility-focus-color' ||
    name === '--scrollbar-color'
  )
    return 'color'
  if (/^-?[\d.]+(rem|px|em|%|vw|vh)?$/.test(resolved)) return 'length'
  return 'other'
}

/** Follows `var(--x, fallback)` chains through a value map until a literal is reached. */
export function resolveValue(value: string, values: Record<string, string>, depth = 0): string {
  const m = value.trim().match(/^var\((--[\w-]+)\s*(?:,\s*(.+))?\)$/)
  if (!m || depth > 20) return value.trim()
  const next = values[m[1]] ?? m[2]
  return next === undefined ? value.trim() : resolveValue(next, values, depth + 1)
}

export function extractTokens(
  files: { name: string; css: string }[],
  payloadUiVersion: string,
): TokenSchema {
  const byVar = new Map<string, Token>()
  const order: string[] = []

  for (const { name, css } of files) {
    const file = name.replace(/\.css$/, '')
    const root = postcss.parse(css)

    root.walkRules((rule: Rule) => {
      const mode = modeOf(rule.selector)
      if (!mode) return
      const media = rule.parent?.type === 'atrule' && (rule.parent as { name?: string }).name === 'media'
        ? (rule.parent as unknown as { params: string }).params
        : null
      let section = file

      rule.each((node) => {
        if (node.type === 'comment') {
          section = sectionFromComment((node as Comment).text) ?? section
          return
        }
        if (node.type !== 'decl') return
        const decl = node as Declaration
        if (!decl.prop.startsWith('--')) return
        const value = decl.value.replace(/\s+/g, ' ').trim()

        let token = byVar.get(decl.prop)
        if (!token) {
          token = { var: decl.prop, file, section, type: 'other', light: '' }
          byVar.set(decl.prop, token)
          order.push(decl.prop)
        }

        if (media) {
          token.responsive = { ...token.responsive, [media]: value }
        } else if (mode === 'light') {
          token.light = value
        } else if (mode === 'dark') {
          token.dark = value
        } else {
          const key = mode.replace('contrast-', '') as 'both' | 'light' | 'dark'
          token.contrast = { ...token.contrast, [key]: value }
        }
      })
    })
  }

  const lightValues = Object.fromEntries([...byVar.values()].map((t) => [t.var, t.light]))
  const ramps: TokenSchema['ramps'] = {}
  const tokens: Token[] = []

  for (const v of order) {
    const token = byVar.get(v)!
    // Tokens only declared under contrast/dark selectors fall back to their first declared value
    if (!token.light) token.light = token.dark ?? token.contrast?.both ?? token.contrast?.light ?? ''
    if (token.dark === token.light) delete token.dark
    token.type = typeOf(token.var, token.file, resolveValue(token.light, lightValues))

    const ramp = token.var.match(/^--ramp-(.+)-(\d+)$/)
    if (ramp) {
      ramps[ramp[1]] ??= {}
      ramps[ramp[1]][ramp[2]] = token.light
    }
    tokens.push(token)
  }

  return {
    meta: {
      payloadUiVersion,
      extractedAt: new Date().toISOString(),
      tokenCount: tokens.length,
      rampCount: Object.keys(ramps).length,
    },
    ramps,
    tokens,
  }
}
