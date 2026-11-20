import { TOKENS } from './schema'

// Plain-language descriptions for Payload's variables, built from its naming system
// (UI3-style: --color-{bg|text|icon|border}-{intent}-{variant}) with hand-written text for the
// tokens people touch most. Also human names for the component blocks in `usedBy`.

const EXACT: Record<string, string> = {
  '--color-bg': 'Main page background, and the default background of panels and fields.',
  '--color-bg-secondary': 'Slightly darker background for secondary areas: table headers, tabs, inactive panels.',
  '--color-bg-tertiary': 'A third background level, darker still — pressed or nested areas.',
  '--color-bg-elevated': 'Background of things that float above the page: drawers, popups, dropdown menus.',
  '--color-bg-hover': 'Background when the pointer is over a row, menu item or plain button.',
  '--color-bg-pressed': 'Background while a row, menu item or plain button is being clicked.',
  '--color-bg-brand': 'Primary button background and other strong brand fills (checked checkboxes, switches).',
  '--color-bg-brand-hover': 'Primary button background on hover.',
  '--color-bg-brand-pressed': 'Primary button background while clicked.',
  '--color-bg-brand-tertiary': 'Soft brand tint behind brand banners and highlighted items.',
  '--color-bg-selected': 'Background of the selected item: active sidebar link, selected row, chosen option.',
  '--color-bg-menu': 'Background of dark menus (Payload uses an inverted menu surface).',
  '--color-bg-tooltip': 'Background of tooltips.',
  '--color-text': 'Main text color everywhere.',
  '--color-text-secondary': 'Supporting text: descriptions, meta information, placeholders in lists.',
  '--color-text-tertiary': 'Faintest text: hints, disabled-looking labels, counters.',
  '--color-text-brand': 'Links and brand-colored text.',
  '--color-text-onbrand': 'Text on top of brand backgrounds, e.g. the label of a primary button.',
  '--color-text-danger': 'Error messages and destructive action labels.',
  '--color-icon': 'Default icon color.',
  '--color-icon-secondary': 'Icons in supporting places: field icons, list actions.',
  '--color-border': 'Default border and divider color: cards, panels, table rows.',
  '--color-border-strong': 'High-emphasis borders.',
  '--color-border-selected': 'Border of the selected or focused item.',
  '--accessibility-focus-color': 'The keyboard focus ring around buttons, links and fields.',
  '--field-color-bg': 'Background of text inputs, selects, date pickers and code editors.',
  '--field-color-border': 'Border of form fields at rest.',
  '--field-color-border-hover': 'Border of form fields on hover.',
  '--field-color-border-focus': 'Border of form fields while typing in them.',
  '--field-color-text': 'Text typed into form fields.',
  '--field-color-label': 'Field labels above inputs.',
  '--field-color-placeholder': 'Placeholder text inside empty fields.',
  '--nav-width': 'Width of the main sidebar on desktop.',
  '--doc-sidebar-width': 'Width of the sidebar inside a document (status, dates, relationships).',
  '--gutter-h': 'Horizontal page padding — the space between the content and the window edge. Shrinks on smaller screens.',
  '--spacing-field': 'Vertical gap between fields in forms.',
  '--spacing-view-bottom': 'Empty space at the bottom of every page.',
  '--field-padding-inline': 'Left and right padding inside text inputs and selects.',
  '--field-min-height-large': 'Height of regular form fields.',
  '--field-min-height-medium': 'Height of smaller form fields.',
  '--field-border-radius': 'Corner radius of form fields.',
  '--button-height': 'Height of buttons and button-like controls (tabs, icon buttons).',
  '--button-radius': 'Corner radius of buttons.',
  '--control-height': 'Height of compact controls: search boxes, pagination, toolbars.',
  '--popup-radius': 'Corner radius of menus and popups.',
  '--popup-item-radius': 'Corner radius of the items inside menus.',
  '--stroke-width-small': 'Thickness of most borders and outlines.',
  '--stroke-width-medium': 'Thickness of emphasized borders.',
  '--elevation-100-canvas': 'Faint shadow around cards, panels and widgets that sit on the page.',
  '--elevation-300-tooltip': 'Shadow under tooltips and small popups.',
  '--elevation-400-menu-panel': 'Shadow under dropdown menus, selects and popovers.',
  '--elevation-500-modal-window': 'Shadow under dialogs, drawers and modals.',
  '--font-body': 'Font stack for all body text.',
  '--font-mono': 'Font stack for code and monospaced values.',
  '--text-body-family': 'Typeface for body text.',
  '--text-heading-family': 'Typeface for headings.',
  '--text-mono-family': 'Typeface for code.',
}

const KIND: Record<string, string> = { bg: 'Background', text: 'Text color', icon: 'Icon color', border: 'Border color' }

const WORD: Record<string, string> = {
  brand: 'brand (primary actions)',
  danger: 'errors and destructive actions',
  success: 'success states',
  warning: 'warnings',
  info: 'informational messages',
  selected: 'selected items',
  inverse: 'inverted surfaces',
  menu: 'menus',
  tooltip: 'tooltips',
  elevated: 'floating surfaces',
  disabled: 'disabled controls',
  component: 'component highlights (purple — currently unused by Payload)',
  assistive: 'assistive UI (pink — currently unused by Payload)',
  favorite: 'favorites',
  control: 'form controls',
  transparent: 'transparent buttons',
}

const STATE: Record<string, string> = {
  hover: 'on hover',
  pressed: 'while pressed',
  secondary: '(secondary variant)',
  tertiary: '(soft tint)',
  strong: '(stronger)',
}

