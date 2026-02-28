/**
 * component-controls.ts
 *
 * Pure data module — no React. Builds visual control descriptors from
 * schema.components styleUsages for use in the BEM Visual Editor tab.
 */

import schema from './payload-theme-schema.json'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ControlRole =
  | 'background'
  | 'text'
  | 'border'
  | 'radius'
  | 'spacing'
  | 'font'
  | 'typography'
  | 'shadow'
  | 'opacity'

export type ControlType = 'color' | 'size' | 'font' | 'opacity'

export interface ControlDescriptor {
  id: string                    // "${selector}||${property}"
  componentName: string
  category: string              // schema category: "elements" | "fields" | etc.
  selector: string              // e.g. ".btn--style-primary"
  property: string              // e.g. "background-color"
  role: ControlRole
  originalValue: string         // raw value from schema
  referencedVar: string | null  // "--theme-elevation-800" or null
  controlType: ControlType
  label: string                 // e.g. "Button Style Primary — Background"
  region: string                // e.g. "UI Elements"
}

export interface ComponentSummary {
  componentName: string
  category: string
  bemBlock: string
  controlCount: number
  region: string
}

// ─── Region Map ───────────────────────────────────────────────────────────────

interface RegionMapping {
  elements?: string[]
  fields?: string[]
  views?: string[]
  widgets?: string[]
}

const REGION_MAP: Record<string, RegionMapping> = {
  Navigation: {
    elements: ['Nav', 'NavGroup', 'Hamburger', 'Logout', 'StepNav'],
  },
  'List View': {
    elements: [
      'Table', 'SortColumn', 'SortHeader', 'Pagination', 'PerPage',
      'ListControls', 'ListHeader', 'ListSelection', 'SelectAll',
      'SelectRow', 'NoListResults', 'SearchBar', 'SearchFilter', 'ColumnSelector',
    ],
    views: ['List', 'BrowseByFolder', 'CollectionFolder'],
  },
  'Edit View': {
    elements: [
      'DocumentControls', 'DocumentFields', 'StickyToolbar', 'SaveButton',
      'SaveDraftButton', 'PublishButton', 'DeleteDocument', 'DuplicateDocument',
      'Autosave', 'LeaveWithoutSaving',
    ],
    views: ['Edit'],
  },
  Fields: {
    fields: [
      'Array', 'Blocks', 'Checkbox', 'Code', 'Collapsible', 'DateTime', 'Email',
      'Group', 'JSON', 'Number', 'Password', 'RadioGroup', 'Relationship',
      'RichText', 'Row', 'Select', 'Text', 'Textarea', 'Upload', 'Tabs', 'Point',
    ],
  },
  'Overlays & Modals': {
    elements: [
      'Modal', 'Drawer', 'Popup', 'Tooltip', 'LoadingOverlay',
      'FullscreenModal', 'ConfirmationModal',
    ],
  },
  'UI Elements': {
    elements: [
      'Button', 'Pill', 'Banner', 'Card', 'ErrorPill', 'Loading',
      'ShimmerEffect', 'Thumbnail', 'ThumbnailCard', 'Upload', 'Dropzone',
    ],
  },
  'App Shell': {
    elements: ['AppHeader', 'Status', 'Toasts', 'Gutter'],
  },
}

// Build inverse lookup: "elements/Button" → "UI Elements"
const COMPONENT_TO_REGION = new Map<string, string>()
for (const [region, mapping] of Object.entries(REGION_MAP)) {
  for (const [cat, names] of Object.entries(mapping)) {
    for (const name of names) {
      COMPONENT_TO_REGION.set(`${cat}/${name}`, region)
    }
  }
}

// ─── Classifiers ──────────────────────────────────────────────────────────────

function classifyPropertyRole(property: string): ControlRole | null {
  if (property === 'background-color' || property === 'background') return 'background'
  if (property === 'color') return 'text'
  if (property === 'border-color' || property === 'border' || property === 'outline') return 'border'
  if (property === 'border-radius') return 'radius'
  if (property === 'padding' || property === 'margin' || property === 'gap') return 'spacing'
  if (property === 'font-family') return 'font'
  if (property === 'font-size' || property === 'line-height') return 'typography'
  if (property === 'box-shadow') return 'shadow'
  if (property === 'opacity') return 'opacity'
  return null
}

function deriveControlType(role: ControlRole): ControlType {
  if (role === 'background' || role === 'text' || role === 'border' || role === 'shadow') return 'color'
  if (role === 'radius' || role === 'spacing' || role === 'typography') return 'size'
  if (role === 'font') return 'font'
  if (role === 'opacity') return 'opacity'
  return 'size'
}

const ROLE_LABEL: Record<ControlRole, string> = {
  background: 'Background',
  text: 'Text Color',
  border: 'Border',
  radius: 'Radius',
  spacing: 'Spacing',
  font: 'Font',
  typography: 'Font Size',
  shadow: 'Shadow',
  opacity: 'Opacity',
}

function deriveLabel(componentName: string, selector: string, role: ControlRole): string {
  // Extract first class only (normalize multiline selectors)
  const normalizedSelector = selector.replace(/\s+/g, ' ').trim()
  const firstCls = normalizedSelector.replace(/^\./, '').split(/[\s,+~>]/)[0]

  let subpart = ''
  const eidx = firstCls.indexOf('__')
  const midx = firstCls.indexOf('--')
  if (eidx !== -1) subpart = firstCls.slice(eidx + 2)
  else if (midx !== -1) subpart = firstCls.slice(midx + 2)

  // Title-case subpart
  const subLabel = subpart
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const prefix = subLabel ? `${componentName} ${subLabel}` : componentName
  return `${prefix} — ${ROLE_LABEL[role]}`
}

