'use client'

import { useRef, useCallback, useEffect, useMemo } from 'react'
import { hslToHex } from '@/payload-theme/scale-generator'

export interface PalettePoint {
  id: string
  hue: number        // 0-360
  saturation: number  // 0-100
  lightness: number   // 0-100
}

interface PaletteWheelProps {
  points: PalettePoint[]
  selectedId: string | null
  onSelectPoint: (id: string) => void
  onPointChange: (id: string, hue: number, saturation: number) => void
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

export function PaletteWheel({
  points,
  selectedId,
  onSelectPoint,
  onPointChange,
  size = 240,
}: PaletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onPointChangeRef = useRef(onPointChange)
  onPointChangeRef.current = onPointChange

  const draggingId = useRef<string | null>(null)
  const throttleRef = useRef<{ timer?: ReturnType<typeof setTimeout>; latest?: [string, number, number] }>({})

  const radius = size / 2 - 12
  const cx = size / 2
  const cy = size / 2

  // Draw the HSL wheel once
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
  const emitChange = useCallback((id: string, hue: number, sat: number) => {
    const t = throttleRef.current
    if (!t.timer) {
      onPointChangeRef.current(id, hue, sat)
      t.timer = setTimeout(() => {
        if (t.latest) {
          onPointChangeRef.current(t.latest[0], t.latest[1], t.latest[2])
          t.latest = undefined
        }
        t.timer = undefined
      }, 50)
    } else {
      t.latest = [id, hue, sat]
    }
  }, [])

  const handlePositions = useMemo(() => {
    const result: Record<string, [number, number]> = {}
    for (const p of points) {
      result[p.id] = hslToXY(p.hue, p.saturation, cx, cy, radius)
    }
    return result
  }, [points, cx, cy, radius])

  const handlePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      draggingId.current = id
      onSelectPoint(id)
    },
    [onSelectPoint],
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
      emitChange(id, hue, sat)
    },
    [cx, cy, radius, emitChange],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingId.current) return
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    draggingId.current = null
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
      emitChange(selectedId, hue, sat)
    },
    [cx, cy, radius, selectedId, emitChange],
  )

  // SVG spoke lines from each point to center
  const svgSpokes = useMemo(() => (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
    >
      {points.map((p) => {
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
  ), [points, handlePositions, size, cx, cy])

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

        {svgSpokes}

        {/* Draggable handles */}
        {points.map((p) => {
          const pos = handlePositions[p.id]
          if (!pos) return null
          const [x, y] = pos
          const isSelected = p.id === selectedId
          const handleSize = isSelected ? 20 : 16
          const offset = handleSize / 2

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
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
