// Component styling layer: what tokens can't express (a branded sidebar, card shadows, uppercase
// table headers…) as a small, typed set of properties on Payload v4's stable BEM classes.
// Payload's own CSS is layered, so these unlayered rules win without !important.

export type PropKind = 'color' | 'shadow' | 'radius' | 'weight' | 'case' | 'tracking' | 'scheme' | 'spacing'

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
  // Text also re-declares Payload's text/icon tokens locally, so nested labels and icons follow
  text: {
    label: 'Text',
    kind: 'color',
    decl: 'color: $; --color-text: $; --color-text-secondary: $; --color-icon: $; --color-icon-secondary: $',
  },
  textHover: {
    label: 'Hover text',
    kind: 'color',
    decl: 'color: $; --color-text: $; --color-icon: $',
    state: ':hover',
  },
  border: { label: 'Border', kind: 'color', decl: 'border-color: $' },
  outline: {
    label: 'Outline',
    kind: 'color',
    decl: 'box-shadow: inset 0 0 0 var(--stroke-width-small) $',
  },
  divider: {
    label: 'Divider',
    kind: 'color',
    decl: 'border-bottom: var(--stroke-width-small) solid $',
  },
  accent: { label: 'Accent bar', kind: 'color', decl: 'box-shadow: inset 3px 0 0 $' },
  shadow: { label: 'Shadow', kind: 'shadow', decl: 'box-shadow: $' },
  radius: { label: 'Radius', kind: 'radius', decl: 'border-radius: $' },
  padding: { label: 'Padding (inside)', kind: 'spacing', decl: 'padding: $' },
  margin: { label: 'Margin (outside)', kind: 'spacing', decl: 'margin: $' },
  weight: { label: 'Weight', kind: 'weight', decl: 'font-weight: $' },
  case: { label: 'Case', kind: 'case', decl: 'text-transform: $' },
  tracking: { label: 'Letter spacing', kind: 'tracking', decl: 'letter-spacing: $' },
  // Re-declares Payload's dark-mode color tokens inside the component, so every nested control
  // (menus, tabs, toggles, links) switches to its dark styling — e.g. a navy sidebar in light mode
  scheme: { label: 'Dark contents', kind: 'scheme', decl: '' },
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
  {
    id: 'sidebar',
    label: 'Sidebar',
    hint: 'The main navigation column on the left.',
    group: 'Navigation',
    selectors: ['.nav'],
    props: ['bg', 'scheme', 'border', 'shadow'],
  },
  {
    id: 'sidebarLink',
    label: 'Sidebar link',
    hint: 'Each collection / global link in the sidebar.',
    group: 'Navigation',
    selectors: ['.nav__link'],
    props: ['text', 'bgHover', 'textHover', 'radius', 'weight', 'padding'],
  },
  {
    id: 'sidebarLinkActive',
    label: 'Active sidebar link',
    hint: "The sidebar link of the page you're on.",
    group: 'Navigation',
    // Payload paints the selected highlight on ::before
    selectors: [
      '.nav__link--selected',
      '.nav__link--selected:hover',
      '.nav__link--selected::before',
    ],
    props: ['bg', 'text', 'accent', 'weight'],
  },
  {
    id: 'sidebarGroup',
    label: 'Sidebar group label',
    hint: 'Group headings in the sidebar (Content, Settings…).',
    group: 'Navigation',
    selectors: ['.nav-group__label'],
    props: ['text', 'weight', 'case', 'tracking'],
  },
  {
    id: 'header',
    label: 'Top bar',
    hint: 'The bar above every page with breadcrumbs and the locale switcher.',
    group: 'Navigation',
    selectors: ['.app-header'],
    props: ['bg', 'divider', 'shadow'],
  },
  {
    id: 'docTabs',
    label: 'Active tab',
    hint: 'The selected tab in documents (Edit / Versions / API) and in tab fields.',
    group: 'Navigation',
    selectors: ['.tabs-field__tab-button--active', '.doc-tab--active'],
    props: ['text', 'bg', 'weight'],
  },

  {
    id: 'buttonPrimary',
    label: 'Primary button',
    hint: 'Main actions: Publish, Save, Create New.',
    group: 'Actions',
    selectors: ['.btn--style-primary'],
    props: ['bg', 'bgHover', 'text', 'radius', 'shadow', 'weight', 'case', 'tracking', 'padding'],
  },
  {
    id: 'buttonSecondary',
    label: 'Secondary button',
    hint: 'Secondary actions next to primary ones (Save Draft, Filters, Columns).',
    group: 'Actions',
    selectors: ['.btn--style-secondary'],
    props: ['bg', 'bgHover', 'text', 'outline', 'radius', 'weight', 'padding'],
  },
  {
    id: 'pill',
    label: 'Pills & badges',
    hint: 'Status labels like Draft and Published, counts and tags.',
    group: 'Actions',
    selectors: ['.pill'],
    props: ['radius', 'weight', 'case', 'tracking', 'padding'],
  },

  {
    id: 'card',
    label: 'Cards',
    hint: 'Collection cards on the dashboard and cards in custom views.',
    group: 'Surfaces',
    selectors: ['.card'],
    props: ['bg', 'bgHover', 'border', 'radius', 'shadow', 'padding', 'margin'],
  },
  {
    id: 'widget',
    label: 'Dashboard widgets',
    hint: 'The boxes on the dashboard.',
    group: 'Surfaces',
    selectors: ['.widget-card', '.widget'],
    props: ['bg', 'border', 'radius', 'shadow', 'padding'],
  },
  {
    id: 'panel',
    label: 'Array, block & collapsible rows',
    hint: 'Repeating rows in array and block fields, and collapsible sections.',
    group: 'Surfaces',
    selectors: ['.collapsible'],
    props: ['bg', 'border', 'radius', 'shadow', 'margin'],
  },
  {
    id: 'drawer',
    label: 'Drawers',
    hint: 'Panels that slide in from the side (edit a relation, pick media).',
    group: 'Surfaces',
    selectors: ['.drawer__content'],
    props: ['bg', 'shadow', 'radius'],
  },
  {
    id: 'banner',
    label: 'Banners',
    hint: 'Inline messages (info, success, warning, error).',
    group: 'Surfaces',
    selectors: ['.banner'],
    props: ['radius', 'weight', 'padding'],
  },
  {
    id: 'toast',
    label: 'Toasts',
    hint: 'Pop-up notifications after saving, publishing or errors.',
    group: 'Surfaces',
    selectors: ['.payload-toast-item'],
    props: ['radius', 'shadow'],
  },

  {
    id: 'tableHeader',
    label: 'Table header',
    hint: 'The column header row in list views.',
    group: 'Data',
    selectors: ['.table thead th'],
    props: ['bg', 'text', 'weight', 'case', 'tracking', 'padding'],
  },
  {
    id: 'tableCell',
    label: 'Table cells',
    hint: 'Every cell in list views — padding sets how airy rows are.',
    group: 'Data',
    selectors: ['.table tbody td'],
    props: ['padding'],
  },
  {
    id: 'tableRow',
    label: 'Table row hover',
    hint: 'Background of a list row under the pointer.',
    group: 'Data',
    selectors: ['.table tbody tr:hover td'],
    props: ['bg'],
  },

  {
    id: 'input',
    label: 'Inputs',
    hint: 'Text inputs and select dropdowns.',
    group: 'Forms',
    selectors: ['.form-input', '.rs__control'],
    props: ['bg', 'border', 'radius', 'shadow', 'padding'],
  },
  {
    id: 'fieldLabel',
    label: 'Field labels',
    hint: 'The label above every field.',
    group: 'Forms',
    selectors: ['.field-label'],
    props: ['text', 'weight', 'case', 'tracking'],
  },

  {
    id: 'pageTitle',
    label: 'Page titles',
    hint: 'Large titles at the top of documents, lists and the dashboard.',
    group: 'Typography',
    selectors: ['.doc-header__title', '.list-header__title', '.welcome-widget__heading'],
    props: ['text', 'weight', 'tracking'],
  },
]