function semantic(v: string): string | null {
  const m = v.match(/^--(?:field-)?color-(bg|text|icon|border)-?(.*)$/)
  if (!m) return null
  const parts = m[2] ? m[2].split('-') : []
  let subject = ''
  const extras: string[] = []
  for (const p of parts) {
    if (p.startsWith('on') && p.length > 2) subject = `on top of ${WORD[p.slice(2)] ?? p.slice(2)} backgrounds`
    else if (WORD[p] && !subject) subject = `for ${WORD[p]}`
    else if (STATE[p]) extras.push(STATE[p])
    else if (p) extras.push(p)
  }
  return `${KIND[m[1]]} ${[subject, ...extras].filter(Boolean).join(' ')}`.trim() + '.'
}

const FAMILY: Record<string, string> = {
  blue: 'brand',
  'pale-blue': 'muted brand (dark mode)',
  purple: 'accent / component (unused by Payload today)',
  'pale-purple': 'muted accent (dark mode)',
  grey: 'neutral grey',
  green: 'success',
  'pale-green': 'muted success (dark mode)',
  red: 'danger',
  'dark-red': 'danger (dark mode)',
  'pale-red': 'muted danger (dark mode)',
  yellow: 'warning',
  'pale-yellow': 'muted warning (dark mode)',
  pink: 'assistive (unused by Payload today)',
  black: 'black at different opacities',
  white: 'white at different opacities',
}

export function describeToken(v: string): string {
  if (EXACT[v]) return EXACT[v]
  const ramp = v.match(/^--ramp-(.+)-(\d+)$/)
  if (ramp) return `Step ${ramp[2]} of the ${FAMILY[ramp[1]] ?? ramp[1]} color scale (lower = lighter). Semantic colors point at these steps.`
  const sem = semantic(v)
  if (sem) return sem
  const field = v.match(/^--field-color-(.+)$/)
  if (field) {
    const words = field[1]
      .split('-')
      .map((w) => ({ bg: 'background', checked: 'when checked', disabled: 'when disabled', readonly: 'when read-only', hover: 'on hover', focus: 'while focused', error: 'error', toggle: 'checkbox/radio', upload: 'upload area' })[w] ?? w)
    return `Form fields — ${words.join(' ')}.`
  }
  const text = v.match(/^--text-([a-z0-9]+)-([a-z0-9]+)(?:-(strong|bold|paragraph))?-(font-size|line-height|font-weight|letter-spacing|font-family|weight)$/)
  if (text) {
    const [, kind, size, variant, prop] = text
    const what = prop.replace('font-', '').replace('-', ' ')
    return `${what[0].toUpperCase()}${what.slice(1)} of ${size} ${kind} text${variant ? ` (${variant})` : ''}.`
  }
  const radius = v.match(/^--radius-(.+)$/)
  if (radius) return `Corner radius step "${radius[1]}" — other radii (buttons, fields, popups) refer to these.`
  const spacer = v.match(/^--spacer-(.+)$/)
  if (spacer) return `Spacing step ${spacer[1].replace('-', '.')} — paddings and gaps across the admin use these steps.`
  const elevation = v.match(/^--elevation-\d+-(.+)$/)
  if (elevation) return `Shadow used for ${elevation[1].replace('-', ' ')}s.`
  const z = v.match(/^--z-(.+)$/)
  if (z) return `Stacking order of ${z[1].replace('-', ' ')}s (higher sits on top).`
  const bp = v.match(/^--breakpoint-(.+)-width$/)
  if (bp) return `Screen width of the "${bp[1]}" breakpoint (read-only reference; media queries can't use variables).`
  return v.replace(/^--/, '').replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) + '.'
}

// ─── Component block names ──────────────────────────────────────────────────

const BLOCK_NAMES: Record<string, string> = {
  btn: 'Buttons',
  rs: 'Select dropdowns',
  nav: 'Sidebar',
  'nav-group': 'Sidebar groups',
  'app-header': 'Top bar',
  'form-input': 'Text inputs',
  'react-datepicker': 'Date picker',
  'date-time-picker': 'Date fields',
  'popup-button-list': 'Menu items',
  popup: 'Menus & popups',
  pill: 'Pills',
  chip: 'Chips',
  card: 'Cards',
  table: 'Tables',
  'checkbox-input': 'Checkboxes',
  switch: 'Switches',
  banner: 'Banners',
  drawer: 'Drawers',
  collapsible: 'Collapsibles',
  'tabs-field': 'Tabs',
  'doc-tab': 'Document tabs',
  'doc-controls': 'Document toolbar',
  'rich-text-lexical': 'Rich text editor',
  'code-editor': 'Code editor',
  'search-input': 'Search',
  paginator: 'Pagination',
  'payload-toast-item': 'Toasts',
  tooltip: 'Tooltips',
}

export function blockName(block: string): string {
  return BLOCK_NAMES[block] ?? block.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

/** Human names of the components a token reaches, most recognizable first. */
export function usedByNames(v: string): string[] {
  const blocks = TOKENS[v]?.usedBy ?? []
  const known = blocks.filter((b) => BLOCK_NAMES[b])
  const rest = blocks.filter((b) => !BLOCK_NAMES[b])
  return [...known, ...rest].map(blockName)
}

/** CSS selectors to highlight in the preview for a token (its component blocks). */
export function highlightSelectors(v: string): string[] {
  return (TOKENS[v]?.usedBy ?? []).map((b) => `.${b}`)
}
