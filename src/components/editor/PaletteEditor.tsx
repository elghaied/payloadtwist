'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { PaletteWheel, type PalettePoint } from './PaletteWheel'
import { LightnessSlider } from './LightnessSlider'
import { ScrubberInput } from './ScrubberInput'
import { PayloadThemeConfig } from '@/payload-theme/types'
import { generateBaseScaleFromAnchors, hslToHex } from '@/payload-theme/scale-generator'
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
  return `p${nextId++}`
}

function createDefaultPoints(): PalettePoint[] {
  return [
    { id: makeId(), hue: 210, saturation: 15, lightness: 95 },
    { id: makeId(), hue: 210, saturation: 10, lightness: 50 },
    { id: makeId(), hue: 210, saturation: 15, lightness: 10 },
  ]
}

function pointsToScale(pts: PalettePoint[]): Record<string, string> {
  const steps = distributeSteps(pts.length)
  const anchors = pts.map((p, i) => ({
    step: steps[i],
    color: hslToHex(p.hue, p.saturation, p.lightness),
  }))
  return generateBaseScaleFromAnchors(anchors)
}

interface PaletteEditorProps {
  config: PayloadThemeConfig
  setBaseScale: (vars: Record<string, string>) => void
}

export function PaletteEditor({ config, setBaseScale }: PaletteEditorProps) {
  const [points, setPoints] = useState<PalettePoint[]>(createDefaultPoints)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Deferred store update: schedule applyPalette via a ref + effect
  // so it runs after render, not during a setState updater.
  const pendingScale = useRef<Record<string, string> | null>(null)
  const setBaseScaleRef = useRef(setBaseScale)
  setBaseScaleRef.current = setBaseScale

  useEffect(() => {
    if (pendingScale.current) {
      setBaseScaleRef.current(pendingScale.current)
      pendingScale.current = null
    }
  })

  const applyPalette = useCallback((pts: PalettePoint[]) => {
    pendingScale.current = pointsToScale(pts)
  }, [])

  const selectedPoint = useMemo(
    () => points.find(p => p.id === selectedId) ?? null,
    [points, selectedId],
  )

  const handlePointChange = useCallback(
    (id: string, hue: number, saturation: number) => {
      setPoints(prev => {
        const next = prev.map(p => p.id === id ? { ...p, hue, saturation } : p)
        applyPalette(next)
        return next
      })
    },
    [applyPalette],
  )

  const handleLightnessChange = useCallback(
    (l: number) => {
      if (!selectedId) return
      setPoints(prev => {
        const next = prev.map(p => p.id === selectedId ? { ...p, lightness: l } : p)
        applyPalette(next)
        return next
      })
    },
    [selectedId, applyPalette],
  )

  const handleSaturationChange = useCallback(
    (sat: number) => {
      if (!selectedId) return
      setPoints(prev => {
        const next = prev.map(p => p.id === selectedId ? { ...p, saturation: sat } : p)
        applyPalette(next)
        return next
      })
    },
    [selectedId, applyPalette],
  )

  const addPoint = useCallback(() => {
    setPoints(prev => {
      const next = [...prev, { id: makeId(), hue: 180, saturation: 50, lightness: 50 }]
      applyPalette(next)
      return next
    })
  }, [applyPalette])

  const removePoint = useCallback(() => {
    if (!selectedId || points.length <= 2) return
    setPoints(prev => {
      const next = prev.filter(p => p.id !== selectedId)
      applyPalette(next)
      return next
    })
    setSelectedId(null)
  }, [selectedId, points.length, applyPalette])

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start justify-center">
        <PaletteWheel
          points={points}
          selectedId={selectedId}
          onSelectPoint={setSelectedId}
          onPointChange={handlePointChange}
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
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
        >
          <Plus size={12} />
          Add point
        </button>
        <button
          onClick={removePoint}
          disabled={!selectedId || points.length <= 2}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={12} />
          Remove
        </button>
        <span className="text-[10px] text-zinc-600 ml-1">{points.length} points</span>
      </div>

      {/* Read-only swatch strip showing the 16 resulting steps */}
      <div>
        <p className="text-xs text-zinc-500 mb-2">Interpolated scale preview</p>
        <div className="flex gap-0.5">
          {BASE_STEPS.map((step) => {
            const varName = getStepVar(step)
            const color = config.light[varName] ?? '#888888'
            return (
              <div
                key={step}
                className="flex-1 h-8 rounded-sm"
                style={{ background: color }}
                title={`${varName}: ${color}`}
              />
            )
          })}
        </div>
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
