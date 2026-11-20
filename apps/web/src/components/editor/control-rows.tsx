'use client'

import { RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { SliderInput } from '@/components/editor/SliderInput'
import { describeToken, highlightSelectors } from '@/payload-theme/descriptions'
import { useHighlight } from './token-ui'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'

export const SHADOW_INFO: Record<string, string> = {
  default: 'Payload',
  flat: 'Outlines only',
  soft: 'Diffuse, airy',
  deep: 'Strong lift',
  glow: 'Brand-colored',
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  info,
  onChange,
  highlight = [],
}: {
  label: string
  options: readonly T[]
  value: T
  info?: Record<string, string>
  onChange: (v: T) => void
  /** Component selectors to outline in the preview while hovering */
  highlight?: string[]
}) {
  const hover = useHighlight(highlight)
  return (
    <div {...hover} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`rounded-md border px-1.5 py-1.5 text-left transition-colors ${
            value === o ? 'border-[var(--pt-accent)] bg-[var(--pt-accent-soft)]' : 'border-[var(--pt-border)] hover:border-[var(--pt-border-strong)]'
          }`}
        >
          <span className="block text-[13px] font-medium capitalize text-[var(--pt-text)]">{o}</span>
          {info?.[o] && <span className="block text-xs text-[var(--pt-text-faint)] leading-tight mt-0.5">{info[o]}</span>}
        </button>
      ))}
    </div>
  )
}

export const pxOf = (v: string | undefined) => (v ? (v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v)) || 0 : 0)

/** Label + description on the left, reset + control on the right; hovering outlines what it changes. */
export function ControlRow({
  label,
  description,
  highlight = [],
  onReset,
  children,
}: {
  label: string
  description?: string
  highlight?: string[]
  onReset?: () => void
  children: ReactNode
}) {
  const hover = useHighlight(highlight)
  return (
    <div className="flex items-center gap-2 py-1 rounded hover:bg-[var(--pt-surface-hover)] -mx-1 px-1" {...hover}>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] text-[var(--pt-text)]">{label}</span>
        {description && <span className="block text-xs text-[var(--pt-text-muted)] leading-snug">{description}</span>}
      </span>
      {onReset && (
        <button onClick={onReset} className="p-0.5 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label={`Reset ${label}`}>
          <RotateCcw size={11} />
        </button>
      )}
      {children}
    </div>
  )
}

/** A size token (px) as slider + number. `resolved` is the light-mode resolved token map. */
export function PxTokenRow({
  varName,
  label,
  min,
  max,
  step = 1,
  theme,
  resolved,
  description,
}: {
  varName: string
  label: string
  min: number
  max: number
  step?: number
  theme: ThemeConfig
  resolved: Record<string, string>
  description?: string
}) {
  const setToken = useEditorStore((s) => s.setToken)
  return (
    <ControlRow
      label={label}
      description={description ?? describeToken(varName)}
      highlight={highlightSelectors(varName)}
      onReset={varName in theme.light ? () => setToken(varName, null, 'light') : undefined}
    >
      <SliderInput value={+pxOf(resolved[varName]).toFixed(2)} min={min} max={max} step={step} unit="px" label={label} onChange={(n) => setToken(varName, `${n}px`, 'light')} />
    </ControlRow>
  )
}
