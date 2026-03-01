'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

import { ColorPicker } from './ColorPicker'
import { ColorWheel } from './ColorWheel'
import { LightnessSlider } from './LightnessSlider'
import { ScrubberInput } from './ScrubberInput'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PayloadThemeConfig } from '@/payload-theme/types'
import { generateBaseScale, hexToHsl, hslToHex } from '@/payload-theme/scale-generator'

type AnchorKey = 'lightest' | 'mid' | 'darkest'

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

const BASE_STEPS = [0, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 950, 1000]

function getStepVar(step: number): string {
  return `--color-base-${step}`
}

function getAnchor(config: PayloadThemeConfig, step: number): string {
  return config.light[getStepVar(step)] ?? '#888888'
}

function isDarkColor(hex: string): boolean {
  const [, , l] = hexToHsl(hex)
  return l < 50
}

interface BaseScaleEditorProps {
  config: PayloadThemeConfig
  setBaseScale: (vars: Record<string, string>) => void
  setVariable: (varName: string, value: string, mode: 'light' | 'dark') => void
}

export function BaseScaleEditor({ config, setBaseScale, setVariable }: BaseScaleEditorProps) {
  const [lightest, setLightest] = useState(() => getAnchor(config, 0))
  const [mid, setMid] = useState(() => getAnchor(config, 500))
  const [darkest, setDarkest] = useState(() => getAnchor(config, 1000))

  const [selectedAnchor, setSelectedAnchor] = useState<AnchorKey>('mid')
  const [linked, setLinked] = useState(true)
  const [hexInputs, setHexInputs] = useState({ lightest, mid: mid, darkest })

  const [overrides, setOverrides] = useState<Record<string, string>>({})

  useEffect(() => {
    const l = getAnchor(config, 0)
    const m = getAnchor(config, 500)
    const d = getAnchor(config, 1000)
    setLightest(l)
    setMid(m)
    setDarkest(d)
    setHexInputs({ lightest: l, mid: m, darkest: d })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.light['--color-base-0'],
    config.light['--color-base-500'],
    config.light['--color-base-1000'],
  ])

  const applyScale = useCallback(
    (l: string, m: string, d: string, currentOverrides: Record<string, string>) => {
      const generated = generateBaseScale(l, m, d)
      const merged: Record<string, string> = {}
      for (const step of BASE_STEPS) {
        const varName = getStepVar(step)
        merged[varName] =
          varName in currentOverrides ? currentOverrides[varName] : generated[varName]
      }
      setBaseScale(merged)
    },
    [setBaseScale],
  )

  // Shared helper: update an anchor by key with a hex value
  const updateAnchor = useCallback(
    (anchor: AnchorKey, value: string) => {
      const next = {
        lightest: anchor === 'lightest' ? value : lightest,
        mid: anchor === 'mid' ? value : mid,
        darkest: anchor === 'darkest' ? value : darkest,
      }
      if (anchor === 'lightest') { setLightest(value); setHexInputs((prev) => ({ ...prev, lightest: value })) }
      if (anchor === 'mid') { setMid(value); setHexInputs((prev) => ({ ...prev, mid: value })) }
      if (anchor === 'darkest') { setDarkest(value); setHexInputs((prev) => ({ ...prev, darkest: value })) }
      applyScale(next.lightest, next.mid, next.darkest, overrides)
    },
    [lightest, mid, darkest, overrides, applyScale],
  )

  // Handle hue change from wheel — combine new hue with existing S/L
  const handleHueChange = useCallback(
    (anchor: AnchorKey, hue: number) => {
      const current = anchor === 'lightest' ? lightest : anchor === 'mid' ? mid : darkest
      const [, s, l] = hexToHsl(current)
      updateAnchor(anchor, hslToHex(hue, s, l))
    },
    [lightest, mid, darkest, updateAnchor],
  )

  // HSL of the currently selected anchor (DRY helper)
  const selectedHSL = useMemo(() => {
    const hex = selectedAnchor === 'lightest' ? lightest : selectedAnchor === 'mid' ? mid : darkest
    return hexToHsl(hex)
  }, [selectedAnchor, lightest, mid, darkest])

  // Handle saturation change from scrubber
  const handleSaturationChange = useCallback(
    (sat: number) => {
      const [h, , l] = selectedHSL
      updateAnchor(selectedAnchor, hslToHex(h, sat, l))
    },
    [selectedHSL, selectedAnchor, updateAnchor],
  )

  const handleSwatchOverride = useCallback(
    (step: number, value: string) => {
      const varName = getStepVar(step)
      setOverrides((prev) => ({ ...prev, [varName]: value }))
      setVariable(varName, value, 'light')
    },
    [setVariable],
  )

  const handleSwatchReset = useCallback(
    (step: number) => {
      const varName = getStepVar(step)
      setOverrides((prev) => {
        const next = { ...prev }
        delete next[varName]
        return next
      })
      const generated = generateBaseScale(lightest, mid, darkest)
      setVariable(varName, generated[varName], 'light')
    },
    [lightest, mid, darkest, setVariable],
  )

  return (
    <div className="space-y-4">
      {/* Color wheel + lightness slider + saturation scrubber */}
      <div className="flex gap-3 items-start justify-center">
        <ColorWheel
          anchors={{ lightest, mid, darkest }}
          onHueChange={handleHueChange}
          selectedAnchor={selectedAnchor}
          onSelectAnchor={setSelectedAnchor}
          linked={linked}
          onLinkedChange={setLinked}
          size={240}
        />
        <div className="flex flex-col items-center gap-3">
          <LightnessSlider
            hue={selectedHSL[0]}
            saturation={selectedHSL[1]}
            lightness={selectedHSL[2]}
            onChange={(l) => {
              const [h, s] = selectedHSL
              updateAnchor(selectedAnchor, hslToHex(h, s, l))
            }}
            height={240}
          />
          <ScrubberInput
            value={Math.round(selectedHSL[1])}
            onChange={handleSaturationChange}
            min={0}
            max={100}
            step={1}
            unit="%"
            label="Sat"
          />
        </div>
      </div>

      {/* Hex inputs for direct value entry */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { key: 'lightest' as AnchorKey, label: 'Lightest' },
          { key: 'mid' as AnchorKey, label: 'Midpoint' },
          { key: 'darkest' as AnchorKey, label: 'Darkest' },
        ] as const).map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</label>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded border flex-shrink-0 cursor-pointer ${
                  selectedAnchor === key ? 'border-blue-500' : 'border-zinc-600'
                }`}
                style={{ background: key === 'lightest' ? lightest : key === 'mid' ? mid : darkest }}
                onClick={() => setSelectedAnchor(key)}
              />
              <input
                type="text"
                value={hexInputs[key]}
                onChange={(e) => {
                  const raw = e.target.value
                  setHexInputs((prev) => ({ ...prev, [key]: raw }))
                  if (isValidHex(raw)) {
                    updateAnchor(key, raw)
                  }
                }}
                onFocus={() => setSelectedAnchor(key)}
                className="flex-1 text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 font-mono min-w-0"
                spellCheck={false}
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 16-step swatch strip */}
      <div>
        <p className="text-xs text-zinc-500 mb-2">Scale steps — click to override individually</p>
        <div className="flex gap-0.5">
          {BASE_STEPS.map((step) => {
            const varName = getStepVar(step)
            const color = config.light[varName] ?? '#888888'
            const isOverridden = varName in overrides
            const dark = isDarkColor(color)

            return (
              <Popover key={step}>
                <PopoverTrigger asChild>
                  <button
                    className="flex-1 h-10 rounded-sm border border-transparent hover:border-zinc-400 transition-colors relative flex items-end justify-center pb-0.5"
                    style={{ background: color }}
                    title={`${varName}: ${color}`}
                  >
                    {isOverridden && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white' : 'bg-zinc-800'} opacity-75`}
                      />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-52 p-3 bg-zinc-900 border-zinc-700 text-zinc-100"
                  sideOffset={6}
                >
                  <p className="text-xs text-zinc-400 mb-2 font-mono">{varName}</p>
                  <ColorPicker
                    value={color}
                    onChange={(hex) => handleSwatchOverride(step, hex)}
                    label={varName}
                  />
                  {isOverridden && (
                    <button
                      onClick={() => handleSwatchReset(step)}
                      className="mt-2 w-full text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded px-2 py-1 transition-colors"
                    >
                      Reset to scale
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            )
          })}
        </div>
        {/* Step labels */}
        <div className="flex gap-0.5 mt-0.5">
          {BASE_STEPS.map((step) => (
            <div key={step} className="flex-1 text-center">
              <span className="text-[9px] text-zinc-600">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
