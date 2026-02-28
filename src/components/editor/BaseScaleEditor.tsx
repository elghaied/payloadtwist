'use client'

import { useState, useCallback, useEffect } from 'react'

import { ColorPicker } from './ColorPicker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PayloadThemeConfig } from '@/payload-theme/types'
import { generateBaseScale, hexToHsl } from '@/payload-theme/scale-generator'

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
  // Local state for anchor colors so the pickers feel instantaneous.
  // Synced from config on external changes (undo/redo/reset) via useEffect.
  const [lightest, setLightest] = useState(() => getAnchor(config, 0))
  const [mid, setMid] = useState(() => getAnchor(config, 500))
  const [darkest, setDarkest] = useState(() => getAnchor(config, 1000))

  const [overrides, setOverrides] = useState<Record<string, string>>({})

  // Sync anchor pickers when config changes externally (undo/redo/reset).
  // Safe with uncontrolled ColorPicker — no onChange feedback loop.
  // After our own setBaseScale call, step-0/500/1000 values equal the HSL
  // round-trip of the anchor (exact for these t=0/t=1 endpoints), so React
  // bails out of the setState call with no extra render.
  useEffect(() => {
    setLightest(getAnchor(config, 0))
    setMid(getAnchor(config, 500))
    setDarkest(getAnchor(config, 1000))
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

  const handleAnchorChange = useCallback(
    (anchor: 'lightest' | 'mid' | 'darkest', value: string) => {
      const next = {
        lightest: anchor === 'lightest' ? value : lightest,
        mid: anchor === 'mid' ? value : mid,
        darkest: anchor === 'darkest' ? value : darkest,
      }
      if (anchor === 'lightest') setLightest(value)
      if (anchor === 'mid') setMid(value)
      if (anchor === 'darkest') setDarkest(value)
      applyScale(next.lightest, next.mid, next.darkest, overrides)
    },
    [lightest, mid, darkest, overrides, applyScale],
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
      {/* Anchor pickers */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'lightest' as const, label: 'Lightest', value: lightest },
          { key: 'mid' as const, label: 'Midpoint', value: mid },
          { key: 'darkest' as const, label: 'Darkest', value: darkest },
        ].map(({ key, label, value }) => (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <ColorPicker
              value={value}
              onChange={(hex) => handleAnchorChange(key, hex)}
              label={label}
            />
            <span className="text-xs text-zinc-400">{label}</span>
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
