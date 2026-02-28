'use client'

import { useState, useMemo, useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { highlightBemBlock } from '@/payload-theme/generator'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import {
  VISUAL_REGION_ORDER,
  COMPONENTS_BY_REGION,
  CONTROLS_BY_COMPONENT,
  ROLE_ORDER,
  type ControlDescriptor,
  type ComponentSummary,
} from '@/payload-theme/component-controls'
import { BemSection } from './BemSection'
import { ColorPicker } from './ColorPicker'
import { ScrubberInput } from './ScrubberInput'
import { ChevronRight, RotateCcw, Crosshair } from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
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

function parseUnit(value: string): string {
  const m = value.match(/[a-z%]+$/i)
  return m ? m[0] : 'px'
}

function isHexLike(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim())
}

function isCssColorValue(value: string): boolean {
  if (!value) return false
  if (isHexLike(value)) return true
  if (value.startsWith('rgb') || value.startsWith('hsl')) return true
  return false
}

// ─── SubTabButton ────────────────────────────────────────────────────────────

function SubTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 text-xs transition-colors flex-shrink-0 ${
        active ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: active ? 500 : 400 }}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-blue-500 rounded-full" />
      )}
    </button>
  )
}

// ─── ControlRow ───────────────────────────────────────────────────────────────

interface ControlRowProps {
  control: ControlDescriptor
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}

