'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ColorSwatch } from './ColorSwatch'
import { hexToHsl, hslToHex } from '@/payload-theme/scale-generator'

// ─── HSV ↔ HSL helpers ──────────────────────────────────────────────────────

function hslToHsv(h: number, s: number, l: number): [number, number, number] {
  // s, l in 0-100
  const sF = s / 100
  const lF = l / 100
  const v = lF + sF * Math.min(lF, 1 - lF)
  const sv = v === 0 ? 0 : 2 * (1 - lF / v)
  return [h, sv * 100, v * 100]
}

function hsvToHsl(h: number, s: number, v: number): [number, number, number] {
  // s, v in 0-100
  const sF = s / 100
  const vF = v / 100
  const l = vF * (1 - sF / 2)
  const sl = l === 0 || l === 1 ? 0 : (vF - l) / Math.min(l, 1 - l)
  return [h, sl * 100, l * 100]
}

// ─── Color format utilities ─────────────────────────────────────────────────

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

function toHex(value: string): string {
  if (!value) return '#000000'
  if (value.startsWith('rgb(')) return rgbToHex(value)
  if (value.startsWith('#')) {
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
      return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3]
    }
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value
  }
  return '#000000'
}

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value)
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

type InputMode = 'hex' | 'rgb' | 'hsl'

// ─── SV Canvas ──────────────────────────────────────────────────────────────

