'use client'

import { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { hexToHsl, hslToHex } from '@/payload-theme/scale-generator'

type AnchorKey = 'lightest' | 'mid' | 'darkest'

interface ColorWheelProps {
  anchors: { lightest: string; mid: string; darkest: string }
  onHueChange: (anchor: AnchorKey, hue: number) => void
  selectedAnchor: AnchorKey
  onSelectAnchor: (anchor: AnchorKey) => void
  linked: boolean
  onLinkedChange: (linked: boolean) => void
  size?: number
}

// Hue angle → (x, y) on the outer rim
function hueToXY(h: number, cx: number, cy: number, radius: number): [number, number] {
  const angle = (h - 90) * (Math.PI / 180) // 0° at top
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]
}

// (x, y) → hue angle
function xyToHue(x: number, y: number, cx: number, cy: number): number {
  const dx = x - cx
  const dy = y - cy
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
  if (angle < 0) angle += 360
  return angle % 360
}

const ANCHOR_COLORS: Record<AnchorKey, string> = {
  lightest: '#ffffff',
  mid: '#a0a0a0',
  darkest: '#404040',
}

const ANCHOR_ORDER: AnchorKey[] = ['lightest', 'mid', 'darkest']

export function ColorWheel({
  anchors,
  onHueChange,
  selectedAnchor,
  onSelectAnchor,
  linked,
  onLinkedChange,
  size = 260,
}: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onHueChangeRef = useRef(onHueChange)
  onHueChangeRef.current = onHueChange

  const draggingAnchor = useRef<AnchorKey | null>(null)
  const throttleRef = useRef<{ timer?: ReturnType<typeof setTimeout>; latest?: [AnchorKey, number][] }>({})

  const [localAnchors, setLocalAnchors] = useState(anchors)

  // Sync from parent (undo/redo/reset)
  useEffect(() => {
    setLocalAnchors(anchors)
  }, [anchors])

  const radius = size / 2 - 12 // padding for handles
  const cx = size / 2
  const cy = size / 2

  // Parse anchors to HSL
  const anchorHSL = useMemo(() => ({
    lightest: hexToHsl(localAnchors.lightest),
    mid: hexToHsl(localAnchors.mid),
    darkest: hexToHsl(localAnchors.darkest),
  }), [localAnchors])

  // Draw the HSL wheel once, cache in offscreen canvas
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const canvas = canvasRef.current
    if (!canvas) return

    // Check if offscreen already exists at this size
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

    // Draw pixel-by-pixel HSL wheel
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

  // Throttled emit to store (~50ms)
  const emitChanges = useCallback((updates: [AnchorKey, number][]) => {
    const t = throttleRef.current
    if (!t.timer) {
      for (const [key, hue] of updates) onHueChangeRef.current(key, hue)
      t.timer = setTimeout(() => {
        if (t.latest) {
          for (const [key, hue] of t.latest) onHueChangeRef.current(key, hue)
          t.latest = undefined
        }
        t.timer = undefined
      }, 50)
    } else {
      t.latest = updates
    }
  }, [])

  // Compute handle positions — always on the rim based on hue only
  const handlePositions = useMemo(() => {
    const result: Record<AnchorKey, [number, number]> = {} as any
    for (const key of ANCHOR_ORDER) {
      const [h] = anchorHSL[key]
      result[key] = hueToXY(h, cx, cy, radius)
    }
    return result
  }, [anchorHSL, cx, cy, radius])

  // Angular offsets for linked mode (relative to dragged anchor)
  const angularOffsetsRef = useRef<Record<AnchorKey, number>>({ lightest: 0, mid: 0, darkest: 0 })

  const handlePointerDown = useCallback(
    (anchor: AnchorKey, e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      draggingAnchor.current = anchor
      onSelectAnchor(anchor)

      // Store angular offsets for linked mode
      const dragH = anchorHSL[anchor][0]
      for (const key of ANCHOR_ORDER) {
        let diff = anchorHSL[key][0] - dragH
        if (diff > 180) diff -= 360
        if (diff < -180) diff += 360
        angularOffsetsRef.current[key] = diff
      }
    },
    [anchorHSL, onSelectAnchor],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const anchor = draggingAnchor.current
      if (!anchor) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const hue = xyToHue(x, y, cx, cy)

      const updates: [AnchorKey, number][] = []
      const nextAnchors = { ...localAnchors }

      // Update dragged anchor — reconstruct hex from new hue + existing S, L
      const [, dragS, dragL] = anchorHSL[anchor]
      const dragHex = hslToHex(hue, dragS, dragL)
      nextAnchors[anchor] = dragHex
      updates.push([anchor, hue])

      if (linked) {
        // Rotate other anchors by the same hue delta, keep their S and L
        for (const key of ANCHOR_ORDER) {
          if (key === anchor) continue
          let newH = hue + angularOffsetsRef.current[key]
          if (newH < 0) newH += 360
          if (newH >= 360) newH -= 360
          const [, otherS, otherL] = anchorHSL[key]
          const hex = hslToHex(newH, otherS, otherL)
          nextAnchors[key] = hex
          updates.push([key, newH])
        }
      }

      setLocalAnchors(nextAnchors)
      emitChanges(updates)
    },
    [cx, cy, linked, localAnchors, anchorHSL, emitChanges],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingAnchor.current) return
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    draggingAnchor.current = null
  }, [])

  // Click on wheel background → move selected anchor's hue
  const handleWheelClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const dx = x - cx
      const dy = y - cy
      if (Math.sqrt(dx * dx + dy * dy) > radius) return

      const hue = xyToHue(x, y, cx, cy)
      const [, s, l] = anchorHSL[selectedAnchor]
      const hex = hslToHex(hue, s, l)
      setLocalAnchors((prev) => ({ ...prev, [selectedAnchor]: hex }))
      emitChanges([[selectedAnchor, hue]])
    },
    [cx, cy, radius, anchorHSL, selectedAnchor, emitChanges],
  )

  // SVG lines connecting handles
  const svgLines = useMemo(() => {
    const pts = ANCHOR_ORDER.map((k) => handlePositions[k])
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
  }, [handlePositions, size])

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

        {/* Draggable handles — always on the rim */}
        {ANCHOR_ORDER.map((key) => {
          const [x, y] = handlePositions[key]
          const isSelected = key === selectedAnchor
          const handleSize = isSelected ? 20 : 16
          const offset = handleSize / 2

          return (
            <div
              key={key}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: x - offset,
                top: y - offset,
                width: handleSize,
                height: handleSize,
                zIndex: isSelected ? 10 : 5,
              }}
              onPointerDown={(e) => handlePointerDown(key, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div
                className="w-full h-full rounded-full border-2 shadow-lg transition-shadow"
                style={{
                  background: localAnchors[key],
                  borderColor: isSelected ? '#fff' : ANCHOR_COLORS[key],
                  boxShadow: isSelected
                    ? '0 0 0 2px rgba(59,130,246,0.7), 0 2px 8px rgba(0,0,0,0.5)'
                    : '0 2px 6px rgba(0,0,0,0.4)',
                }}
                title={`${key}: ${localAnchors[key]}`}
              />
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
