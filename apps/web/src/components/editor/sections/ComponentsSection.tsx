'use client'

import { useState } from 'react'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { ColorPopover } from '@/components/controls'
import { ScrubberInput } from '@/components/editor/ScrubberInput'
import { COMPONENTS, isColorProp, PROPS, type ComponentDef, type PropKey } from '@/payload-theme/components'
import type { Mode, ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { Group, useResolved } from '../token-ui'

const SHADOWS = [
  { label: 'None', value: 'none' },
  { label: 'Hairline', value: 'var(--elevation-100-canvas)' },
  { label: 'Small', value: 'var(--elevation-300-tooltip)' },
  { label: 'Medium', value: 'var(--elevation-400-menu-panel)' },
  { label: 'Large', value: 'var(--elevation-500-modal-window)' },
]
const WEIGHTS = ['400', '500', '600', '700']
const CASES = [
  { label: 'Aa', value: 'none' },
  { label: 'AA', value: 'uppercase' },
  { label: 'Ab', value: 'capitalize' },
]

const GROUPS = [...new Set(COMPONENTS.map((c) => c.group))]

function Choice({ options, value, onChange }: { options: { label: string; value: string }[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded bg-[var(--pt-bg)] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-1.5 py-0.5 rounded text-[10.5px] ${value === o.value ? 'bg-[var(--pt-accent)] text-white' : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

const pxOf = (v?: string) => (v ? (v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v)) : undefined)

function PropRow({ def, prop, theme, fallback }: { def: ComponentDef; prop: PropKey; theme: ThemeConfig; fallback: Record<Mode, string> }) {
  const set = useEditorStore((s) => s.setComponentProp)
  const p = PROPS[prop]
  const styles = theme.components[def.id] ?? {}
  const light = styles.light?.[prop]
  const dark = styles.dark?.[prop]
  const overridden = light !== undefined || dark !== undefined
  const reset = () => {
    set(def.id, prop, null, 'light')
    if (dark !== undefined) set(def.id, prop, null, 'dark')
  }

  let control: React.ReactNode
  if (isColorProp(prop)) {
    control = (
      <div className="flex gap-1.5">
        {(['light', 'dark'] as const).map((mode) => (
          <ColorPopover
            key={mode}
            value={(mode === 'light' ? light : dark) ?? fallback[mode]}
            onChange={(hex) => set(def.id, prop, hex, mode)}
            hasOverride={(mode === 'light' ? light : dark) !== undefined}
            label={`${def.label} · ${p.label} (${mode})`}
          />
        ))}
      </div>
    )
  } else if (p.kind === 'shadow') {
    control = (
      <select
        value={light ?? ''}
        onChange={(e) => set(def.id, prop, e.target.value || null, 'light')}
        className="text-[11px] bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-1.5 py-0.5 text-[var(--pt-text)]"
        aria-label={`${def.label} shadow`}
      >
        <option value="">Payload</option>
        {SHADOWS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    )
  } else if (p.kind === 'radius') {
    control = <ScrubberInput value={pxOf(light) ?? 0} min={0} max={32} step={1} unit="px" onChange={(n) => set(def.id, prop, `${n}px`, 'light')} />
  } else if (p.kind === 'weight') {
    control = <Choice options={WEIGHTS.map((w) => ({ label: w, value: w }))} value={light} onChange={(v) => set(def.id, prop, v, 'light')} />
  } else if (p.kind === 'scheme') {
    control = (
      <Choice
        options={[
          { label: 'Auto', value: '' },
          { label: 'Dark', value: 'dark' },
        ]}
        value={light ?? ''}
        onChange={(v) => set(def.id, prop, v || null, 'light')}
      />
    )
  } else if (p.kind === 'case') {
    control = <Choice options={CASES} value={light} onChange={(v) => set(def.id, prop, v, 'light')} />
  } else {
    control = (
      <ScrubberInput
        value={light ? Math.round(parseFloat(light) * 100) : 0}
        min={-5}
        max={20}
        step={1}
        unit="/100em"
        onChange={(n) => set(def.id, prop, `${n / 100}em`, 'light')}
      />
    )
  }

  return (
    <div className="flex items-center gap-2 py-0.5 min-h-[28px]">
      <span className="flex-1 text-[11px] text-[var(--pt-text-label)]">{p.label}</span>
      {overridden && (
        <button onClick={reset} className="p-0.5 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label={`Reset ${def.label} ${p.label}`}>
          <RotateCcw size={10} />
        </button>
      )}
      {control}
    </div>
  )
}

// What Payload paints each color prop with by default, for the pickers' starting value
const FALLBACK_TOKEN: Partial<Record<PropKey, string>> = {
  bg: '--color-bg',
  bgHover: '--color-bg-hover',
  text: '--color-text',
  textHover: '--color-text',
  border: '--color-border',
  outline: '--color-border',
  divider: '--color-border',
  accent: '--color-bg-brand',
}

export function ComponentsSection({ theme }: { theme: ThemeConfig }) {
  const resolved = useResolved(theme)
  const [open, setOpen] = useState<Record<string, boolean>>({ sidebar: true })
  const fallback = (prop: PropKey): Record<Mode, string> => {
    const v = FALLBACK_TOKEN[prop] ?? '--color-bg'
    return { light: resolved.light[v], dark: resolved.dark[v] }
  }

  return (
    <div className="space-y-6">
      <p className="text-[11px] text-[var(--pt-text-faint)]">
        Styles tokens can&apos;t express — a branded sidebar, card shadows, uppercase table headers — on Payload&apos;s stable
        component classes. Colors have light and dark values; everything else applies to both modes.
      </p>
      {GROUPS.map((group) => (
        <Group key={group} title={group}>
          <div className="divide-y divide-[var(--pt-border)] border-y border-[var(--pt-border)]">
            {COMPONENTS.filter((c) => c.group === group).map((def) => {
              const count = Object.keys(theme.components[def.id]?.light ?? {}).length + Object.keys(theme.components[def.id]?.dark ?? {}).length
              const isOpen = open[def.id]
              return (
                <div key={def.id}>
                  <button
                    onClick={() => setOpen((o) => ({ ...o, [def.id]: !o[def.id] }))}
                    aria-expanded={!!isOpen}
                    className="w-full flex items-center gap-1.5 py-2 text-left text-[11.5px] font-medium text-[var(--pt-text)]"
                  >
                    <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    {def.label}
                    {count > 0 && <span className="ml-auto text-[9px] font-mono bg-[var(--pt-accent-soft)] text-[var(--pt-accent)] px-1.5 rounded-full">{count}</span>}
                  </button>
                  {isOpen && (
                    <div className="pb-2 pl-4">
                      {def.props.map((prop) => (
                        <PropRow key={prop} def={def} prop={prop} theme={theme} fallback={fallback(prop)} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Group>
      ))}
    </div>
  )
}
