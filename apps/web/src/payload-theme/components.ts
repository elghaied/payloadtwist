// Component styling layer: what tokens can't express (a branded sidebar, card shadows, uppercase
// table headers…) as a small, typed set of properties on Payload v4's stable BEM classes.
// Payload's own CSS is layered, so these unlayered rules win without !important.

export type PropKind = 'color' | 'shadow' | 'radius' | 'weight' | 'case' | 'tracking'

export interface PropDef {
  label: string
  kind: PropKind
  /** CSS declaration template; `$` is the value */
  decl: string
  /** Applies to a state of the component, e.g. ':hover' */
  state?: string
}

export const PROPS = {
  bg: { label: 'Background', kind: 'color', decl: 'background: $' },
  bgHover: { label: 'Hover background', kind: 'color', decl: 'background: $', state: ':hover' },
  text: { label: 'Text', kind: 'color', decl: 'color: $' },
  textHover: { label: 'Hover text', kind: 'color', decl: 'color: $', state: ':hover' },
  border: { label: 'Border', kind: 'color', decl: 'border-color: $' },
  outline: { label: 'Outline', kind: 'color', decl: 'box-shadow: inset 0 0 0 var(--stroke-width-small) $' },
  divider: { label: 'Divider', kind: 'color', decl: 'border-bottom: var(--stroke-width-small) solid $' },
  accent: { label: 'Accent bar', kind: 'color', decl: 'box-shadow: inset 3px 0 0 $' },
  shadow: { label: 'Shadow', kind: 'shadow', decl: 'box-shadow: $' },
  radius: { label: 'Radius', kind: 'radius', decl: 'border-radius: $' },
  weight: { label: 'Weight', kind: 'weight', decl: 'font-weight: $' },
  case: { label: 'Case', kind: 'case', decl: 'text-transform: $' },
  tracking: { label: 'Letter spacing', kind: 'tracking', decl: 'letter-spacing: $' },
} as const satisfies Record<string, PropDef>

export type PropKey = keyof typeof PROPS

export interface ComponentDef {
  id: string
  label: string
  group: 'Navigation' | 'Actions' | 'Surfaces' | 'Data' | 'Forms' | 'Typography'
  selectors: string[]
  props: PropKey[]
  hint?: string
}

export const COMPONENTS: ComponentDef[] = [
  { id: 'sidebar', label: 'Sidebar', group: 'Navigation', selectors: ['.nav'], props: ['bg', 'text', 'border', 'shadow'] },
  { id: 'sidebarLink', label: 'Sidebar link', group: 'Navigation', selectors: ['.nav__link'], props: ['text', 'bgHover', 'textHover', 'radius', 'weight'] },
  {
    id: 'sidebarLinkActive',
    label: 'Active sidebar link',
    group: 'Navigation',
    selectors: ['.nav__link--selected', '.nav__link--selected:hover'],
    props: ['bg', 'text', 'accent', 'weight'],
  },
  { id: 'sidebarGroup', label: 'Sidebar group label', group: 'Navigation', selectors: ['.nav-group__label'], props: ['text', 'weight', 'case', 'tracking'] },
  { id: 'header', label: 'Top bar', group: 'Navigation', selectors: ['.app-header'], props: ['bg', 'divider', 'shadow'] },
  { id: 'docTabs', label: 'Active tab', group: 'Navigation', selectors: ['.tabs-field__tab-button--active', '.doc-tab--active'], props: ['text', 'bg', 'weight'] },

  { id: 'buttonPrimary', label: 'Primary button', group: 'Actions', selectors: ['.btn--style-primary'], props: ['bg', 'bgHover', 'text', 'radius', 'shadow', 'weight', 'case', 'tracking'] },
  { id: 'buttonSecondary', label: 'Secondary button', group: 'Actions', selectors: ['.btn--style-secondary'], props: ['bg', 'bgHover', 'text', 'outline', 'radius', 'weight'] },
  { id: 'pill', label: 'Pills & badges', group: 'Actions', selectors: ['.pill'], props: ['radius', 'weight', 'case', 'tracking'] },

  { id: 'card', label: 'Cards', group: 'Surfaces', selectors: ['.card'], props: ['bg', 'bgHover', 'border', 'radius', 'shadow'] },
  { id: 'widget', label: 'Dashboard widgets', group: 'Surfaces', selectors: ['.widget-card', '.widget'], props: ['bg', 'border', 'radius', 'shadow'] },
  { id: 'panel', label: 'Array, block & collapsible rows', group: 'Surfaces', selectors: ['.collapsible'], props: ['bg', 'border', 'radius', 'shadow'] },
  { id: 'drawer', label: 'Drawers', group: 'Surfaces', selectors: ['.drawer__content'], props: ['bg', 'shadow', 'radius'] },
  { id: 'banner', label: 'Banners', group: 'Surfaces', selectors: ['.banner'], props: ['radius', 'weight'] },
  { id: 'toast', label: 'Toasts', group: 'Surfaces', selectors: ['.payload-toast-item'], props: ['radius', 'shadow'] },

  { id: 'tableHeader', label: 'Table header', group: 'Data', selectors: ['.table thead th'], props: ['bg', 'text', 'weight', 'case', 'tracking'] },
  { id: 'tableRow', label: 'Table row hover', group: 'Data', selectors: ['.table tbody tr:hover td'], props: ['bg'] },

  { id: 'input', label: 'Inputs', group: 'Forms', selectors: ['.form-input', '.rs__control'], props: ['bg', 'border', 'radius', 'shadow'] },
  { id: 'fieldLabel', label: 'Field labels', group: 'Forms', selectors: ['.field-label'], props: ['text', 'weight', 'case', 'tracking'] },

  {
    id: 'pageTitle',
    label: 'Page titles',
    group: 'Typography',
    selectors: ['.doc-header__title', '.list-header__title', '.welcome-widget__heading'],
    props: ['text', 'weight', 'tracking'],
  },
]

