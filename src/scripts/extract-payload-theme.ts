#!/usr/bin/env tsx
/**
 * Extract Payload CMS theming data from the installed @payloadcms/ui package.
 *
 * Run via: pnpm extract-payload-theme
 * Outputs to: payload/payload-theme/
 */

import fs from 'node:fs'
import path from 'node:path'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CssVariable {
  var: string
  value: string
  resolvedType: 'color' | 'size' | 'font' | 'number' | 'other'
  sourceFile: string
  darkMode: 'auto-inverted' | 'explicit' | 'none'
  category: string
  overridable: boolean
}

interface BemBlock {
  blockName: string
  elements: string[]
  modifiers: string[]
  category: string
}

// ─── Component-level types ────────────────────────────────────────────────────

type StyleValueType = 'css-var' | 'color' | 'size' | 'other'

interface StyleUsage {
  selector: string // fully resolved CSS selector
  property: string // CSS property name
  value: string // raw value string
  referencedVar?: string // extracted var name if value is var(--x)
  valueType: StyleValueType
}

interface BemStructure {
  block: string
  elements: Array<{ selector: string; properties: StyleUsage[] }>
  modifiers: Array<{ selector: string; properties: StyleUsage[] }>
}

interface ComponentEntry {
  sourceFile: string // e.g. "elements/Button/index.scss"
  bemBlock: string // e.g. "btn"
  category: string // "elements" | "fields" | etc.
  cssVarCount: number // component-scoped --var declarations
  styleUsages: StyleUsage[] // interesting property/value pairs
  bemStructure: BemStructure
}

// ─── SCSS variable resolver ───────────────────────────────────────────────────
//
// Payload's SCSS uses #{$var} interpolations whose values cannot be statically
// resolved by a regex-based extractor. The regex `[^;{}]+` stops at `{`, so
// `#{$baseline-px}` would be truncated to just `#`.
//
// This map resolves known interpolation patterns to their compiled values.
// Keys are the full `#{...}` expression as it appears in the SCSS source.
// Values are the resolved CSS values from vars.scss / the Payload SCSS docs.
//
// If the regex is updated to capture `#{}` expressions (see extractCssVariables),
// these replacements will fire automatically on future re-runs.

