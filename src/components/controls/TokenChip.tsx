'use client'

interface TokenChipProps {
  varName: string
  onClick?: () => void
}

export function TokenChip({ varName, onClick }: TokenChipProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded bg-[#F0EDE8] border border-[#E5E2DC] text-[#78726C] truncate max-w-[100px] ${
        onClick ? 'cursor-pointer hover:text-[#5B6CF0] hover:border-[#5B6CF0]/30' : ''
      }`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      title={`var(${varName})`}
    >
      var(…)
    </span>
  )
}
