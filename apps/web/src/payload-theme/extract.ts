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
  /** Payload component blocks (BEM roots, e.g. `btn`, `nav`) that use this token, directly or via other tokens */
  usedBy?: string[]
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

// ─── Usage map ──────────────────────────────────────────────────────────────

/** BEM block of a selector's first class: `.btn--style-primary:hover` → `btn` */
// State/utility classes that aren't components
const NOT_BLOCKS = new Set(['active', 'open', 'selected', 'disabled', 'hidden', 'dark', 'light', 'is-active'])

function blockOf(selector: string): string | null {
  for (const m of selector.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?:__|--|[^a-zA-Z0-9_-]|$)/g)) {
    const block = m[1]
    if (!NOT_BLOCKS.has(block)) return block
  }
  return null
}

const VAR_REF = /var\((--[\w-]+)/g

/**
 * Which Payload component blocks use each token — directly in component CSS, or through other
 * tokens that reference it (a ramp step reaches every component its semantic roles reach).
 */
export function extractUsage(componentFiles: { css: string }[], tokens: Token[]): Record<string, string[]> {
  const direct = new Map<string, Set<string>>()
  for (const { css } of componentFiles) {
    let root
    try {
      root = postcss.parse(css)
    } catch {
      continue
    }
    root.walkDecls((decl) => {
      const refs = [...decl.value.matchAll(VAR_REF)].map((m) => m[1])
      if (!refs.length) return
      const rule = decl.parent as Rule | undefined
      // nested rules (`&:hover`) inherit the block from their ancestors
      let node: Rule | undefined = rule
      let block: string | null = null
      while (node && !block) {
        block = node.selector ? blockOf(node.selector) : null
        node = node.parent?.type === 'rule' ? (node.parent as Rule) : undefined
      }
      if (!block) return
      for (const r of refs) {
        if (!direct.has(r)) direct.set(r, new Set())
        direct.get(r)!.add(block)
      }
    })
  }

  // token → tokens that reference it
  const referencedBy = new Map<string, Set<string>>()
  for (const t of tokens) {
    const values = [t.light, t.dark, t.contrast?.both, t.contrast?.light, t.contrast?.dark].filter(Boolean).join(' ')
    for (const m of values.matchAll(VAR_REF)) {
      if (!referencedBy.has(m[1])) referencedBy.set(m[1], new Set())
      referencedBy.get(m[1])!.add(t.var)
    }
  }

  const memo = new Map<string, Set<string>>()
  const usage = (v: string, seen = new Set<string>()): Set<string> => {
    if (memo.has(v)) return memo.get(v)!
    if (seen.has(v)) return new Set()
    seen.add(v)
    const out = new Set(direct.get(v) ?? [])
    for (const parent of referencedBy.get(v) ?? []) for (const b of usage(parent, seen)) out.add(b)
    memo.set(v, out)
    return out
  }

  return Object.fromEntries(tokens.map((t) => [t.var, [...usage(t.var)].sort()]))
}
