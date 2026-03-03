'use client'

import { cn } from '@/lib/utils'

interface ColorSwatchProps {
  color: string
  hasOverride?: boolean
  size?: 'sm' | 'lg'
  onClick?: () => void
  className?: string
}

export function ColorSwatch({
  color,
  hasOverride,
  size = 'sm',
  onClick,
  className,
}: ColorSwatchProps) {
  const dim = size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        dim,
        'rounded-[4px] border border-[var(--pt-border)] flex-shrink-0 relative transition-transform duration-150 hover:scale-110 focus-visible:ring-1 focus-visible:ring-[var(--pt-accent)] focus-visible:outline-none shadow-sm',
        className,
      )}
      style={{ background: color }}
      title={color}
    >
      {hasOverride && (
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--pt-accent)]" />
      )}
    </button>
  )
}
