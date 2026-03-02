'use client'

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { ChevronDown, Search, Star } from 'lucide-react'
import { getPublicPresets, getMyPresets } from '@/lib/actions/presets'
import type { PayloadThemeConfig } from '@/payload-theme/types'

const PREVIEW_STEPS = [
  '--color-base-0',
  '--color-base-200',
  '--color-base-500',
  '--color-base-800',
  '--color-base-1000',
] as const

interface ThemePresetSelectorProps {
  onApply: (config: PayloadThemeConfig) => void
  isLoggedIn: boolean
}

type PresetRow = Awaited<ReturnType<typeof getPublicPresets>>[number]

export function ThemePresetSelector({ onApply, isLoggedIn }: ThemePresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'public' | 'mine'>('public')
  const [search, setSearch] = useState('')
  const [publicPresets, setPublicPresets] = useState<PresetRow[]>([])
  const [myPresets, setMyPresets] = useState<PresetRow[]>([])
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activePresetName, setActivePresetName] = useState<string | null>(null)

  // Fetch presets when dropdown opens or search/tab changes
  useEffect(() => {
    if (!isOpen) return

    const fetchPresets = () => {
      startTransition(async () => {
        try {
          if (tab === 'public') {
            const results = await getPublicPresets({ search: search || undefined, limit: 30 })
            setPublicPresets(results)
          } else if (isLoggedIn) {
            const results = await getMyPresets({ search: search || undefined })
            setMyPresets(results)
          }
        } catch {
          // silently fail — user sees empty list
        }
      })
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    if (search) {
      searchTimeout.current = setTimeout(fetchPresets, 300)
    } else {
      fetchPresets()
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [isOpen, tab, search, isLoggedIn])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const handleSelect = useCallback(
    (preset: PresetRow) => {
      setActivePresetName(preset.name)
      onApply(preset.themeData)
      setIsOpen(false)
    },
    [onApply],
  )

  const presets = tab === 'public' ? publicPresets : myPresets

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-[var(--pt-border)] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:border-[var(--pt-border-strong)] rounded-full transition-colors font-medium"
      >
        <span className="truncate max-w-[120px]">
          {activePresetName ?? 'Theme Presets'}
        </span>
        <ChevronDown
          size={11}
          className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-[var(--pt-surface)] border border-[var(--pt-border)] rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="px-2.5 py-2 border-b border-[var(--pt-border)]">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[var(--pt-bg)] rounded border border-[var(--pt-border)] focus-within:border-[var(--pt-accent)]">
              <Search size={12} className="text-[var(--pt-text-muted)] flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search presets..."
                className="flex-1 bg-transparent text-xs text-[var(--pt-text)] placeholder:text-[var(--pt-text-faint)] outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-[var(--pt-border)]">
            <button
              onClick={() => setTab('public')}
              className={`flex-1 text-[11px] py-1.5 font-medium transition-colors ${
                tab === 'public'
                  ? 'text-[var(--pt-accent)] border-b-2 border-[var(--pt-accent)]'
                  : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setTab('mine')}
              className={`flex-1 text-[11px] py-1.5 font-medium transition-colors ${
                tab === 'mine'
                  ? 'text-[var(--pt-accent)] border-b-2 border-[var(--pt-accent)]'
                  : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]'
              }`}
            >
              My Presets
            </button>
          </div>

          {/* Preset list */}
          <div className="max-h-64 overflow-y-auto panel-scroll">
            {!isLoggedIn && tab === 'mine' ? (
              <div className="p-4 text-center text-xs text-[var(--pt-text-muted)]">
                Log in to see your presets
              </div>
            ) : isPending ? (
              <div className="p-4 text-center text-xs text-[var(--pt-text-muted)]">
                Loading...
              </div>
            ) : presets.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--pt-text-muted)]">
                {search ? 'No presets found' : 'No presets yet'}
              </div>
            ) : (
              presets.map((preset) => {
                const colors = PREVIEW_STEPS.map(
                  (step) => preset.themeData?.light?.[step] ?? '#888888',
                )
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelect(preset)}
                    className="w-full text-left px-2.5 py-2 flex items-center gap-2.5 hover:bg-[var(--pt-surface-hover)] transition-colors"
                  >
                    {/* Color preview strip */}
                    <div className="flex gap-px rounded overflow-hidden flex-shrink-0">
                      {colors.map((c, i) => (
                        <div key={i} className="w-3.5 h-3.5" style={{ background: c }} />
                      ))}
                    </div>

                    {/* Name + description */}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-[var(--pt-text)] block truncate">
                        {preset.name}
                      </span>
                      {preset.description && (
                        <span className="text-[10px] text-[var(--pt-text-faint)] block truncate">
                          {preset.description}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {preset.ratingCount > 0 && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-[var(--pt-text-muted)]">
                          {preset.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
