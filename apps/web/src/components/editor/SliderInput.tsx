'use client'

import { useState } from 'react'

interface NumberProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  /** Accessible name */
  label?: string
}

/** Typed number field: in-range values apply as you type, anything else is restored on blur. */
export function NumberInput({ value, onChange, min = 0, max = 100, step = 1, unit, label }: NumberProps) {
  const [draft, setDraft] = useState(String(value))
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    setDraft(String(value))
  }
  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = parseFloat(e.target.value)
          if (Number.isFinite(n) && n >= min && n <= max) onChange(n)
        }}
        onBlur={() => setDraft(String(value))}
        className="w-[4.25rem] text-[13px] font-mono tabular-nums text-right bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-1.5 py-0.5 text-[var(--pt-text)] focus:outline-none focus:border-[var(--pt-accent)]"
      />
      {unit && <span className="w-5 text-xs text-[var(--pt-text-muted)]">{unit}</span>}
    </span>
  )
}

/** Slider for quick changes plus a number field for exact values. */
export function SliderInput(props: NumberProps) {
  const { value, onChange, min = 0, max = 100, step = 1, label } = props
  return (
    <span className="inline-flex items-center gap-2 shrink-0">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="w-24 accent-[var(--pt-accent)] cursor-pointer"
      />
      <NumberInput {...props} />
    </span>
  )
}
