'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { mapPaletteToTheme } from '@/payload-theme/palette-mapper'
import { THEME_PRESETS, PRESET_GROUPS } from '@/payload-theme/presets'
import { getDefaultTheme } from '@/payload-theme/config'
import { ColorPopover } from '@/components/controls'

interface PaletteSelectorProps {
  onApply: (config: PayloadThemeConfig) => void
  onReset: () => void
}

const PREVIEW_STEPS = ['--color-base-0', '--color-base-200', '--color-base-500', '--color-base-800', '--color-base-1000'] as const

function PreviewStrip({ colors, className = '' }: { colors: string[]; className?: string }) {
  return (
    <div className={`flex gap-px rounded overflow-hidden ${className}`}>
      {colors.map((color, i) => (
        <div key={i} className="w-4 h-4" style={{ background: color }} />
      ))}
    </div>
  )
}

export function PaletteSelector({ onApply, onReset }: PaletteSelectorProps) {
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [neutral, setNeutral] = useState('#71717a')
  const [accent, setAccent] = useState('#3b82f6')
  const [accentEnabled, setAccentEnabled] = useState(false)
  const [applyFlash, setApplyFlash] = useState(false)

  const presetPreviews = useMemo(() => {
    const defaults = getDefaultTheme()
    const map: Record<string, string[]> = {}
    for (const preset of THEME_PRESETS) {
      const config = preset.palette ? mapPaletteToTheme(preset.palette) : { light: defaults.light }
      map[preset.id] = PREVIEW_STEPS.map((step) => config.light[step] ?? '#888888')
    }
    return map
  }, [])

  const customPreview = useMemo(() => {
    const config = mapPaletteToTheme({
      neutral,
      accent: accentEnabled ? accent : undefined,
    })
    return PREVIEW_STEPS.map((step) => config.light[step] ?? '#888888')
  }, [neutral, accent, accentEnabled])

  const activePreset = THEME_PRESETS.find((p) => p.id === activePresetId)
  const activeColors = activePresetId ? presetPreviews[activePresetId] : null

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

  const handlePresetClick = useCallback(
    (preset: (typeof THEME_PRESETS)[number]) => {
      setActivePresetId(preset.id)
      setIsOpen(false)
      if (preset.palette) {
        onApply(mapPaletteToTheme(preset.palette))
      } else {
        onReset()
      }
    },
    [onApply, onReset],
  )

  const handleCustomApply = useCallback(() => {
    setActivePresetId(null)
    const config = mapPaletteToTheme({
      neutral,
      accent: accentEnabled ? accent : undefined,
    })
    onApply(config)
    setApplyFlash(true)
    setTimeout(() => setApplyFlash(false), 500)
  }, [neutral, accent, accentEnabled, onApply])

  return (
    <div className="space-y-4">
      {/* Preset dropdown */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] mb-2 font-medium">Color Preset</p>

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded hover:border-[var(--pt-border-strong)] transition-colors text-left focus-visible:ring-1 focus-visible:ring-[var(--pt-accent)] focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {activeColors && <PreviewStrip colors={activeColors} />}
              <span className="text-[var(--pt-text)] truncate">
                {activePreset?.name ?? 'Select a preset'}
              </span>
              {activePreset && (
                <span className="text-[10px] text-[var(--pt-text-faint)] truncate hidden sm:inline">
                  {activePreset.description}
                </span>
              )}
            </div>
            <ChevronDown
              size={12}
              className={`text-[var(--pt-text-muted)] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--pt-surface)] border border-[var(--pt-border)] rounded-lg shadow-lg max-h-72 overflow-y-auto panel-scroll">
              {PRESET_GROUPS.map((group) => {
                const groupPresets = THEME_PRESETS.filter((p) => p.group === group.id)
                if (groupPresets.length === 0) return null
                return (
                  <div key={group.id}>
                    <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] bg-[var(--pt-bg)] sticky top-0 font-medium">
                      {group.label}
                    </div>
                    {groupPresets.map((preset) => {
                      const colors = presetPreviews[preset.id]
                      const isActive = activePresetId === preset.id
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetClick(preset)}
                          className={`w-full text-left px-2.5 py-2 flex items-center gap-2.5 hover:bg-[var(--pt-surface-hover)] transition-colors ${
                            isActive ? 'bg-[var(--pt-surface-hover)]/60' : ''
                          }`}
                        >
                          <PreviewStrip colors={colors} />
                          <div className="min-w-0">
                            <span className={`text-xs block ${isActive ? 'text-[var(--pt-accent)] font-medium' : 'text-[var(--pt-text)]'}`}>
                              {preset.name}
                            </span>
                            <span className="text-[10px] text-[var(--pt-text-faint)] block truncate">
                              {preset.description}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom palette */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] mb-2 font-medium">Custom Palette</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ColorPopover
                value={neutral}
                onChange={setNeutral}
                label="Neutral Base"
                swatchSize="sm"
              />
              <span className="text-[10px] text-[var(--pt-text-muted)]">Neutral</span>
            </div>

            <div className="w-px h-5 bg-[var(--pt-border)]" />

            <button
              type="button"
              role="switch"
              aria-checked={accentEnabled}
              onClick={() => setAccentEnabled(!accentEnabled)}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <div
                className={`w-7 h-4 rounded-full relative transition-colors ${
                  accentEnabled ? 'bg-[var(--pt-accent)]' : 'bg-[var(--pt-border)]'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                    accentEnabled ? 'translate-x-3' : ''
                  }`}
                />
              </div>
              <span className="text-[10px] text-[var(--pt-text-muted)]">Accent</span>
            </button>

            {accentEnabled && (
              <ColorPopover
                value={accent}
                onChange={setAccent}
                label="Accent Color"
                swatchSize="sm"
              />
            )}
          </div>

          <div
            className={`flex gap-px rounded overflow-hidden transition-opacity ${
              applyFlash ? 'opacity-60' : 'opacity-100'
            }`}
          >
            {customPreview.map((color, i) => (
              <div key={i} className="flex-1 h-5" style={{ background: color }} />
            ))}
          </div>

          <button
            onClick={handleCustomApply}
            className="w-full text-xs py-1.5 rounded bg-[var(--pt-accent)] hover:bg-[var(--pt-accent-hover)] text-white font-medium transition-colors active:scale-[0.97]"
          >
            Apply Custom Palette
          </button>
        </div>
      </div>
    </div>
  )
}
