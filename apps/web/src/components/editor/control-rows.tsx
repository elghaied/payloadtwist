'use client'

import { RotateCcw } from 'lucide-react'
import { ScrubberInput } from '@/components/editor/ScrubberInput'
import { TOKENS } from '@/payload-theme/schema'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'

export const SHADOW_INFO: Record<string, string> = {
  default: 'Payload',
  flat: 'Outlines only',
  soft: 'Diffuse, airy',
  deep: 'Strong lift',
  glow: 'Brand-colored',
}

export function Segmented<T extends string>({ label, options, value, info, onChange }: { label: string; options: readonly T[]; value: T; info?: Record<string, string>; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={label}>
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

export const pxOf = (v: string | undefined) => (v ? (v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v)) : 0)

export function PxTokenRow({ varName, label, min, max, theme }: { varName: string; label: string; min: number; max: number; theme: ThemeConfig }) {
  const setToken = useEditorStore((s) => s.setToken)
  const value = pxOf(theme.light[varName] ?? TOKENS[varName]?.light)
  const overridden = varName in theme.light
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="flex-1 text-[13px] text-[var(--pt-text-label)]">{label}</span>
      {overridden && (
        <button onClick={() => setToken(varName, null, 'light')} className="p-0.5 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label={`Reset ${label}`}>
          <RotateCcw size={10} />
        </button>
      )}
      <ScrubberInput value={value} min={min} max={max} step={1} unit="px" onChange={(n) => setToken(varName, `${n}px`, 'light')} />
    </div>
  )
}