function SVCanvas({
  hue,
  saturation,
  value,
  onChange,
}: {
  hue: number
  saturation: number
  value: number
  onChange: (s: number, v: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const W = 220
  const H = 140

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = W
    canvas.height = H

    // Base hue fill
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
    ctx.fillRect(0, 0, W, H)

    // White gradient left to right
    const wGrad = ctx.createLinearGradient(0, 0, W, 0)
    wGrad.addColorStop(0, 'rgba(255,255,255,1)')
    wGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = wGrad
    ctx.fillRect(0, 0, W, H)

    // Black gradient top to bottom
    const bGrad = ctx.createLinearGradient(0, 0, 0, H)
    bGrad.addColorStop(0, 'rgba(0,0,0,0)')
    bGrad.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.fillStyle = bGrad
    ctx.fillRect(0, 0, W, H)
  }, [hue])

  const getSV = useCallback(
    (clientX: number, clientY: number): [number, number] => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return [saturation, value]
      const x = Math.max(0, Math.min(W, clientX - rect.left))
      const y = Math.max(0, Math.min(H, clientY - rect.top))
      return [(x / W) * 100, (1 - y / H) * 100]
    },
    [saturation, value],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      containerRef.current?.setPointerCapture(e.pointerId)
      dragging.current = true
      const [s, v] = getSV(e.clientX, e.clientY)
      onChangeRef.current(s, v)
    },
    [getSV],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const [s, v] = getSV(e.clientX, e.clientY)
      onChangeRef.current(s, v)
    },
    [getSV],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    containerRef.current?.releasePointerCapture(e.pointerId)
    dragging.current = false
  }, [])

  // Crosshair position
  const cx = (saturation / 100) * W
  const cy = (1 - value / 100) * H

  return (
    <div
      ref={containerRef}
      className="relative cursor-crosshair rounded"
      style={{ width: W, height: H }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <canvas ref={canvasRef} className="rounded block" style={{ width: W, height: H }} />
      <div
        className="absolute w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
        style={{
          left: cx - 7,
          top: cy - 7,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  )
}

// ─── Hue Slider ─────────────────────────────────────────────────────────────

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const W = 220

  const getHue = useCallback(
    (clientX: number): number => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return hue
      const x = Math.max(0, Math.min(W, clientX - rect.left))
      return (x / W) * 360
    },
    [hue],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      trackRef.current?.setPointerCapture(e.pointerId)
      dragging.current = true
      onChangeRef.current(getHue(e.clientX))
    },
    [getHue],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      onChangeRef.current(getHue(e.clientX))
    },
    [getHue],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    trackRef.current?.releasePointerCapture(e.pointerId)
    dragging.current = false
  }, [])

  const thumbX = (hue / 360) * W

  return (
    <div
      ref={trackRef}
      className="relative cursor-pointer rounded-full"
      style={{
        width: W,
        height: 14,
        background:
          'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
        style={{
          left: thumbX - 7,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
          background: `hsl(${hue}, 100%, 50%)`,
        }}
      />
    </div>
  )
}

// ─── ColorPopover ───────────────────────────────────────────────────────────

interface ColorPopoverProps {
  value: string
  onChange: (hex: string) => void
  label?: string
  hasOverride?: boolean
  swatchSize?: 'sm' | 'lg'
  defaultValue?: string
}

export function ColorPopover({
  value,
  onChange,
  label,
  hasOverride,
  swatchSize = 'sm',
  defaultValue,
}: ColorPopoverProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const throttleRef = useRef<{ timer?: ReturnType<typeof setTimeout>; latest?: string }>({})

  useEffect(() => () => clearTimeout(throttleRef.current.timer), [])

  const emitChange = useCallback((hex: string) => {
    const t = throttleRef.current
    if (!t.timer) {
      onChangeRef.current(hex)
      t.timer = setTimeout(() => {
        if (t.latest !== undefined) {
          onChangeRef.current(t.latest)
          t.latest = undefined
        }
        t.timer = undefined
      }, 50)
    } else {
      t.latest = hex
    }
  }, [])

  const hex = useMemo(() => toHex(value), [value])
  const [h, s, l] = useMemo(() => hexToHsl(hex), [hex])
  const [hsvH, hsvS, hsvV] = useMemo(() => hslToHsv(h, s, l), [h, s, l])

  // Local HSV state for smooth dragging
  const [localHsv, setLocalHsv] = useState<[number, number, number]>([hsvH, hsvS, hsvV])
  const [inputMode, setInputMode] = useState<InputMode>('hex')
  const [hexInput, setHexInput] = useState(hex)

  // Sync from parent on external changes
  useEffect(() => {
    const newHex = toHex(value)
    const [h2, s2, l2] = hexToHsl(newHex)
    const [, sv2, v2] = hslToHsv(h2, s2, l2)
    setLocalHsv([h2, sv2, v2])
    setHexInput(newHex)
  }, [value])

  const updateFromHsv = useCallback(
    (hue: number, sat: number, val: number) => {
      setLocalHsv([hue, sat, val])
      const [hsl_h, hsl_s, hsl_l] = hsvToHsl(hue, sat, val)
      const newHex = hslToHex(hsl_h, hsl_s, hsl_l)
      setHexInput(newHex)
      emitChange(newHex)
    },
    [emitChange],
  )

  const handleSVChange = useCallback(
    (s: number, v: number) => {
      updateFromHsv(localHsv[0], s, v)
    },
    [localHsv, updateFromHsv],
  )

  const handleHueChange = useCallback(
    (newH: number) => {
      updateFromHsv(newH, localHsv[1], localHsv[2])
    },
    [localHsv, updateFromHsv],
  )

  const handleHexInput = useCallback(
    (raw: string) => {
      setHexInput(raw)
      if (isValidHex(raw)) {
        const normalized = toHex(raw)
        const [h2, s2, l2] = hexToHsl(normalized)
        const [, sv2, v2] = hslToHsv(h2, s2, l2)
        setLocalHsv([h2, sv2, v2])
        emitChange(normalized)
      }
    },
    [emitChange],
  )

  const handleReset = useCallback(() => {
    if (defaultValue) {
      const dv = toHex(defaultValue)
      const [h2, s2, l2] = hexToHsl(dv)
      const [, sv2, v2] = hslToHsv(h2, s2, l2)
      setLocalHsv([h2, sv2, v2])
      setHexInput(dv)
      emitChange(dv)
    }
  }, [defaultValue, emitChange])

  // Compute display hex from local HSV
  const displayHex = useMemo(() => {
    const [hsl_h, hsl_s, hsl_l] = hsvToHsl(localHsv[0], localHsv[1], localHsv[2])
    return hslToHex(hsl_h, hsl_s, hsl_l)
  }, [localHsv])

  const [r, g, b] = useMemo(() => hexToRgb(displayHex), [displayHex])
  const displayHsl = useMemo(() => hsvToHsl(localHsv[0], localHsv[1], localHsv[2]), [localHsv])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <ColorSwatch color={hex} hasOverride={hasOverride} size={swatchSize} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 bg-[var(--pt-surface)] border-[var(--pt-border)] text-[var(--pt-text)] shadow-lg"
        sideOffset={6}
      >
        <div className="flex flex-col gap-3" style={{ width: 220 }}>
          {label && (
            <p className="text-[10px] text-[var(--pt-text-muted)] font-mono truncate">{label}</p>
          )}

          {/* SV Canvas */}
          <SVCanvas
            hue={localHsv[0]}
            saturation={localHsv[1]}
            value={localHsv[2]}
            onChange={handleSVChange}
          />

          {/* Hue Slider */}
          <HueSlider hue={localHsv[0]} onChange={handleHueChange} />

          {/* Input mode tabs */}
          <div className="flex gap-1">
            {(['hex', 'rgb', 'hsl'] as InputMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`flex-1 text-[10px] uppercase tracking-wider py-1 rounded transition-colors font-medium ${
                  inputMode === mode
                    ? 'bg-[var(--pt-surface-hover)] text-[var(--pt-text)]'
                    : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Input fields */}
          {inputMode === 'hex' && (
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              className="w-full text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-2 py-1.5 text-[var(--pt-text)] font-mono focus:outline-none focus:border-[var(--pt-accent)]"
              spellCheck={false}
              placeholder="#000000"
            />
          )}

          {inputMode === 'rgb' && (
            <div className="grid grid-cols-3 gap-1.5">
              {(['R', 'G', 'B'] as const).map((ch, i) => (
                <div key={ch} className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--pt-text-muted)] text-center">{ch}</span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={[r, g, b][i]}
                    onChange={(e) => {
                      const vals = [r, g, b]
                      vals[i] = Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                      const newHex =
                        '#' + vals.map((v) => v.toString(16).padStart(2, '0')).join('')
                      handleHexInput(newHex)
                    }}
                    className="w-full text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-1.5 py-1 text-[var(--pt-text)] font-mono text-center focus:outline-none focus:border-[var(--pt-accent)]"
                  />
                </div>
              ))}
            </div>
          )}

          {inputMode === 'hsl' && (
            <div className="grid grid-cols-3 gap-1.5">
              {(['H', 'S', 'L'] as const).map((ch, i) => (
                <div key={ch} className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--pt-text-muted)] text-center">
                    {ch}{i > 0 ? '%' : '\u00B0'}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={i === 0 ? 360 : 100}
                    value={Math.round(displayHsl[i])}
                    onChange={(e) => {
                      const vals = [...displayHsl]
                      vals[i] = Math.max(
                        0,
                        Math.min(i === 0 ? 360 : 100, parseInt(e.target.value) || 0),
                      )
                      const newHex = hslToHex(vals[0], vals[1], vals[2])
                      const [, sv, v] = hslToHsv(vals[0], vals[1], vals[2])
                      setLocalHsv([vals[0], sv, v])
                      setHexInput(newHex)
                      emitChange(newHex)
                    }}
                    className="w-full text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-1.5 py-1 text-[var(--pt-text)] font-mono text-center focus:outline-none focus:border-[var(--pt-accent)]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Reset link */}
          {defaultValue && toHex(value) !== toHex(defaultValue) && (
            <button
              onClick={handleReset}
              className="text-[10px] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] transition-colors text-left"
            >
              Reset to default
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
