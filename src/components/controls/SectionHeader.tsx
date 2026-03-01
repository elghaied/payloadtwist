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
      className="w-full flex items-center gap-1.5 h-8 px-1 group hover:bg-[#F0EDE8] rounded transition-colors"
    >
      <ChevronRight
        size={12}
        className="text-[#78726C] flex-shrink-0 transition-transform duration-150"
        style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}
      />
      <span className="text-[10px] uppercase tracking-widest text-[#78726C] flex-1 text-left font-medium">
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span
          className="text-[9px] text-[#78726C] bg-[#F0EDE8] px-1.5 py-0.5 rounded-full tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
