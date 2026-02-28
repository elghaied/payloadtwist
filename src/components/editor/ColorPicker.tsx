'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

function rgbToHex(value: string): string {
  const match = value.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (!match) return '#000000'
  return (
    '#' +
    [match[1], match[2], match[3]]
      .map((n) => parseInt(n).toString(16).padStart(2, '0'))
      .join('')
  )
}

function toColorInputValue(value: string): string {
  if (!value) return '#000000'
  if (value.startsWith('rgb(')) return rgbToHex(value)
  if (value.startsWith('#')) {
    // Expand 3-char hex to 6-char for the native color input
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
      return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3]
    }
    return value
  }
  return '#000000'
}

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value)
}

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
  label?: string
  size?: 'sm' | 'md'
}

export function ColorPicker({ value, onChange, label, size = 'md' }: ColorPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)
  // Stable ref to latest onChange — avoids stale closures in throttle timer
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Local state decoupled from the store — updates instantly on drag.
  // Parent store updates are throttled via emitChange.
  const [localColor, setLocalColor] = useState(() => toColorInputValue(value))
  const [hexInput, setHexInput] = useState(() => toColorInputValue(value))

  // Throttle bookkeeping: timer handle + latest pending value
  const throttleRef = useRef<{ timer?: ReturnType<typeof setTimeout>; latest?: string }>({})

  // Cleanup on unmount
  useEffect(() => () => clearTimeout(throttleRef.current.timer), [])

  // Leading + trailing throttle (~50ms). Fires immediately on first call,
  // then at most every 50ms during continuous drag. This breaks the
  // feedback loop: during the 50ms cooldown, any re-fired native events
  // from useEffect's .value set are accumulated but NOT emitted to parent,
  // so no re-render and no loop.
  const emitChange = useCallback((hex: string) => {
    const t = throttleRef.current
    if (!t.timer) {
      // Leading edge — fire immediately
      onChangeRef.current(hex)
      t.timer = setTimeout(() => {
        // Trailing edge — fire latest accumulated value if any
        if (t.latest !== undefined) {
          onChangeRef.current(t.latest)
          t.latest = undefined
        }
        t.timer = undefined
      }, 50)
    } else {
      // Within throttle window — accumulate
      t.latest = hex
    }
  }, [])

  // Sync from parent on external changes (undo/redo/reset).
  // During active drag, parent updates arrive at most every ~50ms
  // (throttle rate). The brief .value set between fires is safe:
  // any re-fired native event is caught by the throttle's accumulator.
  useEffect(() => {
    const converted = toColorInputValue(value)
    setLocalColor(converted)
    setHexInput(converted)
    if (colorInputRef.current) {
      colorInputRef.current.value = converted
    }
  }, [value])

  const handleNativeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      setLocalColor(hex)
      setHexInput(hex)
      emitChange(hex)
    },
    [emitChange],
  )

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setHexInput(raw)
      if (isValidHex(raw)) {
        const normalized = toColorInputValue(raw)
        setLocalColor(normalized)
        if (colorInputRef.current) {
          colorInputRef.current.value = normalized
        }
        emitChange(normalized)
      }
    },
    [emitChange],
  )

  const swatchSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`${swatchSize} rounded border border-zinc-600 hover:border-zinc-400 transition-colors flex-shrink-0 shadow-sm`}
          style={{ background: localColor }}
          title={label ? `${label}: ${localColor}` : localColor}
          aria-label={label ?? 'Pick color'}
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-3 bg-zinc-900 border-zinc-700 text-zinc-100"
        sideOffset={6}
      >
        {label && (
          <p className="text-xs text-zinc-400 mb-2 font-mono truncate">{label}</p>
        )}
        <div className="flex flex-col gap-2">
          <input
            type="color"
            ref={colorInputRef}
            defaultValue={localColor}
            onChange={handleNativeChange}
            className="w-full h-24 rounded cursor-pointer border border-zinc-700 bg-transparent p-0"
          />
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-zinc-600 flex-shrink-0"
              style={{ background: localColor }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInput}
              className="flex-1 text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200 font-mono"
              placeholder="#000000"
              spellCheck={false}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
