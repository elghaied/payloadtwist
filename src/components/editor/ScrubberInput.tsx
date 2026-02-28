'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ startX: number; startValue: number } | null>(null)

  const clamp = useCallback(
    (v: number) => {
      const clamped = Math.min(max, Math.max(min, v))
      // Round to step precision
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

  if (isEditing) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-2">{label}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-16 text-xs bg-zinc-800 border border-blue-500/50 rounded px-2 py-1 text-zinc-100 font-mono text-right focus:outline-none"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
        {unit && <span className="text-[10px] text-zinc-500 ml-1">{unit}</span>}
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-2">{label}</span>
      )}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className={`
          select-none px-2 py-1 rounded text-xs text-zinc-100 font-mono text-right
          bg-zinc-800 border border-zinc-700 hover:border-zinc-500
          transition-colors min-w-[3.5rem]
          ${isDragging ? 'cursor-ew-resize border-blue-500/50' : 'cursor-ew-resize'}
        `}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        title="Drag to scrub · Double-click to edit · Shift=10x · Alt=0.1x"
      >
        {value}
        {unit && <span className="text-zinc-500 ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}
