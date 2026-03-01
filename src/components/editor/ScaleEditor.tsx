'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ScaleWheel, type ScalePoint } from './ScaleWheel'
import { LightnessSlider } from './LightnessSlider'
import { ScrubberInput } from './ScrubberInput'
import { ColorPopover, ScaleStrip } from '@/components/controls'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { generateBaseScaleFromAnchors, hexToHsl, hslToHex } from '@/payload-theme/scale-generator'
import { deriveDarkVarsFromScale } from '@/payload-theme/palette-mapper'
import { getDefaultTheme } from '@/payload-theme/config'
import { Plus, Minus } from 'lucide-react'

const BASE_STEPS = [0, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 950, 1000]

function getStepVar(step: number): string {
  return `--color-base-${step}`
}

function distributeSteps(count: number): number[] {
  if (count <= 1) return [500]
  return Array.from({ length: count }, (_, i) => Math.round((i / (count - 1)) * 1000))
}

let nextId = 1
function makeId(): string {
  return `sp${nextId++}`
}

function createDefaultPoints(): ScalePoint[] {
  return [
    { id: makeId(), hue: 210, saturation: 15, lightness: 95, label: 'Lightest' },
    { id: makeId(), hue: 210, saturation: 10, lightness: 50, label: 'Midpoint' },
    { id: makeId(), hue: 210, saturation: 15, lightness: 10, label: 'Darkest' },
  ]
}

function pointsToScale(pts: ScalePoint[]): Record<string, string> {
  const steps = distributeSteps(pts.length)
  const anchors = pts.map((p, i) => ({
    step: steps[i],
    color: hslToHex(p.hue, p.saturation, p.lightness),
  }))
  return generateBaseScaleFromAnchors(anchors)
}

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

// Derive points from existing config (on undo/redo/preset)
function derivePointsFromConfig(config: PayloadThemeConfig): ScalePoint[] {
  const base0 = config.light['--color-base-0']
  const base500 = config.light['--color-base-500']
  const base1000 = config.light['--color-base-1000']

  if (!base0 || !base500 || !base1000) return createDefaultPoints()

  const [h0, s0, l0] = hexToHsl(base0)
  const [hm, sm, lm] = hexToHsl(base500)
  const [h1, s1, l1] = hexToHsl(base1000)

  return [
    { id: makeId(), hue: h0, saturation: s0, lightness: l0, label: 'Lightest' },
    { id: makeId(), hue: hm, saturation: sm, lightness: lm, label: 'Midpoint' },
    { id: makeId(), hue: h1, saturation: s1, lightness: l1, label: 'Darkest' },
  ]
}

interface ScaleEditorProps {
  config: PayloadThemeConfig
  importTheme: (config: PayloadThemeConfig) => void
  setBaseScale: (vars: Record<string, string>) => void
  setVariable: (varName: string, value: string, mode: 'light' | 'dark') => void
}

