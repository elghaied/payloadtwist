import { Star, Globe, Lock } from 'lucide-react'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface PresetCardProps {
  id: string
  name: string
  description?: string | null
  themeData: PayloadThemeConfig
  authorName?: string
  averageRating: number
  ratingCount: number
  isPublic: boolean
  isOwner?: boolean
  onDelete?: () => void
  onTogglePublic?: () => void
}

function ColorSwatches({ themeData }: { themeData: PayloadThemeConfig }) {
  const baseColors = [
    '--color-base-0',
    '--color-base-100',
    '--color-base-250',
    '--color-base-500',
    '--color-base-800',
  ]
  const colors = baseColors.map((v) => themeData.light[v]).filter(Boolean)

  if (colors.length === 0) return null

  return (
    <div className="flex gap-0.5 mb-3">
      {colors.map((color, i) => (
        <div
          key={i}
          className="h-4 flex-1 first:rounded-l last:rounded-r"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

export function PresetCard({
  id,
  name,
  description,
  themeData,
  authorName,
  averageRating,
  ratingCount,
  isPublic,
  isOwner,
  onDelete,
  onTogglePublic,
}: PresetCardProps) {
  return (
    <div className="rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-4 hover:border-purple-500/30 transition-colors group">
      <ColorSwatches themeData={themeData} />

      <div className="flex items-start justify-between gap-2 mb-1">
        <a href={`/presets/${id}`} className="text-sm font-semibold text-[var(--lp-text)] hover:text-purple-400 transition-colors truncate">
          {name}
        </a>
        <span className="flex-shrink-0" title={isPublic ? 'Public' : 'Private'}>
          {isPublic ? (
            <Globe size={12} className="text-[var(--lp-text-faint)]" />
          ) : (
            <Lock size={12} className="text-[var(--lp-text-faint)]" />
          )}
        </span>
      </div>

      {description && (
        <p className="text-xs text-[var(--lp-text-muted)] mb-2 line-clamp-2">{description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <Star size={12} className={averageRating > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-[var(--lp-text-faint)]'} />
          <span className="text-xs text-[var(--lp-text-muted)]">
            {averageRating > 0 ? averageRating.toFixed(1) : '-'}
            {ratingCount > 0 && <span className="ml-0.5">({ratingCount})</span>}
          </span>
        </div>
        {authorName && (
          <span className="text-xs text-[var(--lp-text-faint)]">{authorName}</span>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--lp-border)]">
          <a
            href={`/editor?preset=${id}`}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Edit
          </a>
          {onTogglePublic && (
            <button
              onClick={onTogglePublic}
              className="text-xs text-[var(--lp-text-muted)] hover:text-[var(--lp-text)] transition-colors"
            >
              {isPublic ? 'Make private' : 'Make public'}
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-red-400 hover:text-red-300 transition-colors ml-auto"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
