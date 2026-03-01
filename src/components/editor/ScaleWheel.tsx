'use client'

import { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import { hslToHex } from '@/payload-theme/scale-generator'

export interface ScalePoint {
  id: string
  hue: number        // 0-360
  saturation: number  // 0-100
  lightness: number   // 0-100
  step: number        // BASE_STEP this point is pinned to (0-1000)
  label?: string      // "Lightest", "Midpoint", "Darkest"
}

interface ScaleWheelProps {
  points: ScalePoint[]
  selectedId: string | null
  onSelectPoint: (id: string) => void
  onPointChange: (id: string, hue: number, saturation: number) => void
  onPointsChange: (updates: Array<{ id: string; hue: number; saturation: number }>) => void
  linked: boolean
  onLinkedChange: (linked: boolean) => void
  size?: number
}

function hslToXY(h: number, s: number, cx: number, cy: number, radius: number): [number, number] {
  const angle = (h - 90) * (Math.PI / 180)
  const r = (s / 100) * radius
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

function xyToHS(x: number, y: number, cx: number, cy: number, radius: number): [number, number] {
  const dx = x - cx
  const dy = y - cy
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
  if (angle < 0) angle += 360
  const dist = Math.sqrt(dx * dx + dy * dy)
  const sat = Math.min(100, (dist / radius) * 100)
  return [angle % 360, sat]
}

export function ScaleWheel({
  points,
  selectedId,
  onSelectPoint,
  onPointChange,
  onPointsChange,
  linked,
  onLinkedChange,
  size = 240,
}: ScaleWheelProps) {
  // Local copy of points for immediate 60fps rendering during drag.
  // Props sync back in via the effect below (for undo/redo/preset).
  const [localPoints, setLocalPoints] = useState(points)

  // Sync from props when NOT dragging (external changes: undo, preset, etc.)
  const draggingId = useRef<string | null>(null)
  useEffect(() => {
    if (!draggingId.current) {
      setLocalPoints(points)
    }
  }, [points])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onPointChangeRef = useRef(onPointChange)
  onPointChangeRef.current = onPointChange
  const onPointsChangeRef = useRef(onPointsChange)
  onPointsChangeRef.current = onPointsChange

  const throttleRef = useRef<{ timer?: ReturnType<typeof setTimeout>; latest?: Array<{ id: string; hue: number; saturation: number }> }>({})

  // Store angular + radial offsets for linked mode
  const linkedOffsetsRef = useRef<Record<string, { angleDiff: number; saturation: number }>>({})

  const radius = size / 2 - 12
  const cx = size / 2
  const cy = size / 2

  // Draw the HSL wheel once, cache in offscreen canvas
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const canvas = canvasRef.current
    if (!canvas) return

    if (offscreenRef.current?.width === size * dpr) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = size * dpr
        canvas.height = size * dpr
        canvas.style.width = `${size}px`
        canvas.style.height = `${size}px`
        ctx.drawImage(offscreenRef.current, 0, 0)
      }
      return
    }

    const offscreen = document.createElement('canvas')
    offscreen.width = size * dpr
    offscreen.height = size * dpr
    const octx = offscreen.getContext('2d')!
    octx.scale(dpr, dpr)

    const imageData = octx.createImageData(size * dpr, size * dpr)
    const data = imageData.data

    for (let py = 0; py < size * dpr; py++) {
      for (let px = 0; px < size * dpr; px++) {
        const x = px / dpr - cx
        const y = py / dpr - cy
        const dist = Math.sqrt(x * x + y * y)

        if (dist <= radius) {
          let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
          if (angle < 0) angle += 360
          const sat = (dist / radius) * 100
          const hex = hslToHex(angle % 360, sat, 50)
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          const idx = (py * size * dpr + px) * 4
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = 255
        }
      }
    }

    octx.putImageData(imageData, 0, 0)
    offscreenRef.current = offscreen

    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(offscreen, 0, 0)
  }, [size, cx, cy, radius])

  // Throttled emit (~50ms)
  const emitChanges = useCallback((updates: Array<{ id: string; hue: number; saturation: number }>) => {
    const t = throttleRef.current
    if (!t.timer) {
      if (updates.length === 1) {
        onPointChangeRef.current(updates[0].id, updates[0].hue, updates[0].saturation)
      } else {
        onPointsChangeRef.current(updates)
      }
      t.timer = setTimeout(() => {
        if (t.latest) {
          if (t.latest.length === 1) {
            onPointChangeRef.current(t.latest[0].id, t.latest[0].hue, t.latest[0].saturation)
          } else {
            onPointsChangeRef.current(t.latest)
          }
          t.latest = undefined
        }
        t.timer = undefined
      }, 50)
    } else {
      t.latest = updates
    }
  }, [])

  const handlePositions = useMemo(() => {
    const result: Record<string, [number, number]> = {}
    for (const p of localPoints) {
      result[p.id] = hslToXY(p.hue, p.saturation, cx, cy, radius)
    }
    return result
  }, [localPoints, cx, cy, radius])

  const handlePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      draggingId.current = id
      onSelectPoint(id)

      // Store offsets for linked mode (use localPoints for current visual positions)
      const dragPoint = localPoints.find(p => p.id === id)
      if (dragPoint) {
        const offsets: Record<string, { angleDiff: number; saturation: number }> = {}
        for (const p of localPoints) {
          let diff = p.hue - dragPoint.hue
          if (diff > 180) diff -= 360
          if (diff < -180) diff += 360
          offsets[p.id] = { angleDiff: diff, saturation: p.saturation }
        }
        linkedOffsetsRef.current = offsets
      }
    },
    [onSelectPoint, localPoints],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const id = draggingId.current
      if (!id) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const [hue, sat] = xyToHS(x, y, cx, cy, radius)

      if (linked) {
        const updates: Array<{ id: string; hue: number; saturation: number }> = []
        for (const p of localPoints) {
          if (p.id === id) {
            updates.push({ id, hue, saturation: sat })
          } else {
            const offset = linkedOffsetsRef.current[p.id]
            if (offset) {
              let newH = hue + offset.angleDiff
              if (newH < 0) newH += 360
              if (newH >= 360) newH -= 360
              updates.push({ id: p.id, hue: newH, saturation: offset.saturation })
            }
          }
        }
        // Update local state immediately for smooth 60fps rendering
        setLocalPoints(prev => {
          const updateMap = new Map(updates.map(u => [u.id, u]))
          return prev.map(p => {
            const u = updateMap.get(p.id)
            return u ? { ...p, hue: u.hue, saturation: u.saturation } : p
          })
        })
        emitChanges(updates)
      } else {
        // Update local state immediately
        setLocalPoints(prev =>
          prev.map(p => p.id === id ? { ...p, hue, saturation: sat } : p)
        )
        emitChanges([{ id, hue, saturation: sat }])
      }
    },
    [cx, cy, radius, linked, localPoints, emitChanges],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingId.current) return
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    draggingId.current = null
    // Flush any pending throttled update
    const t = throttleRef.current
    if (t.latest) {
      if (t.latest.length === 1) {
        onPointChangeRef.current(t.latest[0].id, t.latest[0].hue, t.latest[0].saturation)
      } else {
        onPointsChangeRef.current(t.latest)
      }
      t.latest = undefined
    }
  }, [])

  // Click on wheel → move selected point
  const handleWheelClick = useCallback(
    (e: React.MouseEvent) => {
      if (!selectedId) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const dx = x - cx
      const dy = y - cy
      if (Math.sqrt(dx * dx + dy * dy) > radius) return

      const [hue, sat] = xyToHS(x, y, cx, cy, radius)
      emitChanges([{ id: selectedId, hue, saturation: sat }])
    },
    [cx, cy, radius, selectedId, emitChanges],
  )

  // SVG lines: triangle for 3 points, spoke lines for 4+
  const svgLines = useMemo(() => {
    if (localPoints.length < 2) return null

    if (localPoints.length === 3) {
      // Triangle connecting all 3
      const pts = localPoints.map(p => handlePositions[p.id] ?? [cx, cy])
      return (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={size}
          height={size}
          style={{ overflow: 'visible' }}
        >
          {pts.map((pt, i) => {
            const next = pts[(i + 1) % pts.length]
            return (
              <line
                key={i}
                x1={pt[0]}
                y1={pt[1]}
                x2={next[0]}
                y2={next[1]}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )
          })}
        </svg>
      )
    }

    // 4+ points: spoke lines from center
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        {localPoints.map((p) => {
          const [x, y] = handlePositions[p.id] ?? [cx, cy]
          return (
            <line
              key={p.id}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )
        })}
      </svg>
    )
  }, [localPoints, handlePositions, size, cx, cy])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className="relative"
        style={{ width: size, height: size }}
        onClick={handleWheelClick}
      >
        <canvas
          ref={canvasRef}
          className="rounded-full"
          style={{ width: size, height: size }}
        />

        {svgLines}

        {/* Draggable handles with step labels */}
        {localPoints.map((p) => {
          const pos = handlePositions[p.id]
          if (!pos) return null
          const [x, y] = pos
          const isSelected = p.id === selectedId
          const handleSize = isSelected ? 20 : 16
          const offset = handleSize / 2

          // Position label offset: push away from center
          const dx = x - cx
          const dy = y - cy
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const labelOffset = handleSize / 2 + 10
          const lx = (dx / dist) * labelOffset
          const ly = (dy / dist) * labelOffset

          return (
            <div
              key={p.id}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: x - offset,
                top: y - offset,
                width: handleSize,
                height: handleSize,
                zIndex: isSelected ? 10 : 5,
              }}
              onPointerDown={(e) => handlePointerDown(p.id, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div
                className="w-full h-full rounded-full border-2 shadow-lg"
                style={{
                  background: hslToHex(p.hue, p.saturation, p.lightness),
                  borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.5)',
                  boxShadow: isSelected
                    ? '0 0 0 2px rgba(59,130,246,0.7), 0 2px 8px rgba(0,0,0,0.5)'
                    : '0 2px 6px rgba(0,0,0,0.4)',
                }}
                title={p.label ? `${p.label}: ${hslToHex(p.hue, p.saturation, p.lightness)}` : hslToHex(p.hue, p.saturation, p.lightness)}
              />
              {/* Step label */}
              <span
                className="absolute pointer-events-none select-none text-[9px] font-medium"
                style={{
                  left: `calc(50% + ${lx}px)`,
                  top: `calc(50% + ${ly}px)`,
                  transform: 'translate(-50%, -50%)',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {p.step}
              </span>
            </div>
          )
        })}
      </div>

      {/* Link/unlink toggle */}
      <button
        onClick={() => onLinkedChange(!linked)}
        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors font-medium ${
          linked
            ? 'text-[#5B6CF0] bg-[#5B6CF0]/10 hover:bg-[#5B6CF0]/20'
            : 'text-[#78726C] bg-[#F0EDE8] hover:bg-[#E5E2DC]'
        }`}
        title={linked ? 'Handles linked — drag rotates all together' : 'Handles unlinked — drag independently'}
      >
        {linked ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        )}
        {linked ? 'Linked' : 'Unlinked'}
      </button>
    </div>
  )
}