/** Extract a single CSS var name from a value like "var(--theme-elevation-100)" */
function extractReferencedVar(value: string): string | null {
  const m = value.match(/var\((--[\w-]+)/)
  return m ? m[1] : null
}

// ─── Build controls ───────────────────────────────────────────────────────────

interface SchemaComponent {
  sourceFile: string
  bemBlock: string
  category: string
  cssVarCount: number
  styleUsages: Array<{
    selector: string
    property: string
    value: string
    valueType: string
  }>
}

type SchemaComponents = Record<string, Record<string, SchemaComponent>>

const components = schema.components as unknown as SchemaComponents

const _allControls: ControlDescriptor[] = []
const _controlsByComponent: Record<string, ControlDescriptor[]> = {}
const _componentsByRegion: Record<string, ComponentSummary[]> = {}

const seenIds = new Set<string>()

for (const [category, categoryComponents] of Object.entries(components)) {
  for (const [compName, comp] of Object.entries(categoryComponents)) {
    if (!comp.styleUsages || comp.styleUsages.length === 0) continue

    const regionKey = `${category}/${compName}`
    const region = COMPONENT_TO_REGION.get(regionKey) ?? 'Other'

    const compControls: ControlDescriptor[] = []

    for (const usage of comp.styleUsages) {
      const role = classifyPropertyRole(usage.property)
      if (!role) continue
      // Skip non-var "other" values for color roles to avoid spammy hardcoded colors
      // but allow size values for size roles
      const isCssVar = usage.valueType === 'css-var'
      const isColor = usage.valueType === 'color'
      const isSize = usage.valueType === 'size'
      // For color roles: prefer css-var or explicit color; skip 'other' and 'size'
      const colorRoles: ControlRole[] = ['background', 'text', 'border', 'shadow']
      if (colorRoles.includes(role) && !isCssVar && !isColor) continue
      // For size roles: prefer css-var or size; skip 'other'
      const sizeRoles: ControlRole[] = ['radius', 'spacing', 'typography']
      if (sizeRoles.includes(role) && !isCssVar && !isSize) continue

      // Normalize multiline selectors to first clean selector
      const normalizedSelector = usage.selector.replace(/\s+/g, ' ').trim()
      const id = `${normalizedSelector}||${usage.property}`

      if (seenIds.has(id)) continue
      seenIds.add(id)

      const referencedVar = isCssVar ? extractReferencedVar(usage.value) : null
      const controlType = deriveControlType(role)
      const label = deriveLabel(compName, normalizedSelector, role)

      const descriptor: ControlDescriptor = {
        id,
        componentName: compName,
        category,
        selector: normalizedSelector,
        property: usage.property,
        role,
        originalValue: usage.value,
        referencedVar,
        controlType,
        label,
        region,
      }

      compControls.push(descriptor)
      _allControls.push(descriptor)
    }

    if (compControls.length > 0) {
      _controlsByComponent[compName] = (_controlsByComponent[compName] ?? []).concat(compControls)

      const existing = _componentsByRegion[region]
      const summary: ComponentSummary = {
        componentName: compName,
        category,
        bemBlock: comp.bemBlock ?? '',
        controlCount: compControls.length,
        region,
      }
      if (!existing) {
        _componentsByRegion[region] = [summary]
      } else {
        // Avoid duplicate component summaries
        if (!existing.some((s) => s.componentName === compName && s.category === category)) {
          existing.push(summary)
        } else {
          // Update count if component already added (multiple schema categories)
          const idx = existing.findIndex((s) => s.componentName === compName && s.category === category)
          if (idx !== -1) existing[idx].controlCount += compControls.length
        }
      }
    }
  }
}

// Sort components within each region alphabetically
for (const region of Object.keys(_componentsByRegion)) {
  _componentsByRegion[region].sort((a, b) => a.componentName.localeCompare(b.componentName))
}

// ─── Public exports ───────────────────────────────────────────────────────────

export const VISUAL_REGION_ORDER: string[] = [
  'Navigation',
  'List View',
  'Edit View',
  'Fields',
  'Overlays & Modals',
  'UI Elements',
  'App Shell',
  'Other',
]

/** All generated control descriptors */
export const ALL_CONTROLS: ControlDescriptor[] = _allControls

/** componentName → list of ControlDescriptors */
export const CONTROLS_BY_COMPONENT: Record<string, ControlDescriptor[]> = _controlsByComponent

/** region → sorted list of ComponentSummary */
export const COMPONENTS_BY_REGION: Record<string, ComponentSummary[]> = _componentsByRegion

export function getControlsForComponent(componentName: string): ControlDescriptor[] {
  return _controlsByComponent[componentName] ?? []
}

export function getControlsForRegion(region: string): ControlDescriptor[] {
  const summaries = _componentsByRegion[region] ?? []
  return summaries.flatMap((s) => _controlsByComponent[s.componentName] ?? [])
}

export const ROLE_ORDER: ControlRole[] = [
  'background', 'text', 'border', 'radius', 'spacing', 'typography', 'shadow', 'opacity', 'font',
]
