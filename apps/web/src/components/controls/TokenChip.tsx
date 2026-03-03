'use client'

interface TokenChipProps {
  varName: string
  onClick?: () => void
}

export function TokenChip({ varName, onClick }: TokenChipProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded bg-[var(--pt-surface-hover)] border border-[var(--pt-border)] text-[var(--pt-text-muted)] truncate max-w-[100px] ${
        onClick ? 'cursor-pointer hover:text-[var(--pt-accent)] hover:border-[var(--pt-accent-muted)]' : ''
      }`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      title={`var(${varName})`}
    >
      var(…)
    </span>
  )
}
