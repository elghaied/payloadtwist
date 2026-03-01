'use client'

import { useState, useMemo, useCallback } from 'react'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { mapPaletteToTheme } from '@/payload-theme/palette-mapper'
import { THEME_PRESETS } from '@/payload-theme/presets'
import { getDefaultTheme } from '@/payload-theme/config'
import { ColorPicker } from './ColorPicker'

interface PaletteSelectorProps {
  onApply: (config: PayloadThemeConfig) => void
  onReset: () => void
}

const PREVIEW_STEPS = ['--color-base-0', '--color-base-200', '--color-base-500', '--color-base-800', '--color-base-1000'] as const

export function PaletteSelector({ onApply, onReset }: PaletteSelectorProps) {
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [neutral, setNeutral] = useState('#71717a')
  const [accent, setAccent] = useState('#3b82f6')
  const [accentEnabled, setAccentEnabled] = useState(false)
  const [applyFlash, setApplyFlash] = useState(false)

  // Compute preview colors for all presets once (THEME_PRESETS is constant)
  const presetPreviews = useMemo(() => {
    const defaults = getDefaultTheme()
    return THEME_PRESETS.map((preset) => {
      const config = preset.palette ? mapPaletteToTheme(preset.palette) : { light: defaults.light }
      const colors = PREVIEW_STEPS.map((step) => config.light[step] ?? '#888888')
      return { id: preset.id, colors }
    })
  }, [])

  // Live preview strip for custom palette
  const customPreview = useMemo(() => {
    const config = mapPaletteToTheme({
      neutral,
      accent: accentEnabled ? accent : undefined,
    })
    return PREVIEW_STEPS.map((step) => config.light[step] ?? '#888888')
  }, [neutral, accent, accentEnabled])

  const handlePresetClick = useCallback(
    (preset: (typeof THEME_PRESETS)[number]) => {
      setActivePresetId(preset.id)
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
      {/* Preset row */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] uppercase tracking-widest text-zinc-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Theme Preset
          </span>
          <div className="flex-1 h-px bg-zinc-800/80" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {THEME_PRESETS.map((preset, idx) => {
            const preview = presetPreviews[idx]
            const isActive = activePresetId === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={`flex-shrink-0 rounded-lg p-1.5 transition-all ${
                  isActive
                    ? 'ring-2 ring-blue-500 bg-zinc-800'
                    : 'bg-zinc-800/50 hover:bg-zinc-800 ring-1 ring-zinc-700/50 hover:ring-zinc-600'
                }`}
                title={preset.description}
              >
                {/* Mini swatch strip */}
                <div className="flex gap-px rounded overflow-hidden mb-1.5">
                  {preview.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-5"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <span
                  className="text-[10px] text-zinc-400 block text-center leading-none"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {preset.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom palette */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] uppercase tracking-widest text-zinc-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Custom Palette
          </span>
          <div className="flex-1 h-px bg-zinc-800/80" />
        </div>

        <div className="space-y-3">
          {/* Neutral + Accent row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ColorPicker
                value={neutral}
                onChange={setNeutral}
                label="Neutral Base"
                size="sm"
              />
              <span
                className="text-[10px] text-zinc-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Neutral
              </span>
            </div>

            <div className="w-px h-5 bg-zinc-800" />

            <button
              type="button"
              role="switch"
              aria-checked={accentEnabled}
              onClick={() => setAccentEnabled(!accentEnabled)}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <div
                className={`w-7 h-4 rounded-full relative transition-colors ${
                  accentEnabled ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-zinc-300 transition-transform ${
                    accentEnabled ? 'translate-x-3' : ''
                  }`}
                />
              </div>
              <span
                className="text-[10px] text-zinc-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Accent
              </span>
            </button>

            {accentEnabled && (
              <ColorPicker
                value={accent}
                onChange={setAccent}
                label="Accent Color"
                size="sm"
              />
            )}
          </div>

          {/* Preview strip */}
          <div
            className={`flex gap-px rounded overflow-hidden transition-opacity ${
              applyFlash ? 'opacity-60' : 'opacity-100'
            }`}
          >
            {customPreview.map((color, i) => (
              <div
                key={i}
                className="flex-1 h-5"
                style={{ background: color }}
              />
            ))}
          </div>

          {/* Apply button */}
          <button
            onClick={handleCustomApply}
            className="w-full text-xs py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Apply Custom Palette
          </button>
        </div>
      </div>
    </div>
  )
}
