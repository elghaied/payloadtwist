'use client'

import { useState, useCallback, useMemo } from 'react'
import { useEditorStore } from '@/store/editor-store'

import { PaletteSelector } from '../../../components/editor/PaletteSelector'
import { BaseScaleEditor } from '../../../components/editor/BaseScaleEditor'
import { ThemeColorsSection } from '../../../components/editor/ThemeColorsSection'
import { StatusColorsSection } from '../../../components/editor/StatusColorsSection'
import { TypographySection } from '../../../components/editor/TypographySection'
import { LayoutSection } from '../../../components/editor/LayoutSection'
import { PaletteEditor } from '../../../components/editor/PaletteEditor'
import { BemTab } from '../../../components/editor/BemTab'
import { IframePanel } from '../../../components/editor/IframePanel'
import { Undo2, Redo2, X, Copy, RotateCcw } from 'lucide-react'
import { getDefaultTheme } from '@/payload-theme/config'
import { generateMinimalPayloadCSS } from '@/payload-theme/generator'

type Tab = 'colors' | 'status' | 'typography' | 'layout' | 'bem'

const TABS: { key: Tab; label: string }[] = [
  { key: 'colors', label: 'Colors' },
  { key: 'status', label: 'Status' },
  { key: 'typography', label: 'Type' },
  { key: 'layout', label: 'Layout' },
  { key: 'bem', label: 'BEM' },
]

function countModifiedVars(
  config: { light: Record<string, string>; dark: Record<string, string> },
  defaults: { light: Record<string, string>; dark: Record<string, string> },
): number {
  let count = 0
  for (const [k, v] of Object.entries(config.light)) {
    if (v !== (defaults.light[k] ?? '')) count++
  }
  for (const [k, v] of Object.entries(config.dark)) {
    if (v !== (defaults.dark[k] ?? '')) count++
  }
  return count
}

export default function EditorPage() {
  const {
    config,
    setVariable,
    setBaseScale,
    setBaseRadius,
    resetTheme,
    importTheme,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore()

  const [activeTab, setActiveTab] = useState<Tab>('colors')
  const [toast, setToast] = useState<string | null>(null)
  const [cssPanel, setCssPanel] = useState<{ open: boolean; css: string }>({
    open: false,
    css: '',
  })

  const defaults = useMemo(() => getDefaultTheme(), [])
  const modifiedCount = useMemo(() => countModifiedVars(config, defaults), [config, defaults])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const handleCopyCSS = useCallback(async () => {
    const css = generateMinimalPayloadCSS(config)
    try {
      await navigator.clipboard.writeText(css)
      showToast('Copied to clipboard')
    } catch {
      showToast('Copy failed — see panel below')
    }
    setCssPanel({ open: true, css })
  }, [config, showToast])

  const handleReset = useCallback(() => {
    resetTheme()
    showToast('Theme reset to defaults')
  }, [resetTheme, showToast])

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Left panel ── */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-zinc-800/80 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-zinc-950" />
            </div>
            <h1
              className="text-sm font-semibold text-zinc-100 tracking-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Repaint
            </h1>
          </div>
          <p
            className="text-[10px] text-zinc-500 mt-0.5 ml-7 tracking-wide uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Payload Theme Editor
          </p>
        </div>

        {/* Action row */}
        <div className="px-3 py-1.5 border-b border-zinc-800/80 flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleCopyCSS}
            className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded px-2.5 py-1.5 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Copy size={12} className="text-zinc-400" />
            Copy CSS
            {modifiedCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse" />
            )}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Reset to defaults"
            aria-label="Reset"
          >
            <RotateCcw size={13} />
          </button>
          <div className="w-px h-4 bg-zinc-800 mx-0.5" />
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            title="Undo"
            aria-label="Undo"
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            title="Redo"
            aria-label="Redo"
          >
            <Redo2 size={13} />
          </button>
          {modifiedCount > 0 && (
            <span
              className="ml-auto text-[10px] text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded-full tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {modifiedCount}
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-zinc-800/80 flex-shrink-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 text-xs py-2 transition-colors relative ${
                activeTab === key ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: activeTab === key ? 500 : 400,
              }}
            >
              {label}
              {activeTab === key && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable tab content (hidden when BEM tab active — BemTab manages its own layout) */}
        {activeTab !== 'bem' && (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-3">
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <PaletteSelector onApply={importTheme} onReset={resetTheme} />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] uppercase tracking-widest text-zinc-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Fine-Tune Base Scale
                      </span>
                      <div className="flex-1 h-px bg-zinc-800/80" />
                    </div>
                    <p
                      className="text-[10px] text-zinc-500 mb-3"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Manual overrides — applied after palette
                    </p>
                    <BaseScaleEditor
                      config={config}
                      setBaseScale={setBaseScale}
                      setVariable={setVariable}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-[10px] uppercase tracking-widest text-zinc-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        General Palette
                      </span>
                      <div className="flex-1 h-px bg-zinc-800/80" />
                    </div>
                    <PaletteEditor config={config} setBaseScale={setBaseScale} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-[10px] uppercase tracking-widest text-zinc-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Theme Colors
                      </span>
                      <div className="flex-1 h-px bg-zinc-800/80" />
                    </div>
                    <ThemeColorsSection config={config} setVariable={setVariable} />
                  </div>
                </div>
              )}

              {activeTab === 'status' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] uppercase tracking-widest text-zinc-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Status Colors
                    </span>
                    <div className="flex-1 h-px bg-zinc-800/80" />
                  </div>
                  <StatusColorsSection config={config} setVariable={setVariable} />
                </div>
              )}

              {activeTab === 'typography' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] uppercase tracking-widest text-zinc-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Typography
                    </span>
                    <div className="flex-1 h-px bg-zinc-800/80" />
                  </div>
                  <TypographySection config={config} setVariable={setVariable} />
                </div>
              )}

              {activeTab === 'layout' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] uppercase tracking-widest text-zinc-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Spacing & Layout
                    </span>
                    <div className="flex-1 h-px bg-zinc-800/80" />
                  </div>
                  <LayoutSection
                    config={config}
                    setVariable={setVariable}
                    setBaseRadius={setBaseRadius}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* BEM tab — full-height layout, manages its own scroll */}
        {activeTab === 'bem' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <BemTab config={config} />
          </div>
        )}

        {/* CSS slide-up panel */}
        {cssPanel.open && (
          <div className="border-t border-zinc-700/50 bg-zinc-900 flex-shrink-0">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800/50">
              <span
                className="text-[10px] uppercase tracking-wider text-zinc-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Generated CSS
              </span>
              <button
                onClick={() => setCssPanel((s) => ({ ...s, open: false }))}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>
            <pre
              className="text-xs text-zinc-300 p-3 overflow-x-auto overflow-y-auto max-h-48 whitespace-pre"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {cssPanel.css || '/* No changes from defaults */'}
            </pre>
          </div>
        )}
      </div>

      {/* ── Right panel: iframe preview ── */}
      <IframePanel config={config} />

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700/50 text-zinc-200 text-xs px-4 py-2 rounded shadow-lg pointer-events-none z-50"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
