'use client'

import { RotateCcw } from 'lucide-react'
import { TokenChip } from './TokenChip'

interface ControlRowProps {
  label: string
  subtitle?: string
  control: React.ReactNode
  onReset?: () => void
  hasOverride?: boolean
  tokenRef?: string
}

export function ControlRow({ label, subtitle, control, onReset, hasOverride, tokenRef }: ControlRowProps) {
  return (
    <div className="flex items-center gap-1.5 py-1 group min-h-[28px]">
      <div className="flex-1 min-w-0">
        <span
          className="text-[11px] text-[var(--pt-text-label)] block truncate"
          title={label}
        >
          {label}
        </span>
        {subtitle && (
          <span
            className="text-[9px] text-[var(--pt-text-faint)] block truncate"
            title={subtitle}
          >
            {subtitle}
          </span>
        )}
      </div>

      {tokenRef && !hasOverride && <TokenChip varName={tokenRef} />}

      <div className="flex-shrink-0">{control}</div>

      {hasOverride && onReset && (
        <button
          onClick={onReset}
          className="text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5"
          title="Reset to default"
          aria-label="Reset"
        >
          <RotateCcw size={10} />
        </button>
      )}
    </div>
  )
}