export function ScaleEditor({ config, importTheme, setBaseScale, setVariable }: ScaleEditorProps) {
  const [points, setPoints] = useState<ScalePoint[]>(createDefaultPoints)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [linked, setLinked] = useState(true)
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [hexInput, setHexInput] = useState('')

  // Refs for stable callback access
  const importThemeRef = useRef(importTheme)
  importThemeRef.current = importTheme
  const setBaseScaleRef = useRef(setBaseScale)
  setBaseScaleRef.current = setBaseScale

  // Deferred setBaseScale via ref + effect (lighter than importTheme)
  const pendingScaleVars = useRef<Record<string, string> | null>(null)

  useEffect(() => {
    if (pendingScaleVars.current) {
      setBaseScaleRef.current(pendingScaleVars.current)
      pendingScaleVars.current = null
    }
  })

  // Debounced dark-var update via importTheme (200ms after last scale change)
  const darkDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Set-based fingerprint tracking:
  // pendingFpsRef tracks fingerprints of scale updates WE initiated.
  // When the config sync effect fires, if the fingerprint is in the set,
  // we know it's our own change and skip re-deriving points.
  const pendingFpsRef = useRef<Set<string>>(new Set())

  function scaleFingerprint(light: Record<string, string>): string {
    return `${light['--color-base-0']}|${light['--color-base-500']}|${light['--color-base-1000']}`
  }

  // Compute the current scale fingerprint during render so the effect
  // only fires when base-scale values actually change (not every config mutation).
  const currentScaleFp = scaleFingerprint(config.light)

  useEffect(() => {
    // Check if this fingerprint was caused by our own applyScale
    if (pendingFpsRef.current.has(currentScaleFp)) {
      pendingFpsRef.current.delete(currentScaleFp)
      return // Our own update — don't re-derive points
    }
    // External change (undo/redo/preset) — sync points from config
    const derived = derivePointsFromConfig(config)
    setPoints(derived)
    setSelectedId(derived.length > 1 ? derived[1].id : derived[0]?.id ?? null)
    setOverrides({})
  }, [currentScaleFp]) // eslint-disable-line react-hooks/exhaustive-deps

  const applyScale = useCallback(
    (pts: ScalePoint[], currentOverrides: Record<string, string>) => {
      const generated = pointsToScale(pts)
      const merged: Record<string, string> = {}
      for (const step of BASE_STEPS) {
        const varName = getStepVar(step)
        merged[varName] = varName in currentOverrides ? currentOverrides[varName] : generated[varName]
      }

      // Track this fingerprint so config sync knows to skip it
      const newLight = { ...config.light, ...merged }
      pendingFpsRef.current.add(scaleFingerprint(newLight))

      // Light vars: deferred setBaseScale (lightweight, with history coalescing)
      pendingScaleVars.current = merged

      // Dark vars: debounced importTheme (200ms trailing — updates --theme-bg etc.)
      clearTimeout(darkDebounceRef.current)
      darkDebounceRef.current = setTimeout(() => {
        const defaults = getDefaultTheme()
        const darkVars = deriveDarkVarsFromScale(merged)
        importThemeRef.current({
          ...config,
          light: { ...config.light, ...merged },
          dark: { ...defaults.dark, ...darkVars },
        })
      }, 200)
    },
    [config],
  )

  const selectedPoint = useMemo(
    () => points.find(p => p.id === selectedId) ?? null,
    [points, selectedId],
  )

  // Sync hex input when selection changes
  useEffect(() => {
    if (selectedPoint) {
      setHexInput(hslToHex(selectedPoint.hue, selectedPoint.saturation, selectedPoint.lightness))
    }
  }, [selectedPoint])

  const handlePointChange = useCallback(
    (id: string, hue: number, saturation: number) => {
      setPoints(prev => {
        const next = prev.map(p => p.id === id ? { ...p, hue, saturation } : p)
        applyScale(next, overrides)
        return next
      })
    },
    [applyScale, overrides],
  )

  const handlePointsChange = useCallback(
    (updates: Array<{ id: string; hue: number; saturation: number }>) => {
      setPoints(prev => {
        const updateMap = new Map(updates.map(u => [u.id, u]))
        const next = prev.map(p => {
          const u = updateMap.get(p.id)
          return u ? { ...p, hue: u.hue, saturation: u.saturation } : p
        })
        applyScale(next, overrides)
        return next
      })
    },
    [applyScale, overrides],
  )

  const handleLightnessChange = useCallback(
    (l: number) => {
      if (!selectedId) return
      setPoints(prev => {
        const next = prev.map(p => p.id === selectedId ? { ...p, lightness: l } : p)
        applyScale(next, overrides)
        return next
      })
    },
    [selectedId, applyScale, overrides],
  )

  const handleSaturationChange = useCallback(
    (sat: number) => {
      if (!selectedId) return
      setPoints(prev => {
        const next = prev.map(p => p.id === selectedId ? { ...p, saturation: sat } : p)
        applyScale(next, overrides)
        return next
      })
    },
    [selectedId, applyScale, overrides],
  )

  const handleColorPopoverChange = useCallback(
    (hex: string) => {
      if (!selectedId) return
      const [h, s, l] = hexToHsl(hex)
      setPoints(prev => {
        const next = prev.map(p => p.id === selectedId ? { ...p, hue: h, saturation: s, lightness: l } : p)
        applyScale(next, overrides)
        return next
      })
      setHexInput(hex)
    },
    [selectedId, applyScale, overrides],
  )

  const handleHexInputChange = useCallback(
    (raw: string) => {
      setHexInput(raw)
      if (!selectedId || !isValidHex(raw)) return
      const [h, s, l] = hexToHsl(raw)
      setPoints(prev => {
        const next = prev.map(p => p.id === selectedId ? { ...p, hue: h, saturation: s, lightness: l } : p)
        applyScale(next, overrides)
        return next
      })
    },
    [selectedId, applyScale, overrides],
  )

  const addPoint = useCallback(() => {
    setPoints(prev => {
      const next = [...prev, { id: makeId(), hue: 180, saturation: 50, lightness: 50 }]
      applyScale(next, overrides)
      return next
    })
  }, [applyScale, overrides])

  const removePoint = useCallback(() => {
    if (!selectedId || points.length <= 2) return
    setPoints(prev => {
      const next = prev.filter(p => p.id !== selectedId)
      applyScale(next, overrides)
      return next
    })
    setSelectedId(null)
  }, [selectedId, points.length, applyScale, overrides])

  const handleSwatchOverride = useCallback(
    (step: number, value: string) => {
      const varName = getStepVar(step)
      setOverrides(prev => ({ ...prev, [varName]: value }))
      setVariable(varName, value, 'light')
    },
    [setVariable],
  )

  const handleSwatchReset = useCallback(
    (step: number) => {
      const varName = getStepVar(step)
      setOverrides(prev => {
        const next = { ...prev }
        delete next[varName]
        return next
      })
      const generated = pointsToScale(points)
      setVariable(varName, generated[varName], 'light')
    },
    [points, setVariable],
  )

  // Build steps for ScaleStrip
  const generated = useMemo(() => pointsToScale(points), [points])
  const scaleSteps = useMemo(
    () =>
      BASE_STEPS.map((step) => {
        const varName = getStepVar(step)
        return {
          step,
          color: config.light[varName] ?? '#888888',
          isOverridden: varName in overrides,
          isAnchor: false,
          defaultColor: generated[varName],
        }
      }),
    [config.light, overrides, generated],
  )

  return (
    <div className="space-y-4">
      {/* Wheel + lightness slider + saturation scrubber */}
      <div className="flex gap-3 items-start justify-center">
        <ScaleWheel
          points={points}
          selectedId={selectedId}
          onSelectPoint={setSelectedId}
          onPointChange={handlePointChange}
          onPointsChange={handlePointsChange}
          linked={linked}
          onLinkedChange={setLinked}
          size={240}
        />
        {selectedPoint && (
          <div className="flex flex-col items-center gap-3">
            <LightnessSlider
              hue={selectedPoint.hue}
              saturation={selectedPoint.saturation}
              lightness={selectedPoint.lightness}
              onChange={handleLightnessChange}
              height={240}
            />
            <ScrubberInput
              value={Math.round(selectedPoint.saturation)}
              onChange={handleSaturationChange}
              min={0}
              max={100}
              step={1}
              unit="%"
              label="Sat"
            />
          </div>
        )}
      </div>

      {/* Add/remove controls */}
      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={addPoint}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-[#78726C] bg-[#F0EDE8] hover:bg-[#E5E2DC] hover:text-[#1C1917] transition-colors font-medium"
        >
          <Plus size={12} />
          Add point
        </button>
        <button
          onClick={removePoint}
          disabled={!selectedId || points.length <= 2}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-[#78726C] bg-[#F0EDE8] hover:bg-[#E5E2DC] hover:text-[#1C1917] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
        >
          <Minus size={12} />
          Remove
        </button>
        <span className="text-[10px] text-[#78726C] ml-1">{points.length} points</span>
      </div>

      {/* Selected point: color popover + hex input + label */}
      {selectedPoint && (
        <div className="flex items-center gap-2">
          <ColorPopover
            value={hslToHex(selectedPoint.hue, selectedPoint.saturation, selectedPoint.lightness)}
            onChange={handleColorPopoverChange}
            label={selectedPoint.label ?? 'Point'}
            swatchSize="sm"
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInputChange(e.target.value)}
            className="flex-1 text-xs bg-[#F8F7F5] border border-[#E5E2DC] rounded px-2 py-1 text-[#1C1917] font-mono min-w-0 focus:outline-none focus:border-[#5B6CF0]"
            spellCheck={false}
            placeholder="#000000"
          />
          {selectedPoint.label && (
            <span className="text-[10px] uppercase tracking-wider text-[#78726C] font-medium">
              {selectedPoint.label}
            </span>
          )}
        </div>
      )}

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
