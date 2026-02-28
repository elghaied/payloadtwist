'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { getVariablesByCategory } from '@/payload-theme/config'
import { PayloadCSSVariable } from '@/payload-theme/types'
import { generatePayloadCSS, injectIntoIframe } from '@/payload-theme/generator'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rgbToHex(value: string): string {
  const match = value.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (!match) return '#000000'
  return (
    '#' +
    [match[1], match[2], match[3]].map((n) => parseInt(n).toString(16).padStart(2, '0')).join('')
  )
}

function toColorInputValue(value: string): string {
  if (!value) return '#000000'
  if (value.startsWith('rgb(')) return rgbToHex(value)
  if (value.startsWith('#')) return value
  return '#000000'
}

const CATEGORIES = [
  { key: 'base-scale', label: 'Base Color Scale (--color-base-*)' },
  { key: 'theme', label: 'Theme Colors (explicit dark support)' },
  { key: 'status.success', label: 'Success Colors' },
  { key: 'status.warning', label: 'Warning Colors' },
  { key: 'status.error', label: 'Error Colors' },
  { key: 'typography', label: 'Typography' },
  { key: 'layout', label: 'Spacing & Layout' },
] as const

// ─── Variable Row ─────────────────────────────────────────────────────────────

function VariableRow({
  variable,
  currentValue,
  onChange,
}: {
  variable: PayloadCSSVariable
  currentValue: string
  onChange: (varName: string, value: string) => void
}) {
  const isColor = variable.resolvedType === 'color'

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(variable.var, e.target.value)
    },
    [onChange, variable.var],
  )

  return (
    <div className="flex items-center gap-2 py-1 border-b border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0">
        <code className="text-xs text-zinc-300 truncate block">{variable.var}</code>
      </div>
      {isColor ? (
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="color"
            value={toColorInputValue(currentValue)}
            onChange={handleChange}
            className="w-7 h-7 rounded cursor-pointer border border-zinc-600 bg-transparent p-0.5"
            title={currentValue || '(empty)'}
          />
          <input
            type="text"
            value={currentValue}
            onChange={handleChange}
            className="w-28 text-xs bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-zinc-200 font-mono"
            placeholder="e.g. #fff"
          />
        </div>
      ) : (
        <input
          type="text"
          value={currentValue}
          onChange={handleChange}
          className="w-36 text-xs bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-zinc-200 font-mono shrink-0"
          placeholder="value"
        />
      )}
    </div>
  )
}

// ─── Category Section ──────────────────────────────────────────────────────────

function CategorySection({
  categoryKey,
  label,
  lightState,
  onChangeLight,
}: {
  categoryKey: string
  label: string
  lightState: Record<string, string>
  onChangeLight: (varName: string, value: string) => void
}) {
  const [open, setOpen] = useState(true)
  const vars = getVariablesByCategory(categoryKey).filter((v) => v.overridable)

  if (vars.length === 0) return null

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left flex items-center justify-between py-1 px-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium text-zinc-200 transition-colors"
      >
        <span>{label}</span>
        <span className="text-zinc-500 text-xs">
          {vars.length} vars {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="mt-1 px-2">
          {vars.map((v) => (
            <VariableRow
              key={v.var}
              variable={v}
              currentValue={lightState[v.var] ?? ''}
              onChange={onChangeLight}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TestThemePage() {
  const { config, setVariable, resetTheme, canUndo, canRedo, undo, redo } = useEditorStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [cssOutput, setCssOutput] = useState('')
  const [copied, setCopied] = useState(false)

  // Inject on every config change
  useEffect(() => {
    injectIntoIframe(config)
  }, [config])

  // Re-inject after iframe navigation (Payload navigates within the iframe)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const onLoad = () => injectIntoIframe(config)
    iframe.addEventListener('load', onLoad)
    return () => iframe.removeEventListener('load', onLoad)
  }, [config])

  const handleCopyCSS = useCallback(() => {
    const css = generatePayloadCSS(config)
    setCssOutput(css)
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [config])

  const handleChangeLight = useCallback(
    (varName: string, value: string) => {
      setVariable(varName, value, 'light')
    },
    [setVariable],
  )

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Left panel ── */}
      <div className="w-96 flex-shrink-0 flex flex-col border-r border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-zinc-100">TweakPayload</h1>
          <span className="text-xs text-zinc-500">Theme Editor</span>
        </div>

        {/* Action bar */}
        <div className="px-3 py-2 border-b border-zinc-800 flex gap-2">
          <button
            onClick={handleCopyCSS}
            className="flex-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded px-2 py-1 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy CSS'}
          </button>
          <button
            onClick={resetTheme}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded px-2 py-1 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded px-2 py-1 transition-colors disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded px-2 py-1 transition-colors disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            ↪
          </button>
        </div>

        {/* Variable list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {CATEGORIES.map(({ key, label }) => (
            <CategorySection
              key={key}
              categoryKey={key}
              label={label}
              lightState={config.light}
              onChangeLight={handleChangeLight}
            />
          ))}
        </div>

        {/* CSS output textarea */}
        {cssOutput && (
          <div className="border-t border-zinc-800 p-2">
            <textarea
              readOnly
              value={cssOutput}
              className="w-full h-40 text-xs bg-zinc-900 border border-zinc-700 rounded p-2 font-mono text-zinc-300 resize-none"
              placeholder="Click 'Copy CSS' to generate output"
            />
          </div>
        )}
      </div>

      {/* ── Right panel: iframe preview ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Preview:</span>
          <span className="text-xs text-zinc-400 font-mono">/admin</span>
        </div>
        <iframe
          id="payload-preview"
          ref={iframeRef}
          src="/admin"
          className="flex-1 w-full border-0"
          title="Payload Admin Preview"
        />
      </div>
    </div>
  )
}
