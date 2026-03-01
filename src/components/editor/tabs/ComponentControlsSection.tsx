'use client'

import { useState, useMemo, useCallback } from 'react'
import { SectionHeader, ColorPopover, ControlRow } from '@/components/controls'
import { ScrubberInput } from '../ScrubberInput'
import { highlightBemBlock } from '@/payload-theme/generator'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import {
  COMPONENTS_BY_REGION,
  CONTROLS_BY_COMPONENT,
  ROLE_ORDER,
  type ControlDescriptor,
  type ComponentSummary,
} from '@/payload-theme/component-controls'
import { Crosshair } from 'lucide-react'

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

function isCssColorValue(value: string): boolean {
  if (!value) return false
  if (/^#[0-9a-fA-F]{3,8}$/.test(value.trim())) return true
  if (value.startsWith('rgb') || value.startsWith('hsl')) return true
  return false
}

interface ComponentControlsSectionProps {
  regionNames: string[]
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}

export function ComponentControlsSection({
  regionNames,
  config,
  setComponentOverride,
}: ComponentControlsSectionProps) {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const toggleComponent = useCallback((key: string) => {
    setExpandedComponents((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const q = searchQuery.toLowerCase()

  // Get all components for our regions
  const allComponents = useMemo(() => {
    const result: { region: string; component: ComponentSummary }[] = []
    for (const region of regionNames) {
      const comps = COMPONENTS_BY_REGION[region] ?? []
      for (const comp of comps) {
        if (!q || comp.componentName.toLowerCase().includes(q) || region.toLowerCase().includes(q)) {
          result.push({ region, component: comp })
        }
      }
    }
    return result
  }, [regionNames, q])

  if (allComponents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[11px] text-[#78726C]">
          {searchQuery ? 'No matching components' : 'No components in this category'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Search */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search components..."
        className="w-full text-xs bg-[#F8F7F5] border border-[#E5E2DC] rounded px-2.5 py-1.5 text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#5B6CF0] mb-2"
      />

      {allComponents.map(({ component: comp }) => {
        const key = `${comp.category}/${comp.componentName}`
        const isExpanded = expandedComponents.has(key)
        const controls = CONTROLS_BY_COMPONENT[comp.componentName] ?? []
        const overrides = config.componentOverrides ?? {}
        const overrideCount = controls.filter((c) => overrides[c.id] !== undefined).length

        return (
          <div key={key}>
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <SectionHeader
                  label={comp.componentName}
                  count={overrideCount > 0 ? overrideCount : undefined}
                  isOpen={isExpanded}
                  onToggle={() => toggleComponent(key)}
                />
              </div>
              {comp.bemBlock && (
                <button
                  onClick={() => highlightBemBlock(comp.bemBlock)}
                  className="p-1 rounded hover:bg-[#F0EDE8] text-[#78726C] hover:text-[#1C1917] transition-colors flex-shrink-0"
                  title="Highlight in preview"
                  aria-label="Highlight"
                >
                  <Crosshair size={11} />
                </button>
              )}
            </div>

            {isExpanded && controls.length > 0 && (
              <ComponentControls
                controls={controls}
                config={config}
                setComponentOverride={setComponentOverride}
              />
            )}

            {isExpanded && controls.length === 0 && (
              <p className="text-[10px] text-[#78726C] pl-6 pb-2">
                No visual controls — use Raw CSS for manual overrides.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ComponentControls({
  controls,
  config,
  setComponentOverride,
}: {
  controls: ControlDescriptor[]
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}) {
  const grouped = useMemo(() => {
    const result: Record<string, ControlDescriptor[]> = {}
    for (const ctrl of controls) {
      if (!result[ctrl.role]) result[ctrl.role] = []
      result[ctrl.role].push(ctrl)
    }
    return result
  }, [controls])

  return (
    <div className="pl-5 pb-3 space-y-2">
      {ROLE_ORDER.map((role) => {
        const roleControls = grouped[role]
        if (!roleControls?.length) return null
        return (
          <div key={role}>
            <div className="text-[9px] uppercase tracking-widest text-[#78726C] mb-0.5 pt-0.5 font-medium">
              {ROLE_LABELS[role]}
            </div>
            {roleControls.map((control) => (
              <SingleControl
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
  )
}

function SingleControl({
  control,
  config,
  setComponentOverride,
}: {
  control: ControlDescriptor
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}) {
  const currentOverride = config.componentOverrides?.[control.id]
  const hasOverride = currentOverride !== undefined

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

  let controlEl: React.ReactNode = null

  if (control.controlType === 'color') {
    controlEl = (
      <ColorPopover
        value={displayValue}
        onChange={(v) => setComponentOverride(control.selector, control.property, v)}
        swatchSize="sm"
      />
    )
  } else if (control.controlType === 'size') {
    controlEl = (
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
    )
  }

  return (
    <ControlRow
      label={control.label}
      control={controlEl}
      onReset={handleReset}
      hasOverride={hasOverride}
      tokenRef={control.referencedVar ?? undefined}
    />
  )
}
