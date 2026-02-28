import { getDefaultTheme, getVariablesByCategory, PAYLOAD_VARIABLES } from './config.js'
import type { PayloadThemeConfig } from './types.ts'

// ─── Internal helpers ────────────────────────────────────────────────────────

function lightBlock(vars: Record<string, string>): string {
  const entries = Object.entries(vars)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  if (!entries) return ''
  return `:root {\n${entries}\n}`
}

function darkBlock(vars: Record<string, string>): string {
  const entries = Object.entries(vars)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  if (!entries) return ''
  return `[data-theme="dark"] {\n${entries}\n}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Builds the live injection string (minimal, no comments).
 * Used for real-time iframe injection.
 */
export function buildCSSString(config: PayloadThemeConfig): string {
  const parts: string[] = []
  const light = lightBlock(config.light)
  if (light) parts.push(light)
  const dark = darkBlock(config.dark)
  if (dark) parts.push(dark)
  return parts.join('\n\n')
}

/**
 * Injects config vars into the Payload admin iframe's <head>.
 * Creates/updates a <style id="tweakpayload-vars"> tag.
 *
 * Only injects vars that differ from the extracted defaults.
 * Injecting all defaults (via buildCSSString) would override Payload's
 * compiled CSS with our schema-extracted values, which may not match
 * exactly — corrupting the admin appearance before the user changes anything.
 */
export function injectIntoIframe(config: PayloadThemeConfig): void {
  const iframe = document.querySelector('iframe#payload-preview') as HTMLIFrameElement | null
  const iframeDoc = iframe?.contentDocument ?? iframe?.contentWindow?.document
  if (!iframeDoc) return

  let styleTag = iframeDoc.getElementById('tweakpayload-vars') as HTMLStyleElement | null
  if (!styleTag) {
    styleTag = iframeDoc.createElement('style')
    styleTag.id = 'tweakpayload-vars'
    iframeDoc.head.appendChild(styleTag)
  }

  let css = generateMinimalPayloadCSS(config)
  const bemCss = buildBemCSS(config.bemOverrides)
  if (bemCss) css += '\n\n' + bemCss

  styleTag.textContent = css

  // Component overrides in a separate tag for clean separation
  let compTag = iframeDoc.getElementById('tweakpayload-components') as HTMLStyleElement | null
  if (!compTag) {
    compTag = iframeDoc.createElement('style')
    compTag.id = 'tweakpayload-components'
    iframeDoc.head.appendChild(compTag)
  }
  compTag.textContent = config.componentOverrides
    ? buildComponentOverrideCSS(config.componentOverrides)
    : ''
}

/**
 * Temporarily highlights a BEM block in the iframe with an outline.
 * Removes after 2 seconds.
 */
export function highlightBemBlock(blockName: string): void {
  const iframe = document.querySelector('iframe#payload-preview') as HTMLIFrameElement | null
  const iframeDoc = iframe?.contentDocument ?? iframe?.contentWindow?.document
  if (!iframeDoc) return

  const styleId = 'tweakpayload-highlight'
  let styleTag = iframeDoc.getElementById(styleId) as HTMLStyleElement | null
  if (!styleTag) {
    styleTag = iframeDoc.createElement('style')
    styleTag.id = styleId
    iframeDoc.head.appendChild(styleTag)
  }

  styleTag.textContent = `.${blockName} { outline: 2px solid #3b82f6 !important; outline-offset: 2px; }`

  setTimeout(() => {
    if (styleTag) styleTag.textContent = ''
  }, 2000)
}

// ─── Component override helpers ───────────────────────────────────────────────

/**
 * Groups component overrides by selector and emits one CSS rule per selector.
 * Each property is marked !important so it wins over Payload's compiled CSS.
 */
export function buildComponentOverrideCSS(overrides: Record<string, string>): string {
  const bySelector = new Map<string, Array<[string, string]>>()
  for (const [key, value] of Object.entries(overrides)) {
    const sep = key.indexOf('||')
    if (sep === -1) continue
    const selector = key.slice(0, sep)
    const property = key.slice(sep + 2)
    if (!bySelector.has(selector)) bySelector.set(selector, [])
    bySelector.get(selector)!.push([property, value])
  }
  if (bySelector.size === 0) return ''
  const parts: string[] = ['/* Component Visual Overrides */']
  for (const [selector, props] of bySelector) {
    const lines = props.map(([p, v]) => `  ${p}: ${v} !important;`).join('\n')
    parts.push(`${selector} {\n${lines}\n}`)
  }
  return parts.join('\n')
}

// ─── BEM helpers ──────────────────────────────────────────────────────────────

function buildBemCSS(bemOverrides?: Record<string, string>): string {
  if (!bemOverrides) return ''
  const parts: string[] = []
  for (const [, css] of Object.entries(bemOverrides)) {
    if (css.trim()) parts.push(css.trim())
  }
  return parts.length > 0 ? `/* BEM Component Overrides */\n${parts.join('\n\n')}` : ''
}

// ─── Category helpers ─────────────────────────────────────────────────────────

const CATEGORY_ORDER = [
  { key: 'base-scale', comment: '/* Base Color Scale (--color-base-*) */' },
  { key: 'theme', comment: '/* Theme Colors */' },
  { key: 'status.success', comment: '/* Success */' },
  { key: 'status.warning', comment: '/* Warning */' },
  { key: 'status.error', comment: '/* Error */' },
  { key: 'typography', comment: '/* Typography */' },
  { key: 'layout', comment: '/* Spacing & Layout */' },
] as const

const DARK_MODE_FOOTER = `/*
 * Elevation and status colors are auto-inverted for dark mode by Payload.
 * Do not add --theme-elevation-* or --color-success-* to [data-theme="dark"].
 * Only explicit dark overrides (--theme-bg, --theme-text, etc.) need dark values.
 */`

function buildCategoryLightLines(categoryKey: string, vars: Record<string, string>): string[] {
  return getVariablesByCategory(categoryKey)
    .filter((v) => v.overridable && vars[v.var] !== undefined && vars[v.var] !== '')
    .map((v) => `  ${v.var}: ${vars[v.var]};`)
}

/**
 * Human-readable CSS output with category comments.
 * Includes all overridable vars, for "Copy CSS".
 */
export function generatePayloadCSS(config: PayloadThemeConfig): string {
  const lightLines: string[] = []
  const darkLines: string[] = []

  for (const { key, comment } of CATEGORY_ORDER) {
    const catLightLines = buildCategoryLightLines(key, config.light)
    if (catLightLines.length > 0) {
      lightLines.push(`  ${comment}`)
      lightLines.push(...catLightLines)
      lightLines.push('')
    }
  }

  // Dark block: only explicit darkMode vars
  for (const [varName, value] of Object.entries(config.dark)) {
    if (value !== '') {
      const v = PAYLOAD_VARIABLES[varName]
      if (v?.darkMode === 'explicit') {
        darkLines.push(`  ${varName}: ${value};`)
      }
    }
  }

  const parts: string[] = []

  if (lightLines.length > 0) {
    // Trim trailing empty line
    const trimmed = lightLines[lightLines.length - 1] === '' ? lightLines.slice(0, -1) : lightLines
    parts.push(`:root {\n${trimmed.join('\n')}\n}`)
  }

  if (darkLines.length > 0) {
    parts.push(`[data-theme="dark"] {\n${darkLines.join('\n')}\n}`)
  }

  parts.push(DARK_MODE_FOOTER)

  const bemCss = buildBemCSS(config.bemOverrides)
  if (bemCss) parts.push(bemCss)

  const compCss = config.componentOverrides
    ? buildComponentOverrideCSS(config.componentOverrides)
    : ''
  if (compCss) parts.push(compCss)

  return parts.join('\n\n')
}

/**
 * Minimal CSS output — only vars that differ from the default theme.
 * Produces a smaller file for users who only changed a few vars.
 */
export function generateMinimalPayloadCSS(config: PayloadThemeConfig): string {
  const defaults = getDefaultTheme()
  const changedLight: Record<string, string> = {}
  const changedDark: Record<string, string> = {}

  for (const [k, v] of Object.entries(config.light)) {
    if (v !== (defaults.light[k] ?? '')) {
      changedLight[k] = v
    }
  }
  for (const [k, v] of Object.entries(config.dark)) {
    if (v !== (defaults.dark[k] ?? '')) {
      changedDark[k] = v
    }
  }

  const parts: string[] = []
  const light = lightBlock(changedLight)
  if (light) parts.push(light)
  const dark = darkBlock(changedDark)
  if (dark) parts.push(dark)
  if (parts.length > 0) parts.push(DARK_MODE_FOOTER)

  const bemCss = buildBemCSS(config.bemOverrides)
  if (bemCss) parts.push(bemCss)

  const compCss = config.componentOverrides
    ? buildComponentOverrideCSS(config.componentOverrides)
    : ''
  if (compCss) parts.push(compCss)

  return parts.join('\n\n')
}