export const COMPONENT_BY_ID = Object.fromEntries(COMPONENTS.map((c) => [c.id, c]))

/** Per component: shared (mode-independent) values in `light`; colors may also differ in `dark`. */
export type ComponentStyles = Record<
  string,
  { light?: Partial<Record<PropKey, string>>; dark?: Partial<Record<PropKey, string>> }
>

// Shadows reference elevation tokens, which already differ per mode, so only colors are per-mode
export const isColorProp = (p: PropKey) => PROPS[p].kind === 'color'

// ─── Value validation ───────────────────────────────────────────────────────

const VALID: Record<PropKind, (v: string) => boolean> = {
  color: (v) =>
    /^(#[0-9a-f]{3,8}|rgba?\([\d.,\s%/]+\)|hsla?\([\d.,\s%/deg]+\)|transparent|currentcolor|var\(--[a-z0-9-]+\))$/i.test(
      v,
    ) ||
    // gradients built only from colors, tokens, angles and stops
    /^linear-gradient\((\d+deg|to [a-z ]+)?[\s,#0-9a-z().%-]*\)$/i.test(v),
  shadow: (v) => v === 'none' || /^[\w\s.,()%#/-]+$/.test(v),
  radius: (v) => /^(\d+(\.\d+)?(px|rem|em|%)|0|var\(--[a-z0-9-]+\))$/.test(v),
  weight: (v) => /^[1-9]00$/.test(v),
  case: (v) => ['none', 'uppercase', 'lowercase', 'capitalize'].includes(v),
  tracking: (v) => /^-?\d+(\.\d+)?(em|px)$|^0$|^normal$/.test(v),
  scheme: (v) => v === 'dark',
  // one to four lengths, like CSS padding/margin
  spacing: (v) => /^(-?\d+(\.\d+)?(px|rem|em)|0)( (-?\d+(\.\d+)?(px|rem|em)|0)){0,3}$/.test(v),
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
export function buildComponentCss(
  styles: ComponentStyles,
  scope = 'html',
  darkTokens: Record<string, string> = {},
): string {
  const out: string[] = []
  for (const def of COMPONENTS) {
    const s = styles[def.id]
    if (!s) continue
    if (s.light?.scheme === 'dark') {
      // Dark token values inside the component; its own background becomes --color-bg so
      // nested surfaces (the sidebar header, toggles) blend into it
      const bg = s.light.bg && !s.light.bg.startsWith('linear-gradient') ? s.light.bg : undefined
      const decls = Object.entries(darkTokens).map(
        ([v, value]) => `${v}: ${v === '--color-bg' && bg ? bg : value}`,
      )
      out.push(
        rule(
          def.selectors.map((sel) => `${scope} ${sel}`),
          [...decls, 'color: var(--color-text)'],
        ),
      )
    }
    // The sidebar header paints its own background; let a custom sidebar show through it
    if (def.id === 'sidebar' && (s.light?.bg || s.dark?.bg)) {
      out.push(rule([`${scope} .nav__header`], ['background: transparent']))
    }
    // group declarations by (mode, state)
    const buckets = new Map<string, string[]>()
    const add = (mode: 'shared' | 'light' | 'dark', state: string, decl: string) => {
      const key = `${mode}|${state}`
      buckets.set(key, [...(buckets.get(key) ?? []), decl])
    }
    for (const prop of def.props) {
      if (prop === 'scheme') continue
      const d = PROPS[prop] as PropDef
      const light = s.light?.[prop]
      const dark = s.dark?.[prop]
      if (light !== undefined)
        add(isColorProp(prop) ? 'light' : 'shared', d.state ?? '', d.decl.replaceAll('$', light))
      if (dark !== undefined && isColorProp(prop))
        add('dark', d.state ?? '', d.decl.replaceAll('$', dark))
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
