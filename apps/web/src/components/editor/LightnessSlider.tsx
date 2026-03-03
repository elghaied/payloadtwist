'use client'

import { useRef, useCallback, useEffect, useState } from 'react'

interface LightnessSliderProps {
  hue: number
  saturation: number
  lightness: number
  onChange: (lightness: number) => void
  height?: number
}

export function LightnessSlider({
  hue,
  saturation,
  lightness,
  onChange,
  height = 260,
}: LightnessSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [localL, setLocalL] = useState(lightness)

  useEffect(() => {
    setLocalL(lightness)
  }, [lightness])

  const lightnessFromY = useCallback(
    (clientY: number): number => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return lightness
      const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      // top = 100%, bottom = 0%
      return Math.round((1 - ratio) * 100)
    },
    [lightness],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      trackRef.current?.setPointerCapture(e.pointerId)
      dragging.current = true
      const l = lightnessFromY(e.clientY)
      setLocalL(l)
      onChangeRef.current(l)
    },
    [lightnessFromY],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const l = lightnessFromY(e.clientY)
      setLocalL(l)
      onChangeRef.current(l)
    },
    [lightnessFromY],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    trackRef.current?.releasePointerCapture(e.pointerId)
    dragging.current = false
  }, [])

  const gradient = `linear-gradient(to bottom, hsl(${hue}, ${saturation}%, 100%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 0%))`
  // indicator position: top = L100, bottom = L0
  const indicatorY = ((100 - localL) / 100) * height

  return (
    <div
      ref={trackRef}
      className="relative rounded-full cursor-pointer flex-shrink-0"
      style={{ width: 20, height, background: gradient }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ top: indicatorY }}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white shadow-md"
          style={{ background: `hsl(${hue}, ${saturation}%, ${localL}%)` }}
        />
      </div>
    </div>
  )
}
