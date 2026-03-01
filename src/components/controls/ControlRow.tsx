'use client'

import { RotateCcw } from 'lucide-react'
import { TokenChip } from './TokenChip'

interface ControlRowProps {
  label: string
  control: React.ReactNode
  onReset?: () => void
  hasOverride?: boolean
  tokenRef?: string
}

export function ControlRow({ label, control, onReset, hasOverride, tokenRef }: ControlRowProps) {
  return (
    <div className="flex items-center gap-1.5 py-1 group min-h-[28px]">
      <span
        className="text-[11px] text-[#57534E] flex-1 truncate"
        title={label}
      >
        {label}
      </span>

      {tokenRef && !hasOverride && <TokenChip varName={tokenRef} />}

      <div className="flex-shrink-0">{control}</div>

      {hasOverride && onReset && (
        <button
          onClick={onReset}
          className="text-[#78726C] hover:text-[#1C1917] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5"
          title="Reset to default"
          aria-label="Reset"
        >
          <RotateCcw size={10} />
        </button>
      )}
    </div>
  )
}
