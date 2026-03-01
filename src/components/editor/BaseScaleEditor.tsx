'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

import { ColorPopover, ScaleStrip } from '@/components/controls'
import { ColorWheel } from './ColorWheel'
import { LightnessSlider } from './LightnessSlider'
import { ScrubberInput } from './ScrubberInput'
import { PayloadThemeConfig } from '@/payload-theme/types'
import { generateBaseScale, hexToHsl, hslToHex } from '@/payload-theme/scale-generator'

type AnchorKey = 'lightest' | 'mid' | 'darkest'

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

const BASE_STEPS = [0, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 950, 1000]
const ANCHOR_STEPS = new Set([0, 500, 1000])

function getStepVar(step: number): string {
  return `--color-base-${step}`
}

function getAnchor(config: PayloadThemeConfig, step: number): string {
  return config.light[getStepVar(step)] ?? '#888888'
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

  const handleHueChange = useCallback(
    (anchor: AnchorKey, hue: number) => {
      const current = anchor === 'lightest' ? lightest : anchor === 'mid' ? mid : darkest
      const [, s, l] = hexToHsl(current)
      updateAnchor(anchor, hslToHex(hue, s, l))
    },
    [lightest, mid, darkest, updateAnchor],
  )

  const selectedHSL = useMemo(() => {
    const hex = selectedAnchor === 'lightest' ? lightest : selectedAnchor === 'mid' ? mid : darkest
    return hexToHsl(hex)
  }, [selectedAnchor, lightest, mid, darkest])

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

  // Build steps for ScaleStrip
  const generated = useMemo(() => generateBaseScale(lightest, mid, darkest), [lightest, mid, darkest])
  const scaleSteps = useMemo(
    () =>
      BASE_STEPS.map((step) => {
        const varName = getStepVar(step)
        return {
          step,
          color: config.light[varName] ?? '#888888',
          isOverridden: varName in overrides,
          isAnchor: ANCHOR_STEPS.has(step),
          defaultColor: generated[varName],
        }
      }),
    [config.light, overrides, generated],
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
            <label className="text-[10px] uppercase tracking-wider text-[#78726C] font-medium">{label}</label>
            <div className="flex items-center gap-1.5">
              <ColorPopover
                value={key === 'lightest' ? lightest : key === 'mid' ? mid : darkest}
                onChange={(hex) => updateAnchor(key, hex)}
                label={label}
                swatchSize="sm"
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
                className="flex-1 text-xs bg-[#F8F7F5] border border-[#E5E2DC] rounded px-2 py-1 text-[#1C1917] font-mono min-w-0 focus:outline-none focus:border-[#5B6CF0]"
                spellCheck={false}
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 16-step swatch strip */}
      <div>
        <p className="text-[10px] text-[#78726C] mb-2">Scale steps — click to override individually</p>
        <ScaleStrip
          steps={scaleSteps}
          onStepChange={handleSwatchOverride}
          onStepReset={handleSwatchReset}
        />
      </div>
    </div>
  )
}
