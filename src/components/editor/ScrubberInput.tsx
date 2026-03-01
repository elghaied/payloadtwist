'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { MoveHorizontal } from 'lucide-react'

interface ScrubberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  label?: string
  className?: string
}

export function ScrubberInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  label,
  className = '',
}: ScrubberInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ startX: number; startValue: number } | null>(null)

  const clamp = useCallback(
    (v: number) => {
      const clamped = Math.min(max, Math.max(min, v))
      const precision = step < 1 ? String(step).split('.')[1]?.length ?? 0 : 0
      return Number(clamped.toFixed(precision))
    },
    [min, max, step],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isEditing) return
      e.preventDefault()
      const el = containerRef.current
      if (!el) return

      el.setPointerCapture(e.pointerId)
      dragState.current = { startX: e.clientX, startValue: value }
      setIsDragging(true)
    },
    [value, isEditing],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return

      let delta = e.clientX - dragState.current.startX

      // Shift = 10x speed, Alt = 0.1x precision
      if (e.shiftKey) delta *= 10
      if (e.altKey) delta *= 0.1

      const newValue = clamp(dragState.current.startValue + delta * step)
      onChange(newValue)
    },
    [clamp, onChange, step],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return
      const el = containerRef.current
      if (el) el.releasePointerCapture(e.pointerId)
      dragState.current = null
      setIsDragging(false)
    },
    [],
  )

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setEditValue(String(value))
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(editValue)
    if (!isNaN(parsed)) {
      onChange(clamp(parsed))
    }
    setIsEditing(false)
  }, [editValue, onChange, clamp])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitEdit()
      } else if (e.key === 'Escape') {
        setIsEditing(false)
      }
    },
    [commitEdit],
  )

  const mono = "'JetBrains Mono', monospace"

  if (isEditing) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-[#78726C] mr-2">{label}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-16 text-xs bg-white border border-[#5B6CF0] rounded px-2 py-1 text-[#1C1917] font-mono text-right focus:outline-none"
          style={{ fontFamily: mono }}
        />
        {unit && <span className="text-[10px] text-[#78726C] ml-1">{unit}</span>}
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-[#78726C] mr-2">{label}</span>
      )}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          select-none px-2 py-1 rounded text-xs text-[#1C1917] font-mono text-right
          bg-[#F8F7F5] border transition-colors min-w-[3.5rem] relative
          ${isDragging ? 'cursor-ew-resize border-[#5B6CF0]' : 'cursor-ew-resize border-[#E5E2DC] hover:border-[#CCC8C2]'}
        `}
        style={{ fontFamily: mono }}
        title="Drag to scrub · Double-click to edit · Shift=10x · Alt=0.1x"
      >
        {isHovered && !isDragging && (
          <MoveHorizontal
            size={10}
            className="absolute left-1 top-1/2 -translate-y-1/2 text-[#B8B4AE]"
          />
        )}
        {value}
        {unit && <span className="text-[#78726C] ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}
