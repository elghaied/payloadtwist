'use client'

import { useState, useMemo, useCallback } from 'react'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { mapPaletteToTheme } from '@/payload-theme/palette-mapper'
import { THEME_PRESETS } from '@/payload-theme/presets'
import { getDefaultTheme } from '@/payload-theme/config'
import { ColorPopover } from '@/components/controls'

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

  const presetPreviews = useMemo(() => {
    const defaults = getDefaultTheme()
    return THEME_PRESETS.map((preset) => {
      const config = preset.palette ? mapPaletteToTheme(preset.palette) : { light: defaults.light }
      const colors = PREVIEW_STEPS.map((step) => config.light[step] ?? '#888888')
      return { id: preset.id, colors }
    })
  }, [])

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
        <p className="text-[10px] uppercase tracking-wider text-[#78726C] mb-2 font-medium">Theme Preset</p>
        <div className="flex gap-2 overflow-x-auto pb-1 panel-scroll">
          {THEME_PRESETS.map((preset, idx) => {
            const preview = presetPreviews[idx]
            const isActive = activePresetId === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={`flex-shrink-0 rounded-lg p-1.5 transition-all active:scale-[0.97] ${
                  isActive
                    ? 'ring-2 ring-[#5B6CF0] bg-white'
                    : 'bg-[#F8F7F5] hover:bg-white ring-1 ring-[#E5E2DC] hover:ring-[#CCC8C2]'
                }`}
                title={preset.description}
              >
                <div className="flex gap-px rounded overflow-hidden mb-1.5">
                  {preview.colors.map((color, i) => (
                    <div key={i} className="w-4 h-5" style={{ background: color }} />
                  ))}
                </div>
                <span className="text-[10px] text-[#78726C] block text-center leading-none">
                  {preset.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom palette */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[#78726C] mb-2 font-medium">Custom Palette</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ColorPopover
                value={neutral}
                onChange={setNeutral}
                label="Neutral Base"
                swatchSize="sm"
              />
              <span className="text-[10px] text-[#78726C]">Neutral</span>
            </div>

            <div className="w-px h-5 bg-[#E5E2DC]" />

            <button
              type="button"
              role="switch"
              aria-checked={accentEnabled}
              onClick={() => setAccentEnabled(!accentEnabled)}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <div
                className={`w-7 h-4 rounded-full relative transition-colors ${
                  accentEnabled ? 'bg-[#5B6CF0]' : 'bg-[#E5E2DC]'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                    accentEnabled ? 'translate-x-3' : ''
                  }`}
                />
              </div>
              <span className="text-[10px] text-[#78726C]">Accent</span>
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
            className="w-full text-xs py-1.5 rounded bg-[#5B6CF0] hover:bg-[#4A5AD9] text-white font-medium transition-colors active:scale-[0.97]"
          >
            Apply Custom Palette
          </button>
        </div>
      </div>
    </div>
  )
}