export const COMPONENT_BY_ID = Object.fromEntries(COMPONENTS.map((c) => [c.id, c]))

/** Per component: shared (mode-independent) values in `light`; colors may also differ in `dark`. */
export type ComponentStyles = Record<string, { light?: Partial<Record<PropKey, string>>; dark?: Partial<Record<PropKey, string>> }>

// Shadows reference elevation tokens, which already differ per mode, so only colors are per-mode
export const isColorProp = (p: PropKey) => PROPS[p].kind === 'color'

// ─── Value validation ───────────────────────────────────────────────────────

const VALID: Record<PropKind, (v: string) => boolean> = {
  color: (v) => /^(#[0-9a-f]{3,8}|rgba?\([\d.,\s%/]+\)|hsla?\([\d.,\s%/deg]+\)|transparent|currentcolor|var\(--[a-z0-9-]+\))$/i.test(v),
  shadow: (v) => v === 'none' || /^[\w\s.,()%#/-]+$/.test(v),
  radius: (v) => /^(\d+(\.\d+)?(px|rem|em|%)|0|var\(--[a-z0-9-]+\))$/.test(v),
  weight: (v) => /^[1-9]00$/.test(v),
  case: (v) => ['none', 'uppercase', 'lowercase', 'capitalize'].includes(v),
  tracking: (v) => /^-?\d+(\.\d+)?(em|px)$|^0$|^normal$/.test(v),
}

export function isValidComponentValue(prop: PropKey, value: string): boolean {
  if (/[;{}<>\\]|url\(|@import|expression\(/i.test(value) || value.length > 300) return false
  return VALID[PROPS[prop].kind](value.trim())
}

// ─── CSS ────────────────────────────────────────────────────────────────────

function rule(selectors: string[], decls: string[]): string {
  if (!decls.length) return ''
  return `${selectors.join(',\n')} {\n${decls.map((d) => `  ${d};`).join('\n')}\n}`
}

/**
 * CSS for the component layer. Shared values apply in both modes; colors set for light only are
 * scoped to light mode so they never leak into dark.
 */
export function buildComponentCss(styles: ComponentStyles, scope = 'html'): string {
  const out: string[] = []
  for (const def of COMPONENTS) {
    const s = styles[def.id]
    if (!s) continue
    // group declarations by (mode, state)
    const buckets = new Map<string, string[]>()
    const add = (mode: 'shared' | 'light' | 'dark', state: string, decl: string) => {
      const key = `${mode}|${state}`
      buckets.set(key, [...(buckets.get(key) ?? []), decl])
    }
    for (const prop of def.props) {
      const d = PROPS[prop] as PropDef
      const light = s.light?.[prop]
      const dark = s.dark?.[prop]
      if (light !== undefined) add(isColorProp(prop) ? 'light' : 'shared', d.state ?? '', d.decl.replace('$', light))
      if (dark !== undefined && isColorProp(prop)) add('dark', d.state ?? '', d.decl.replace('$', dark))
    }
    for (const [key, decls] of buckets) {
      const [mode, state] = key.split('|')
      const sels = def.selectors.flatMap((sel) => {
        const full = `${sel}${state}`
        if (mode === 'shared') return [`${scope} ${full}`]
        if (mode === 'light') return [`${scope}:not([data-theme='dark']) ${full}`]
        return [`${scope}[data-theme='dark'] ${full}`, `${scope} [data-theme='dark'] ${full}`]
      })
      out.push(rule(sels, decls))
    }
  }
  return out.filter(Boolean).join('\n\n')
}
