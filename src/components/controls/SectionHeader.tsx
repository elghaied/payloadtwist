'use client'

import { ChevronRight } from 'lucide-react'

interface SectionHeaderProps {
  label: string
  count?: number
  isOpen: boolean
  onToggle: () => void
}

export function SectionHeader({ label, count, isOpen, onToggle }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-1.5 h-8 px-1 group hover:bg-[var(--pt-surface-hover)] rounded transition-colors"
    >
      <ChevronRight
        size={12}
        className="text-[var(--pt-text-muted)] flex-shrink-0 transition-transform duration-150"
        style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}
      />
      <span className="text-[10px] uppercase tracking-widest text-[var(--pt-text-muted)] flex-1 text-left font-medium">
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span
          className="text-[9px] text-[var(--pt-text-muted)] bg-[var(--pt-surface-hover)] px-1.5 py-0.5 rounded-full tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
