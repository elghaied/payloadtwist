import type { PayloadCSSVariable, PayloadThemeConfig, PayloadThemeSchema } from './types.ts'
import schemaJson from './payload-theme-schema.json'

export const payloadThemeSchema = schemaJson as PayloadThemeSchema

// ─── Manual patches for SCSS-interpolated values ──────────────────────────────
//
// These 6 variables had value "#" in the extracted schema because the regex
// stops at `{`, so SCSS `#{$var}` interpolations were truncated to just `#`.
// Values sourced directly from @payloadcms/ui vars.scss / app.scss.

const VALUE_PATCHES: Partial<Record<string, Partial<PayloadCSSVariable>>> = {
  // resolvedType corrected from "color" (the "#" prefix misled the extractor)
  '--theme-baseline':           { value: '20px', resolvedType: 'size' },   // $baseline-px: 20px
  '--theme-baseline-body-size': { value: '13px', resolvedType: 'size' },   // $baseline-body-size: 13px
  '--style-radius-s':           { value: '3px',  resolvedType: 'size' },   // $style-radius-s: 3px
  '--style-radius-m':           { value: '4px',  resolvedType: 'size' },   // $style-radius-m: 4px
  '--style-radius-l':           { value: '8px',  resolvedType: 'size' },   // $style-radius-l: 8px
  '--gutter-h': {
    value: '60px',                                                          // base(3) = 20px * 3
    resolvedType: 'size',
    responsive: true,
    note: 'Payload overrides this at mid-break (40px) and small-break (16px)',
  },
}

// ─── Hardcoded dark defaults for explicit dark-mode vars ──────────────────────
//
// Sourced from @payloadcms/ui app.scss [data-theme="dark"] block.
// var() references are resolved to practical hex equivalents for the editor UI,
// since the elevation scale inverts in dark mode.

const DARK_DEFAULTS: Record<string, string> = {
  '--theme-bg':       '#0d0d0d',            // elevation-0 inverts to near-black
  '--theme-text':     '#f3f3f3',            // elevation-1000 inverts to near-white
  '--theme-input-bg': '#111111',            // elevation-50 inverts to very dark
  '--theme-overlay':  'rgba(5, 5, 5, 0.75)',
}

// ─── Garbage value filter ─────────────────────────────────────────────────────
//
// Skips "other" category vars whose value is a CSS selector fragment rather
// than a real CSS property value. Allows CSS function prefixes and numeric
// values; blocks anything with bare selector chars (.  #  :).

const CSS_FUNCTION_PREFIXES = [
  'var(', 'calc(', 'rgba(', 'rgb(', 'hsl(', 'hsla(',
  'linear-gradient(', 'radial-gradient(',
]

const isGarbageValue = (v: PayloadCSSVariable): boolean => {
  if (v.category !== 'other') return false
  if (CSS_FUNCTION_PREFIXES.some((prefix) => v.value.startsWith(prefix))) return false
  if (/^[\d.]+(%|px|rem|em|ms|s|vw|vh)/.test(v.value)) return false
  return /[.#:]/.test(v.value)
}

// ─── Variable map ─────────────────────────────────────────────────────────────
//
// Flat map of all CSS variables keyed by var name. Flattens all categories
// (including status.success/warning/error). Applies garbage-value filter to
// "other" category. Applies VALUE_PATCHES to fix SCSS interpolation gaps.

function buildVariableMap(): Record<string, PayloadCSSVariable> {
  const { baseScale, elevation, theme, status, typography, layout, other } =
    payloadThemeSchema.cssVariables

  const allVars: PayloadCSSVariable[] = [
    ...baseScale,
    ...elevation,
    ...theme,
    ...status.success,
    ...status.warning,
    ...status.error,
    ...typography,
    ...layout,
    ...other.filter((v) => !isGarbageValue(v)),
  ]

  const garbageCount = other.filter(isGarbageValue).length
  if (garbageCount > 0 && typeof window === 'undefined') {
    console.log(`[payload-theme] Filtered ${garbageCount} garbage values from "other" category`)
  }

  const map: Record<string, PayloadCSSVariable> = {}
  for (const v of allVars) {
    const patch = VALUE_PATCHES[v.var]
    map[v.var] = patch ? { ...v, ...patch } : v
  }
  return map
}

export const PAYLOAD_VARIABLES: Record<string, PayloadCSSVariable> = buildVariableMap()

// ─── Default theme ────────────────────────────────────────────────────────────

// Returns the default PayloadThemeConfig using patched values:
// - light: all overridable vars (patched values, empty string only if still unknown)
// - dark:  hardcoded practical values for the 4 explicit dark-mode vars

export function getDefaultTheme(): PayloadThemeConfig {
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}

  for (const v of Object.values(PAYLOAD_VARIABLES)) {
    if (!v.overridable) continue
    light[v.var] = v.value   // patched values already applied; no "#" remains
  }

  // Apply hardcoded dark defaults for explicit-mode vars
  for (const [varName, darkValue] of Object.entries(DARK_DEFAULTS)) {
    if (darkValue !== '') {
      dark[varName] = darkValue
    }
  }

  return { light, dark }
}

// ─── Category lookup ──────────────────────────────────────────────────────────

// Returns all variables for a given category string.
// Category can be "base-scale", "elevation", "theme", "status.success",
// "status.warning", "status.error", "typography", "layout", or "other".
export function getVariablesByCategory(category: string): PayloadCSSVariable[] {
  const { baseScale, elevation, theme, status, typography, layout, other } =
    payloadThemeSchema.cssVariables

  const applyPatch = (v: PayloadCSSVariable): PayloadCSSVariable => {
    const patch = VALUE_PATCHES[v.var]
    return patch ? { ...v, ...patch } : v
  }

  switch (category) {
    case 'base-scale':
      // --color-base-* raw palette — the primary theming lever.
      // Changing these rethemes everything; dark mode inversion is automatic.
      return baseScale.map(applyPatch)
    case 'elevation':
      // --theme-elevation-* computed aliases (overridable: false, hidden in UI).
      return elevation.map(applyPatch)
    case 'theme':
      return theme.map(applyPatch)
    case 'status.success':
      return status.success.map(applyPatch)
    case 'status.warning':
      return status.warning.map(applyPatch)
    case 'status.error':
      return status.error.map(applyPatch)
    case 'typography':
      return typography.map(applyPatch)
    case 'layout':
      return layout.map(applyPatch).filter((v) => !isGarbageValue(v))
    case 'other':
      return other.filter((v) => !isGarbageValue(v)).map(applyPatch)
    default:
      return []
  }
}