function ControlRow({ control, config, setComponentOverride }: ControlRowProps) {
  const overrideKey = control.id
  const currentOverride = config.componentOverrides?.[overrideKey]
  const hasOverride = currentOverride !== undefined

  // Resolve display value: override → referenced var → original value → fallback
  const displayValue = useMemo(() => {
    if (currentOverride !== undefined) return currentOverride
    if (control.referencedVar) {
      const resolvedFromLight = config.light[control.referencedVar]
      if (resolvedFromLight) return resolvedFromLight
    }
    if (isCssColorValue(control.originalValue)) return control.originalValue
    return '#808080'
  }, [currentOverride, control.referencedVar, control.originalValue, config.light])

  const handleReset = useCallback(() => {
    setComponentOverride(control.selector, control.property, '')
  }, [control.selector, control.property, setComponentOverride])

  return (
    <div className="flex items-center gap-1.5 py-1 group">
      <span
        className="text-[11px] text-zinc-400 flex-1 truncate"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        title={control.label}
      >
        {control.label}
      </span>

      {control.controlType === 'color' && (
        <ColorPicker
          value={displayValue}
          onChange={(v) => setComponentOverride(control.selector, control.property, v)}
          size="sm"
        />
      )}

      {control.controlType === 'size' && (
        <ScrubberInput
          value={parseFloat(displayValue) || 0}
          unit={parseUnit(displayValue)}
          onChange={(v) =>
            setComponentOverride(
              control.selector,
              control.property,
              `${v}${parseUnit(displayValue)}`,
            )
          }
          min={0}
          max={200}
          step={1}
        />
      )}

      {control.referencedVar && !hasOverride && (
        <span
          className="text-[9px] text-zinc-600 truncate max-w-[60px] flex-shrink-0"
          title={`var(${control.referencedVar})`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          var(…)
        </span>
      )}

      {hasOverride && (
        <button
          onClick={handleReset}
          className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="Reset to default"
          aria-label="Reset"
        >
          <RotateCcw size={10} />
        </button>
      )}
    </div>
  )
}

// ─── VisualComponentEditor ────────────────────────────────────────────────────

interface VisualComponentEditorProps {
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
  resetComponentOverrides: () => void
}

function VisualComponentEditor({
  config,
  setComponentOverride,
  resetComponentOverrides,
}: VisualComponentEditorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedComponent, setSelectedComponent] = useState<ComponentSummary | null>(null)
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set([VISUAL_REGION_ORDER[0]]),
  )

  const toggleRegion = useCallback((region: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev)
      if (next.has(region)) next.delete(region)
      else next.add(region)
      return next
    })
  }, [])

  const handleSelectComponent = useCallback((comp: ComponentSummary) => {
    setSelectedComponent(comp)
    if (comp.bemBlock) highlightBemBlock(comp.bemBlock)
  }, [])

  const handleHighlight = useCallback(() => {
    if (selectedComponent?.bemBlock) highlightBemBlock(selectedComponent.bemBlock)
  }, [selectedComponent])

  const handleResetComponent = useCallback(() => {
    if (!selectedComponent) return
    const controls = CONTROLS_BY_COMPONENT[selectedComponent.componentName] ?? []
    const overrides = config.componentOverrides ?? {}
    for (const control of controls) {
      if (overrides[control.id] !== undefined) {
        setComponentOverride(control.selector, control.property, '')
      }
    }
  }, [selectedComponent, config.componentOverrides, setComponentOverride])

  // Filter components by search
  const q = searchQuery.toLowerCase()
  const filteredRegions = useMemo(() => {
    if (!q) return COMPONENTS_BY_REGION
    const result: Record<string, ComponentSummary[]> = {}
    for (const region of VISUAL_REGION_ORDER) {
      const comps = COMPONENTS_BY_REGION[region] ?? []
      const filtered = comps.filter(
        (c) => c.componentName.toLowerCase().includes(q) || region.toLowerCase().includes(q),
      )
      if (filtered.length > 0) result[region] = filtered
    }
    return result
  }, [q])

  // When searching, auto-expand matching regions
  const effectiveExpanded = useMemo(() => {
    if (!q) return expandedRegions
    return new Set(Object.keys(filteredRegions))
  }, [q, filteredRegions, expandedRegions])

  // Controls for selected component, grouped by role
  const { groupedByRole, allControls } = useMemo(() => {
    if (!selectedComponent) return { groupedByRole: {}, allControls: [] }
    const controls = CONTROLS_BY_COMPONENT[selectedComponent.componentName] ?? []
    const grouped: Record<string, ControlDescriptor[]> = {}
    for (const ctrl of controls) {
      if (!grouped[ctrl.role]) grouped[ctrl.role] = []
      grouped[ctrl.role].push(ctrl)
    }
    return { groupedByRole: grouped, allControls: controls }
  }, [selectedComponent])

  const componentOverrideCount = useMemo(() => {
    if (!selectedComponent) return 0
    const overrides = config.componentOverrides ?? {}
    const controls = CONTROLS_BY_COMPONENT[selectedComponent.componentName] ?? []
    return controls.filter((c) => overrides[c.id] !== undefined).length
  }, [selectedComponent, config.componentOverrides])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search */}
      <div className="px-2 py-1.5 border-b border-zinc-800/80 flex-shrink-0">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search components…"
          className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Navigator */}
        <div className="w-[160px] flex-shrink-0 border-r border-zinc-800/80 overflow-y-auto py-1">
          {VISUAL_REGION_ORDER.map((region) => {
            const comps = filteredRegions[region]
            if (!comps || comps.length === 0) return null
            const isExpanded = effectiveExpanded.has(region)
            return (
              <div key={region}>
                <button
                  onClick={() => toggleRegion(region)}
                  className="w-full flex items-center gap-1 py-1 px-2 text-left hover:bg-zinc-900/50 transition-colors"
                >
                  <ChevronRight
                    size={10}
                    className={`text-zinc-600 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                  <span
                    className="text-[10px] uppercase tracking-wider text-zinc-500 truncate flex-1"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {region}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-3 border-l border-zinc-800/50 pl-1">
                    {comps.map((comp) => {
                      const isSelected =
                        selectedComponent?.componentName === comp.componentName &&
                        selectedComponent?.category === comp.category
                      const hasOverrides = Object.keys(config.componentOverrides ?? {}).some(
                        (key) =>
                          (CONTROLS_BY_COMPONENT[comp.componentName] ?? []).some(
                            (c) => c.id === key,
                          ),
                      )
                      return (
                        <button
                          key={`${comp.category}/${comp.componentName}`}
                          onClick={() => handleSelectComponent(comp)}
                          className={`w-full flex items-center gap-1 py-0.5 px-1.5 text-left rounded transition-colors text-[11px] truncate ${
                            isSelected
                              ? 'border-l-2 border-blue-500 bg-zinc-800/30 text-zinc-200 -ml-px pl-[5px]'
                              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/50'
                          }`}
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <span className="flex-1 truncate">{comp.componentName}</span>
                          {hasOverrides && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Controls panel */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {!selectedComponent ? (
            <div className="flex items-center justify-center h-full">
              <p
                className="text-[11px] text-zinc-600 text-center px-4"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ← Select a component
              </p>
            </div>
          ) : allControls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
              <p
                className="text-[11px] text-zinc-600 text-center"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                No visual controls for this component.
              </p>
              <p
                className="text-[10px] text-zinc-700 text-center"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Use Legacy / Raw CSS for manual overrides.
              </p>
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-0.5">
              {/* Component header */}
              <div className="flex items-center gap-1.5 pb-1.5 mb-1 border-b border-zinc-800/50">
                <div className="flex-1 min-w-0">
                  <span
                    className="text-xs font-medium text-zinc-200 block truncate"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {selectedComponent.componentName}
                  </span>
                  {selectedComponent.bemBlock && (
                    <code
                      className="text-[10px] text-zinc-500"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      .{selectedComponent.bemBlock}
                    </code>
                  )}
                </div>
                {selectedComponent.bemBlock && (
                  <button
                    onClick={handleHighlight}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
                    title="Highlight in preview"
                    aria-label="Highlight"
                  >
                    <Crosshair size={12} />
                  </button>
                )}
                {componentOverrideCount > 0 && (
                  <button
                    onClick={handleResetComponent}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Reset component overrides"
                    aria-label="Reset"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>

              {/* Controls grouped by role */}
              {ROLE_ORDER.map((role) => {
                const controls = groupedByRole[role]
                if (!controls?.length) return null
                return (
                  <div key={role} className="mb-2">
                    <div
                      className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 pt-0.5"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {ROLE_LABELS[role]}
                    </div>
                    {controls.map((control) => (
                      <ControlRow
                        key={control.id}
                        control={control}
                        config={config}
                        setComponentOverride={setComponentOverride}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── BemTab ───────────────────────────────────────────────────────────────────

interface BemTabProps {
  config: PayloadThemeConfig
}

export function BemTab({ config }: BemTabProps) {
  const { setComponentOverride, resetComponentOverrides } = useEditorStore()
  const [subTab, setSubTab] = useState<'visual' | 'legacy'>('visual')

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab bar */}
      <div className="flex border-b border-zinc-800/80 flex-shrink-0 px-1">
        <SubTabButton active={subTab === 'visual'} onClick={() => setSubTab('visual')}>
          Visual Editor
        </SubTabButton>
        <SubTabButton active={subTab === 'legacy'} onClick={() => setSubTab('legacy')}>
          Legacy / Raw CSS
        </SubTabButton>
      </div>

      {subTab === 'visual' && (
        <VisualComponentEditor
          config={config}
          setComponentOverride={setComponentOverride}
          resetComponentOverrides={resetComponentOverrides}
        />
      )}

      {subTab === 'legacy' && (
        <div className="p-3 flex-1 overflow-y-auto">
          <BemSection config={config} />
        </div>
      )}
    </div>
  )
}
