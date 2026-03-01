'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ScaleWheel, type ScalePoint } from './ScaleWheel'
import { LightnessSlider } from './LightnessSlider'
import { ScrubberInput } from './ScrubberInput'
import { ColorPopover, ScaleStrip } from '@/components/controls'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { generateBaseScaleFromAnchors, generateRandomScale, hexToHsl, hslToHex } from '@/payload-theme/scale-generator'
import { deriveDarkVarsFromScale } from '@/payload-theme/palette-mapper'
import { getDefaultTheme } from '@/payload-theme/config'
import { Plus, Minus, RotateCcw, Dices } from 'lucide-react'

const BASE_STEPS = [0, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 950, 1000]

function getStepVar(step: number): string {
  return `--color-base-${step}`
}

let nextId = 1
function makeId(): string {
  return `sp${nextId++}`
}

function createDefaultPoints(): ScalePoint[] {
  return [
    { id: makeId(), hue: 210, saturation: 15, lightness: 95, step: 0, label: 'Lightest' },
    { id: makeId(), hue: 210, saturation: 10, lightness: 50, step: 500, label: 'Midpoint' },
    { id: makeId(), hue: 210, saturation: 15, lightness: 10, step: 1000, label: 'Darkest' },
  ]
}

function pointsToScale(pts: ScalePoint[]): Record<string, string> {
  const anchors = pts.map(p => ({
    step: p.step,
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
    { id: makeId(), hue: h0, saturation: s0, lightness: l0, step: 0, label: 'Lightest' },
    { id: makeId(), hue: hm, saturation: sm, lightness: lm, step: 500, label: 'Midpoint' },
    { id: makeId(), hue: h1, saturation: s1, lightness: l1, step: 1000, label: 'Darkest' },
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
  const [hexInputs, setHexInputs] = useState<Record<string, string>>({})

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

  // Sync hex inputs when points change
  useEffect(() => {
    setHexInputs(prev => {
      const next = { ...prev }
      for (const p of points) {
        next[p.id] = hslToHex(p.hue, p.saturation, p.lightness)
      }
      return next
    })
  }, [points])

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
    (targetId: string, hex: string) => {
      const [h, s, l] = hexToHsl(hex)
      setPoints(prev => {
        const next = prev.map(p => p.id === targetId ? { ...p, hue: h, saturation: s, lightness: l } : p)
        applyScale(next, overrides)
        return next
      })
      setHexInputs(prev => ({ ...prev, [targetId]: hex }))
    },
    [applyScale, overrides],
  )

  const handleHexInputChange = useCallback(
    (targetId: string, raw: string) => {
      setHexInputs(prev => ({ ...prev, [targetId]: raw }))
      if (!isValidHex(raw)) return
      const [h, s, l] = hexToHsl(raw)
      setPoints(prev => {
        const next = prev.map(p => p.id === targetId ? { ...p, hue: h, saturation: s, lightness: l } : p)
        applyScale(next, overrides)
        return next
      })
    },
    [applyScale, overrides],
  )

  const STRUCTURAL_STEPS = [0, 500, 1000]

  // Find the step at midpoint of the largest gap between existing anchors
  const findBestNewStep = useCallback((pts: ScalePoint[]): number | null => {
    const usedSteps = new Set(pts.map(p => p.step))
    const available = BASE_STEPS.filter(s => !usedSteps.has(s))
    if (available.length === 0) return null

    const sorted = [...pts].sort((a, b) => a.step - b.step)
    let bestGapStart = sorted[0].step
    let bestGapEnd = sorted[0].step
    let bestGapSize = 0
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].step - sorted[i].step
      if (gap > bestGapSize) {
        bestGapSize = gap
        bestGapStart = sorted[i].step
        bestGapEnd = sorted[i + 1].step
      }
    }
    const midTarget = (bestGapStart + bestGapEnd) / 2
    // Pick the available BASE_STEP closest to the midpoint
    let best = available[0]
    let bestDist = Math.abs(available[0] - midTarget)
    for (const s of available) {
      const d = Math.abs(s - midTarget)
      if (d < bestDist) { best = s; bestDist = d }
    }
    return best
  }, [])

  // Get interpolated color at a step from current scale
  const getInterpolatedColorAtStep = useCallback((step: number): { hue: number; saturation: number; lightness: number } => {
    const gen = pointsToScale(points)
    const hex = gen[getStepVar(step)] ?? '#888888'
    const [h, s, l] = hexToHsl(hex)
    return { hue: h, saturation: s, lightness: l }
  }, [points])

  const addPointAtStep = useCallback((step: number) => {
    setPoints(prev => {
      if (prev.length >= 16) return prev
      if (prev.some(p => p.step === step)) return prev
      const { hue, saturation, lightness } = getInterpolatedColorAtStep(step)
      const newPoint: ScalePoint = { id: makeId(), hue, saturation, lightness, step }
      const next = [...prev, newPoint].sort((a, b) => a.step - b.step)
      applyScale(next, overrides)
      return next
    })
  }, [applyScale, overrides, getInterpolatedColorAtStep])

  const addPoint = useCallback(() => {
    const step = findBestNewStep(points)
    if (step === null || points.length >= 16) return
    addPointAtStep(step)
  }, [points, findBestNewStep, addPointAtStep])

  const removePoint = useCallback(() => {
    if (!selectedId || points.length <= 3) return
    const sel = points.find(p => p.id === selectedId)
    if (sel && STRUCTURAL_STEPS.includes(sel.step)) return // Can't remove structural
    setPoints(prev => {
      const next = prev.filter(p => p.id !== selectedId)
      applyScale(next, overrides)
      return next
    })
    setSelectedId(null)
  }, [selectedId, points, applyScale, overrides])

  const resetToThreeAnchors = useCallback(() => {
    if (points.length <= 3) return
    setPoints(prev => {
      const next = prev.filter(p => STRUCTURAL_STEPS.includes(p.step))
      applyScale(next, overrides)
      return next
    })
    setSelectedId(prev => {
      const structural = points.find(p => p.id === prev && STRUCTURAL_STEPS.includes(p.step))
      return structural ? prev : points.find(p => p.step === 500)?.id ?? null
    })
  }, [points, applyScale, overrides])

  const randomizeScale = useCallback(() => {
    const result = generateRandomScale()
    const newPoints: ScalePoint[] = result.points.map(p => ({
      id: makeId(),
      hue: p.hue,
      saturation: p.saturation,
      lightness: p.lightness,
      step: p.step,
      label: p.step === 0 ? 'Lightest' : p.step === 500 ? 'Midpoint' : 'Darkest',
    }))
    setPoints(newPoints)
    setSelectedId(newPoints[1].id)
    setOverrides({})
    applyScale(newPoints, {})
  }, [applyScale])

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
  const anchorStepSet = useMemo(() => new Set(points.map(p => p.step)), [points])
  const scaleSteps = useMemo(
    () =>
      BASE_STEPS.map((step) => {
        const varName = getStepVar(step)
        return {
          step,
          color: config.light[varName] ?? '#888888',
          isOverridden: varName in overrides,
          isAnchor: anchorStepSet.has(step),
          defaultColor: generated[varName],
        }
      }),
    [config.light, overrides, generated, anchorStepSet],
  )

  // Find selected point's step for ScaleStrip highlighting
  const selectedStep = useMemo(
    () => selectedPoint?.step ?? null,
    [selectedPoint],
  )

  // Structural points for the always-visible fields
  const structuralPoints = useMemo(
    () => ({
      lightest: points.find(p => p.step === 0)!,
      midpoint: points.find(p => p.step === 500)!,
      darkest: points.find(p => p.step === 1000)!,
    }),
    [points],
  )

  // Is the selected point non-structural?
  const selectedNonStructural = useMemo(
    () => selectedPoint && !STRUCTURAL_STEPS.includes(selectedPoint.step) ? selectedPoint : null,
    [selectedPoint],
  )

  // Can the selected point be removed?
  const canRemoveSelected = useMemo(
    () => selectedPoint && !STRUCTURAL_STEPS.includes(selectedPoint.step) && points.length > 3,
    [selectedPoint, points.length],
  )

  // Render an anchor row (swatch + hex + label)
  const renderAnchorRow = (point: ScalePoint, label: string) => {
    if (!point) return null
    const isSelected = point.id === selectedId
    const hex = hslToHex(point.hue, point.saturation, point.lightness)
    return (
      <div
        key={point.id}
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
          isSelected ? 'bg-[var(--pt-accent-soft)] border border-[var(--pt-accent-muted)]' : 'border border-transparent hover:bg-[var(--pt-surface-hover)]'
        }`}
        onClick={() => setSelectedId(point.id)}
      >
        <span className="text-[9px] uppercase tracking-wider text-[var(--pt-text-muted)] font-medium w-[72px] shrink-0">
          {label}
        </span>
        <ColorPopover
          value={hex}
          onChange={(c) => handleColorPopoverChange(point.id, c)}
          label={`Step ${point.step}`}
          swatchSize="sm"
        />
        <input
          type="text"
          value={hexInputs[point.id] ?? hex}
          onChange={(e) => handleHexInputChange(point.id, e.target.value)}
          className="flex-1 text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-2 py-1 text-[var(--pt-text)] font-mono min-w-0 focus:outline-none focus:border-[var(--pt-accent)]"
          spellCheck={false}
          placeholder="#000000"
        />
      </div>
    )
  }

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
          disabled={points.length >= 16}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-[var(--pt-text-muted)] bg-[var(--pt-surface-hover)] hover:bg-[var(--pt-border)] hover:text-[var(--pt-text)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
        >
          <Plus size={12} />
          Add point
        </button>
        <button
          onClick={removePoint}
          disabled={!canRemoveSelected}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-[var(--pt-text-muted)] bg-[var(--pt-surface-hover)] hover:bg-[var(--pt-border)] hover:text-[var(--pt-text)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
        >
          <Minus size={12} />
          Remove
        </button>
        {points.length > 3 && (
          <button
            onClick={resetToThreeAnchors}
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-[var(--pt-text-muted)] bg-[var(--pt-surface-hover)] hover:bg-[var(--pt-border)] hover:text-[var(--pt-text)] transition-colors font-medium"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
        <button
          onClick={randomizeScale}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-[var(--pt-text-muted)] bg-[var(--pt-surface-hover)] hover:bg-[var(--pt-border)] hover:text-[var(--pt-text)] transition-colors font-medium"
        >
          <Dices size={12} />
          Random
        </button>
        <span className="text-[10px] text-[var(--pt-text-muted)] ml-1">{points.length}/16 points</span>
      </div>

      {/* Always-visible anchor fields */}
      <div className="space-y-0.5">
        {renderAnchorRow(structuralPoints.lightest, 'Lightest (0)')}
        {renderAnchorRow(structuralPoints.midpoint, 'Mid (500)')}
        {renderAnchorRow(structuralPoints.darkest, 'Darkest (1000)')}
        {selectedNonStructural && (
          <>
            <div className="border-t border-[var(--pt-border)] my-1" />
            {renderAnchorRow(selectedNonStructural, `Step ${selectedNonStructural.step}`)}
          </>
        )}
      </div>

      {/* 16-step swatch strip */}
      <div>
        <p className="text-[10px] text-[var(--pt-text-muted)] mb-2">Scale steps — click to override individually</p>
        <ScaleStrip
          steps={scaleSteps}
          onStepChange={handleSwatchOverride}
          onStepReset={handleSwatchReset}
          selectedStep={selectedStep}
          onStepAddPoint={addPointAtStep}
          onStepSelectPoint={(step) => {
            const p = points.find(pt => pt.step === step)
            if (p) setSelectedId(p.id)
          }}
        />
      </div>
    </div>
  )
}