const SCSS_VAR_RESOLVER: Record<string, string> = {
  '#{$baseline-px}': '20px',
  '#{$baseline-body-size}': '13px',
  '#{$style-radius-s}': '3px',
  '#{$style-radius-m}': '4px',
  '#{$style-radius-l}': '8px',
  '#{base(3)}': '60px',
  '#{base(2)}': '40px',
  '#{base(0.8)}': '16px',
  '#{$breakpoint-xs-width}': '400px',
  '#{$breakpoint-s-width}': '768px',
  '#{$breakpoint-m-width}': '1024px',
  '#{$breakpoint-l-width}': '1440px',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROOT = process.cwd()

function findPayloadUiPath(): string | null {
  // Direct node_modules (npm/yarn hoisted)
  const direct = path.join(ROOT, 'node_modules', '@payloadcms', 'ui')
  if (fs.existsSync(direct)) return direct

  // pnpm store - walk .pnpm looking for @payloadcms+ui
  const pnpmDir = path.join(ROOT, 'node_modules', '.pnpm')
  if (fs.existsSync(pnpmDir)) {
    const entries = fs.readdirSync(pnpmDir)
    for (const entry of entries) {
      if (entry.startsWith('@payloadcms+ui@')) {
        const candidate = path.join(pnpmDir, entry, 'node_modules', '@payloadcms', 'ui')
        if (fs.existsSync(candidate)) return candidate
      }
    }
  }

  return null
}

function getPayloadUiVersion(uiPath: string): string {
  const pkgPath = path.join(uiPath, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    return pkg.version || 'unknown'
  }
  return 'unknown'
}

function findScssDir(uiPath: string): string | null {
  // Check src/scss first, then dist/scss
  for (const sub of ['src/scss', 'scss', 'dist/scss']) {
    const candidate = path.join(uiPath, sub)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function findDistDir(uiPath: string): string | null {
  const candidate = path.join(uiPath, 'dist')
  return fs.existsSync(candidate) ? candidate : null
}

// ─── Component file discovery ─────────────────────────────────────────────────

const COMPONENT_CATEGORIES = [
  'elements',
  'fields',
  'views',
  'graphics',
  'widgets',
  'forms',
  'icons',
  'providers',
] as const

function findComponentScssFiles(distDir: string): Array<{
  componentName: string
  category: string
  filePath: string
  relPath: string
}> {
  const results: Array<{
    componentName: string
    category: string
    filePath: string
    relPath: string
  }> = []
  for (const category of COMPONENT_CATEGORIES) {
    const catDir = path.join(distDir, category)
    if (!fs.existsSync(catDir)) continue
    for (const entry of fs.readdirSync(catDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const scssPath = path.join(catDir, entry.name, 'index.scss')
      if (fs.existsSync(scssPath)) {
        results.push({
          componentName: entry.name,
          category,
          filePath: scssPath,
          relPath: `${category}/${entry.name}/index.scss`,
        })
      }
    }
  }
  return results
}

function collectFiles(dir: string, ext: string): string[] {
  const results: string[] = []
  function walk(d: string) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith(ext)) results.push(full)
    }
  }
  walk(dir)
  return results
}

// ─── Resolving variable types ────────────────────────────────────────────────

function resolveType(value: string): 'color' | 'size' | 'font' | 'number' | 'other' {
  const v = value.trim()
  if (
    /^(#|rgb|hsl|rgba|hsla|oklch|oklab|lch|lab|color\()/.test(v) ||
    /^var\(--color-/.test(v) ||
    /^var\(--theme-(elevation|success|warning|error|bg|text|input-bg|overlay|border-color)\)/.test(
      v,
    ) ||
    /^rgba?\(/.test(v)
  )
    return 'color'
  if (
    /^(calc\(|var\(--base)|^\d+(\.\d+)?(px|rem|em|%|vw|vh|dvh|svh|vmin|vmax)$/.test(v) ||
    /^\d+px$/.test(v)
  )
    return 'size'
  if (/font|serif|mono|sans|arial|roboto|georgia|menlo|consolas|segoe/i.test(v)) return 'font'
  if (/^\d+(\.\d+)?$/.test(v)) return 'number'
  return 'other'
}

// ─── SCSS nested parser ───────────────────────────────────────────────────────

interface RawPropContext {
  selector: string
  property: string
  value: string
}

function stripComments(content: string): string {
  return content.replace(/\/\/[^\n]*/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ')
}

function resolveAmpersand(selector: string, parentSelector: string): string {
  if (!selector.includes('&')) return selector
  return selector.replace(/&/g, parentSelector)
}

// Transparent @-rule wrappers — depth increases but no selector is pushed
const TRANSPARENT_AT = /^@(layer|include|media|supports|container|if|each|for|else|while)/
// @-rules whose entire block should be skipped
const SKIP_AT = /^@(mixin|function|keyframes|charset|use|import|forward)/

function parseScssProperties(content: string): RawPropContext[] {
  const cleaned = stripComments(content)
  const results: RawPropContext[] = []
  const selectorStack: Array<string | null> = [] // null = transparent @-rule wrapper
  let pos = 0

  while (pos < cleaned.length) {
    // Skip whitespace
    while (pos < cleaned.length && /\s/.test(cleaned[pos])) pos++
    if (pos >= cleaned.length) break

    // Accumulate token until {, }, or ;
    // Handle parentheses so { inside calc()/var() etc. doesn't confuse the parser
    const tokenStart = pos
    while (pos < cleaned.length && !'{};'.includes(cleaned[pos])) {
      if (cleaned[pos] === '(') {
        let d = 1
        pos++
        while (pos < cleaned.length && d > 0) {
          if (cleaned[pos] === '(') d++
          if (cleaned[pos] === ')') d--
          pos++
        }
      } else {
        pos++
      }
    }

    const token = cleaned.slice(tokenStart, pos).trim()
    if (pos >= cleaned.length) break
    const ch = cleaned[pos++]

    if (ch === '{') {
      if (SKIP_AT.test(token)) {
        // Skip entire block
        let d = 1
        while (pos < cleaned.length && d > 0) {
          if (cleaned[pos] === '{') d++
          if (cleaned[pos] === '}') d--
          pos++
        }
      } else if (TRANSPARENT_AT.test(token) || token === '') {
        selectorStack.push(null)
      } else {
        // Real CSS selector — resolve & against current parent
        const parent = [...selectorStack].reverse().find((s) => s !== null) ?? ''
        const resolved = resolveAmpersand(token, parent)
        selectorStack.push(resolved)
      }
    } else if (ch === '}') {
      selectorStack.pop()
    } else if (ch === ';') {
      // Property declaration
      const colon = token.indexOf(':')
      if (colon !== -1) {
        const property = token.slice(0, colon).trim()
        const value = token.slice(colon + 1).trim()
        const selector = [...selectorStack].reverse().find((s) => s !== null)
        if (selector && property && value && /^[\w-]+$/.test(property)) {
          results.push({ selector, property, value })
        }
      }
    }
  }

  return results
}

// ─── Value classifier ─────────────────────────────────────────────────────────

function classifyStyleValue(value: string): { referencedVar?: string; valueType: StyleValueType } {
  const varMatch = value.match(/^var\((--[\w-]+)/)
  if (varMatch) return { referencedVar: varMatch[1], valueType: 'css-var' }
  const t = resolveType(value)
  if (t === 'color') return { valueType: 'color' }
  if (t === 'size') return { valueType: 'size' }
  return { valueType: 'other' }
}

function isInterestingValue(value: string): boolean {
  return value.includes('var(--') || resolveType(value) !== 'other'
}

// ─── Category detection ──────────────────────────────────────────────────────

function detectCategory(varName: string): string {
  // --color-base-* is the raw palette (primary theming lever)
  if (/^--color-base-/.test(varName)) return 'base-scale'
  // --theme-elevation-* are computed aliases that auto-invert in dark mode
  if (/^--theme-elevation-/.test(varName)) return 'elevation'
  if (
    varName === '--theme-bg' ||
    varName === '--theme-text' ||
    varName === '--theme-input-bg' ||
    varName === '--theme-overlay' ||
    varName === '--theme-border-color' ||
    varName === '--theme-baseline' ||
    varName === '--theme-baseline-body-size'
  )
    return 'theme'
  if (/^--theme-success-/.test(varName) || /^--color-success-/.test(varName))
    return 'status.success'
  if (/^--theme-warning-/.test(varName) || /^--color-warning-/.test(varName))
    return 'status.warning'
  if (/^--theme-error-/.test(varName) || /^--color-error-/.test(varName)) return 'status.error'
  if (/^--color-blue-/.test(varName)) return 'status.info'
  if (/^--(font-|base-|base$)/.test(varName)) return 'typography'
  if (/^--breakpoint-/.test(varName)) return 'breakpoints'
  if (/^--(nav-|gutter-|scrollbar-|spacing-|doc-controls|app-header)/.test(varName)) return 'layout'
  if (/^--style-radius/.test(varName)) return 'layout'
  if (/^--z-/.test(varName)) return 'layout'
  if (/^--accessibility-/.test(varName)) return 'layout'
  return 'other'
}

// ─── Dark mode detection ─────────────────────────────────────────────────────

function detectDarkMode(varName: string, _value: string): 'auto-inverted' | 'explicit' | 'none' {
  // Elevation vars are auto-inverted (remapped in dark mode)
  if (/^--theme-elevation-/.test(varName)) return 'auto-inverted'
  if (/^--color-base-/.test(varName)) return 'none' // raw color, not themed

  // Status scales are auto-inverted
  if (/^--theme-(success|warning|error)-\d+/.test(varName)) return 'auto-inverted'
  if (/^--color-(success|warning|error|blue)-/.test(varName)) return 'none'

  // These have explicit dark overrides
  if (
    varName === '--theme-bg' ||
    varName === '--theme-text' ||
    varName === '--theme-input-bg' ||
    varName === '--theme-overlay' ||
    varName === '--theme-border-color'
  )
    return 'explicit'

  return 'none'
}

// ─── Extract CSS custom properties ───────────────────────────────────────────

function extractCssVariables(
  scssDir: string | null,
  distDir: string | null,
): { vars: CssVariable[]; sourceFiles: string[] } {
  const files: { path: string; name: string }[] = []

  if (scssDir) {
    for (const ext of ['.scss', '.css']) {
      for (const f of collectFiles(scssDir, ext)) {
        files.push({ path: f, name: path.relative(scssDir, f) })
      }
    }
  }

  // Also scan the main dist/styles.css for variables
  if (distDir) {
    const mainCss = path.join(distDir, 'styles.css')
    if (fs.existsSync(mainCss)) {
      files.push({ path: mainCss, name: 'styles.css' })
    }
  }

  const seen = new Map<string, CssVariable>()
  const sourceFiles: string[] = []

  // Regex to capture CSS custom property declarations.
  // The value group uses `(?:[^;{}]|#\{[^}]*\})*` to allow SCSS #{} interpolations
  // while still excluding bare `{` and `}` characters (block delimiters).
  const varDeclRegex = /(--[\w-]+)\s*:\s*((?:[^;{}]|#\{[^}]*\})*)/g

  for (const file of files) {
    const content = fs.readFileSync(file.path, 'utf-8')
    sourceFiles.push(file.name)

    let match: RegExpExecArray | null
    while ((match = varDeclRegex.exec(content)) !== null) {
      const varName = match[1]
      let value = match[2].trim()

      // Resolve known SCSS #{} interpolations to their compiled CSS values
      for (const [pattern, resolved] of Object.entries(SCSS_VAR_RESOLVER)) {
        if (value.includes(pattern)) {
          value = value.replace(pattern, resolved)
        }
      }

      // Skip if already seen (prefer SCSS source over compiled)
      if (seen.has(varName)) continue

      const isVarRef = /^var\(--/.test(value)
      const category = detectCategory(varName)

      seen.set(varName, {
        var: varName,
        value,
        resolvedType: resolveType(value),
        sourceFile: file.name,
        darkMode: detectDarkMode(varName, value),
        category,
        overridable: !isVarRef && category !== 'breakpoints',
      })
    }
  }

  return { vars: Array.from(seen.values()), sourceFiles: [...new Set(sourceFiles)] }
}

// ─── Extract BEM blocks ──────────────────────────────────────────────────────

function categorizeBemBlock(name: string): string {
  if (/^(nav|sidebar)($|[-_])/.test(name) || /^nav-/.test(name)) return 'navigation'
  if (/^(collection-list|list-)/.test(name) || /^list-/.test(name)) return 'list-view'
  if (/^(document-|doc-|edit-)/.test(name)) return 'edit-view'
  if (/^dashboard/.test(name)) return 'dashboard'
  if (
    /^(field-|input-|select-|textarea|checkbox|radio|date-|upload|richtext|code-|json-)/.test(
      name,
    ) ||
    /-field$/.test(name)
  )
    return 'fields'
  if (/^(modal|popup|drawer|dialog|tooltip|toast)/.test(name)) return 'overlays'
  if (/^(btn|button)/.test(name)) return 'actions'
  if (/^(table|cell|row|column|sort-)/.test(name)) return 'table'
  return 'other'
}

// Known third-party class prefixes to exclude
const THIRD_PARTY_PREFIXES = [
  'ql-',
  'rc-',
  'react-',
  'rct-',
  'DayPicker',
  'rdp-',
  'Toastify',
  'ReactModal',
  'rs-',
  'ck-',
  'ProseMirror',
  'cm-',
  'monaco-',
  'xterm-',
]

function isThirdParty(className: string): boolean {
  return THIRD_PARTY_PREFIXES.some(
    (p) => className.startsWith(p) || className.startsWith(p.toLowerCase()),
  )
}

function extractBemBlocks(distDir: string | null): BemBlock[] {
  if (!distDir) return []

  const cssFiles = collectFiles(distDir, '.css')
  const allClasses = new Set<string>()

  // Match class selectors in CSS
  const classRegex = /\.([\w][\w-]*)/g

  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    let match: RegExpExecArray | null
    while ((match = classRegex.exec(content)) !== null) {
      const cls = match[1]
      // Filter out very short names, pure numbers, or third-party classes
      if (cls.length > 1 && !/^\d+$/.test(cls) && !isThirdParty(cls)) {
        allClasses.add(cls)
      }
    }
  }

  // Organize into BEM tree
  const blockMap = new Map<string, { elements: Set<string>; modifiers: Set<string> }>()

  for (const cls of allClasses) {
    // Determine BEM role
    const elemIdx = cls.indexOf('__')
    const modIdx = cls.indexOf('--')

    if (elemIdx === -1 && modIdx === -1) {
      // BEM block
      if (!blockMap.has(cls)) {
        blockMap.set(cls, { elements: new Set(), modifiers: new Set() })
      }
    } else if (elemIdx !== -1) {
      // BEM element (block__element or block__element--modifier)
      const blockName = cls.substring(0, elemIdx)
      if (!blockMap.has(blockName)) {
        blockMap.set(blockName, { elements: new Set(), modifiers: new Set() })
      }
      blockMap.get(blockName)!.elements.add(cls)
    } else if (modIdx !== -1) {
      // BEM modifier (block--modifier)
      const blockName = cls.substring(0, modIdx)
      if (!blockMap.has(blockName)) {
        blockMap.set(blockName, { elements: new Set(), modifiers: new Set() })
      }
      blockMap.get(blockName)!.modifiers.add(cls)
    }
  }

  const blocks: BemBlock[] = []
  for (const [blockName, { elements, modifiers }] of blockMap) {
    // Only include blocks that have at least one element or modifier
    // (standalone single classes are likely utility classes, not components)
    // OR blocks that match known Payload patterns
    const isPayloadBlock =
      elements.size > 0 || modifiers.size > 0 || categorizeBemBlock(blockName) !== 'other'

    if (isPayloadBlock) {
      blocks.push({
        blockName,
        elements: [...elements].sort(),
        modifiers: [...modifiers].sort(),
        category: categorizeBemBlock(blockName),
      })
    }
  }

  return blocks.sort((a, b) => a.blockName.localeCompare(b.blockName))
}

// ─── Organize variables into schema categories ──────────────────────────────

function organizeCssVars(vars: CssVariable[]) {
  const grouped: Record<string, CssVariable[]> = {
    'base-scale': [],
    elevation: [],
    theme: [],
    'status.success': [],
    'status.warning': [],
    'status.error': [],
    'status.info': [],
    typography: [],
    layout: [],
    breakpoints: [],
    other: [],
  }

  for (const v of vars) {
    const cat = v.category
    if (grouped[cat]) {
      grouped[cat].push(v)
    } else {
      grouped.other.push(v)
    }
  }

  // Sort each group by variable name
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.var.localeCompare(b.var))
  }

  return {
    baseScale: grouped['base-scale'], // --color-base-* raw palette (primary lever)
    elevation: grouped.elevation, // --theme-elevation-* computed aliases (overridable: false)
    theme: grouped.theme,
    status: {
      success: grouped['status.success'],
      warning: grouped['status.warning'],
      error: grouped['status.error'],
      info: grouped['status.info'],
    },
    typography: grouped.typography,
    layout: grouped.layout,
    breakpoints: grouped.breakpoints,
    other: grouped.other,
  }
}

function organizeBemBlocks(blocks: BemBlock[]) {
  const grouped: Record<string, BemBlock[]> = {
    navigation: [],
    'list-view': [],
    'edit-view': [],
    dashboard: [],
    fields: [],
    overlays: [],
    actions: [],
    table: [],
    other: [],
  }

  for (const b of blocks) {
    if (grouped[b.category]) {
      grouped[b.category].push(b)
    } else {
      grouped.other.push(b)
    }
  }

  return grouped
}

// ─── Generate markdown ───────────────────────────────────────────────────────

function varTable(vars: CssVariable[]): string {
  if (vars.length === 0) return '_None found._\n'
  const lines = [
    '| Variable | Value | Type | Overridable | Dark Mode |',
    '|----------|-------|------|-------------|-----------|',
  ]
  for (const v of vars) {
    const val = v.value.length > 60 ? v.value.slice(0, 57) + '...' : v.value
    lines.push(
      `| \`${v.var}\` | \`${val}\` | ${v.resolvedType} | ${v.overridable ? 'yes' : 'no'} | ${v.darkMode} |`,
    )
  }
  return lines.join('\n') + '\n'
}

function bemSection(blocks: BemBlock[]): string {
  if (blocks.length === 0) return '_None found._\n'
  const lines: string[] = []
  for (const b of blocks) {
    lines.push(`**\`.${b.blockName}\`**`)
    if (b.elements.length > 0) {
      lines.push('  Elements: ' + b.elements.map((e) => `\`.${e}\``).join(', '))
    }
    if (b.modifiers.length > 0) {
      lines.push('  Modifiers: ' + b.modifiers.map((m) => `\`.${m}\``).join(', '))
    }
    lines.push('')
  }
  return lines.join('\n')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function generateComponentsMarkdown(
  components: Record<string, Record<string, ComponentEntry>>,
): string {
  const totalCount = Object.values(components).reduce((s, c) => s + Object.keys(c).length, 0)
  const lines = [`\n---\n\n## Components (${totalCount} total)\n`]

  for (const [category, entries] of Object.entries(components)) {
    const list = Object.entries(entries)
    if (list.length === 0) continue
    lines.push(`\n### ${capitalize(category)} (${list.length})\n`)
    lines.push('| Component | BEM Block | CSS Var Refs | Style Rules | Key Vars |')
    lines.push('|-----------|-----------|--------------|-------------|----------|')
    for (const [name, entry] of list.sort(([a], [b]) => a.localeCompare(b))) {
      const varRefs = entry.styleUsages.filter((u) => u.valueType === 'css-var').length
      const keyVars = [
        ...new Set(entry.styleUsages.filter((u) => u.referencedVar).map((u) => u.referencedVar!)),
      ]
        .slice(0, 3)
        .join(', ')
      lines.push(
        `| ${name} | .${entry.bemBlock} | ${varRefs} | ${entry.styleUsages.length} | ${keyVars || '—'} |`,
      )
    }
  }
  return lines.join('\n')
}

function generateMarkdown(
  version: string,
  organizedVars: ReturnType<typeof organizeCssVars>,
  organizedBlocks: ReturnType<typeof organizeBemBlocks>,
  stats: {
    totalCssVars: number
    overridableVars: number
    bemBlocks: number
    componentFiles: number
  },
  components: Record<string, Record<string, ComponentEntry>>,
): string {
  const date = new Date().toISOString().slice(0, 10)
  return `# Payload UI Theme Schema
Extracted from @payloadcms/ui v${version} on ${date}

**${stats.totalCssVars}** CSS variables (${stats.overridableVars} overridable) · **${stats.bemBlocks}** BEM component blocks · **${stats.componentFiles}** component SCSS files

---

## How to use this in your custom.scss

Payload CSS lives inside \`@layer payload-default\`.
Your \`custom.scss\` automatically has higher specificity than Payload's styles.

To override a CSS variable:
\`\`\`scss
:root {
  --theme-elevation-0: #f8f8f8;
}
\`\`\`

To override a component style:
\`\`\`scss
.collection-list {
  .collection-list__header { background: red; }
}
\`\`\`

To override within Payload's specificity layer:
\`\`\`scss
@layer payload-default {
  .btn--style-primary { background: purple; }
}
\`\`\`

---

## CSS Variables

### Base Color Scale (primary theming lever)

Override these \`--color-base-*\` values to retheme everything at once.
Payload's elevation scale (\`--theme-elevation-*\`) references the base scale
and auto-inverts in dark mode — so you only need to set light values here.

${varTable(organizedVars.baseScale)}

### Elevation Aliases (computed — do not override directly)

These \`--theme-elevation-*\` vars are computed from the base scale.
Overriding them directly breaks dark mode inversion.

${varTable(organizedVars.elevation)}

### Theme Colors (need explicit dark overrides)

These must be overridden separately for dark mode using:
\`\`\`scss
html[data-theme='dark'] {
  --theme-bg: #1a1a1a;
}
\`\`\`

${varTable(organizedVars.theme)}

### Status Colors — Success (auto-inverted in dark mode)

${varTable(organizedVars.status.success)}

### Status Colors — Warning (auto-inverted in dark mode)

${varTable(organizedVars.status.warning)}

### Status Colors — Error (auto-inverted in dark mode)

${varTable(organizedVars.status.error)}

### Status Colors — Info (auto-inverted in dark mode)

${varTable(organizedVars.status.info)}

### Typography

${varTable(organizedVars.typography)}

### Layout

${varTable(organizedVars.layout)}

### Breakpoints

${varTable(organizedVars.breakpoints)}

### Other

${varTable(organizedVars.other)}

---

## BEM Component Blocks

### Navigation
${bemSection(organizedBlocks.navigation)}

### List View
${bemSection(organizedBlocks['list-view'])}

### Edit View
${bemSection(organizedBlocks['edit-view'])}

### Dashboard
${bemSection(organizedBlocks.dashboard)}

### Fields
${bemSection(organizedBlocks.fields)}

### Overlays
${bemSection(organizedBlocks.overlays)}

### Actions
${bemSection(organizedBlocks.actions)}

### Table
${bemSection(organizedBlocks.table)}

### Other
${bemSection(organizedBlocks.other)}
${generateComponentsMarkdown(components)}
`
}

// ─── Component-level extraction ──────────────────────────────────────────────

function detectBemBlockName(selectors: string[]): string {
  const counts = new Map<string, number>()
  for (const sel of selectors) {
    const classes = [...sel.matchAll(/\.([\w-]+)/g)].map((m) => m[1])
    for (const cls of classes) {
      const eidx = cls.indexOf('__')
      const midx = cls.indexOf('--')
      const root = eidx !== -1 ? cls.slice(0, eidx) : midx !== -1 ? cls.slice(0, midx) : cls
      counts.set(root, (counts.get(root) ?? 0) + 1)
    }
  }
  let best = '',
    bestCount = 0
  for (const [k, v] of counts) {
    if (v > bestCount) {
      bestCount = v
      best = k
    }
  }
  return best
}

function buildBemStructure(usages: StyleUsage[], bemBlock: string): BemStructure {
  const elements = new Map<string, StyleUsage[]>()
  const modifiers = new Map<string, StyleUsage[]>()

  for (const u of usages) {
    const classes = [...u.selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1])
    for (const cls of classes) {
      if (cls.includes('__')) {
        const block = cls.slice(0, cls.indexOf('__'))
        if (block === bemBlock) {
          if (!elements.has(cls)) elements.set(cls, [])
          elements.get(cls)!.push(u)
        }
      } else if (cls.includes('--')) {
        const block = cls.slice(0, cls.indexOf('--'))
        if (block === bemBlock) {
          if (!modifiers.has(cls)) modifiers.set(cls, [])
          modifiers.get(cls)!.push(u)
        }
      }
    }
  }

  return {
    block: bemBlock,
    elements: [...elements.entries()].map(([sel, props]) => ({
      selector: `.${sel}`,
      properties: props,
    })),
    modifiers: [...modifiers.entries()].map(([sel, props]) => ({
      selector: `.${sel}`,
      properties: props,
    })),
  }
}

function emptyComponent(relPath: string, componentName: string, category: string): ComponentEntry {
  return {
    sourceFile: relPath,
    bemBlock: componentName.toLowerCase(),
    category,
    cssVarCount: 0,
    styleUsages: [],
    bemStructure: { block: componentName.toLowerCase(), elements: [], modifiers: [] },
  }
}

function extractComponentData(
  filePath: string,
  relPath: string,
  componentName: string,
  category: string,
): ComponentEntry {
  let content: string
  try {
    content = fs.readFileSync(filePath, 'utf-8')
  } catch {
    return emptyComponent(relPath, componentName, category)
  }

  // Count component-scoped CSS var declarations (--var-name: value;)
  const varDeclMatches = [...content.matchAll(/(--[\w-]+)\s*:/g)]
  const cssVarCount = varDeclMatches.length

  // Parse all property contexts
  const rawProps = parseScssProperties(content)

  // Filter to interesting values (var refs, colors, sizes)
  const styleUsages: StyleUsage[] = rawProps
    .filter((p) => isInterestingValue(p.value))
    .map((p) => {
      const { referencedVar, valueType } = classifyStyleValue(p.value)
      return {
        selector: p.selector,
        property: p.property,
        value: p.value,
        referencedVar,
        valueType,
      }
    })

  const allSelectors = [...new Set(rawProps.map((p) => p.selector))]
  const bemBlock = detectBemBlockName(allSelectors)
  const bemStructure = buildBemStructure(styleUsages, bemBlock)

  return { sourceFile: relPath, bemBlock, category, cssVarCount, styleUsages, bemStructure }
}

function extractAllComponents(distDir: string): Record<string, Record<string, ComponentEntry>> {
  const componentFiles = findComponentScssFiles(distDir)

  const result: Record<string, Record<string, ComponentEntry>> = {}
  for (const cat of COMPONENT_CATEGORIES) result[cat as string] = {}

  for (const { componentName, category, filePath, relPath } of componentFiles) {
    const entry = extractComponentData(filePath, relPath, componentName, category)
    result[category][componentName] = entry
  }

  return result
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log('🔍 Extracting Payload CMS theme data...\n')

  // Step 1: Locate @payloadcms/ui
  const uiPath = findPayloadUiPath()
  if (!uiPath) {
    console.error('❌ Could not find @payloadcms/ui in node_modules. Is it installed?')
    process.exit(1)
  }
  console.log(`  Found @payloadcms/ui at: ${path.relative(ROOT, uiPath)}`)

  const version = getPayloadUiVersion(uiPath)
  console.log(`  Version: ${version}`)

  const scssDir = findScssDir(uiPath)
  const distDir = findDistDir(uiPath)
  console.log(`  SCSS dir: ${scssDir ? path.relative(ROOT, scssDir) : 'not found'}`)
  console.log(`  Dist dir: ${distDir ? path.relative(ROOT, distDir) : 'not found'}`)

  if (!scssDir && !distDir) {
    console.error('❌ No SCSS or dist directory found. Cannot extract theme.')
    process.exit(1)
  }

  // Step 2: Extract CSS custom properties
  console.log('\n📋 Extracting CSS custom properties...')
  const { vars, sourceFiles } = extractCssVariables(scssDir, distDir)
  console.log(`  Found ${vars.length} CSS variables from ${sourceFiles.length} files`)

  // Step 3: Extract BEM blocks
  console.log('\n🧱 Extracting BEM class names...')
  const blocks = extractBemBlocks(distDir)
  console.log(`  Found ${blocks.length} BEM blocks`)

  // Step 3b: Extract component-level SCSS data
  console.log('\n🎨 Extracting component SCSS styles...')
  const components = distDir ? extractAllComponents(distDir) : {}
  const componentCount = Object.values(components).reduce(
    (sum, cat) => sum + Object.keys(cat).length,
    0,
  )
  console.log(`  Found ${componentCount} component SCSS files`)
  for (const [cat, entries] of Object.entries(components)) {
    const n = Object.keys(entries).length
    if (n > 0) console.log(`    ${cat}: ${n}`)
  }

  // Step 4: Organize data
  const organizedVars = organizeCssVars(vars)
  const organizedBlocks = organizeBemBlocks(blocks)

  const stats = {
    totalCssVars: vars.length,
    overridableVars: vars.filter((v) => v.overridable).length,
    bemBlocks: blocks.length,
    componentFiles: componentCount,
  }

  // Step 5: Generate outputs
  const outDir = path.join(ROOT, 'src', 'payload-theme')
  fs.mkdirSync(outDir, { recursive: true })

  // JSON schema
  const schema = {
    meta: {
      extractedAt: new Date().toISOString(),
      payloadUiVersion: version,
      sourceFiles,
      stats,
    },
    cssVariables: organizedVars,
    bemBlocks: organizedBlocks,
    components,
  }

  const jsonPath = path.join(outDir, 'payload-theme-schema.json')
  fs.writeFileSync(jsonPath, JSON.stringify(schema, null, 2) + '\n')
  console.log(`\n✅ Written: ${path.relative(ROOT, jsonPath)}`)

  // Markdown summary
  const mdPath = path.join(outDir, 'payload-theme-schema.md')
  fs.writeFileSync(
    mdPath,
    generateMarkdown(version, organizedVars, organizedBlocks, stats, components),
  )
  console.log(`✅ Written: ${path.relative(ROOT, mdPath)}`)

  // Summary
  console.log('\n── Summary ──────────────────────────────────────────')
  console.log(`  CSS Variables:`)
  console.log(`    Base Scale:     ${organizedVars.baseScale.length}`)
  console.log(`    Elevation:      ${organizedVars.elevation.length}`)
  console.log(`    Theme:          ${organizedVars.theme.length}`)
  console.log(`    Success:        ${organizedVars.status.success.length}`)
  console.log(`    Warning:        ${organizedVars.status.warning.length}`)
  console.log(`    Error:          ${organizedVars.status.error.length}`)
  console.log(`    Info:           ${organizedVars.status.info.length}`)
  console.log(`    Typography:     ${organizedVars.typography.length}`)
  console.log(`    Layout:         ${organizedVars.layout.length}`)
  console.log(`    Breakpoints:    ${organizedVars.breakpoints.length}`)
  console.log(`    Other:          ${organizedVars.other.length}`)
  console.log(`    ─────────────────────`)
  console.log(`    Total:          ${stats.totalCssVars} (${stats.overridableVars} overridable)`)
  console.log(``)
  console.log(`  BEM Blocks:`)
  for (const [cat, list] of Object.entries(organizedBlocks)) {
    console.log(`    ${cat.padEnd(16)}${list.length}`)
  }
  console.log(`    ─────────────────────`)
  console.log(`    Total:          ${stats.bemBlocks}`)
  console.log(``)
  console.log(`  Component SCSS Files:`)
  for (const [cat, entries] of Object.entries(components)) {
    const n = Object.keys(entries).length
    if (n > 0) console.log(`    ${cat.padEnd(16)}${n}`)
  }
  console.log(`    ─────────────────────`)
  console.log(`    Total:          ${stats.componentFiles}`)
  console.log('')
}

main()
