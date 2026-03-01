'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { IframePanel } from '@/components/editor/IframePanel'
import { GeneralTab } from '@/components/editor/tabs/GeneralTab'
import { UIElementsTab } from '@/components/editor/tabs/UIElementsTab'
import { FieldsTab } from '@/components/editor/tabs/FieldsTab'
import { ViewsTab } from '@/components/editor/tabs/ViewsTab'
import { DashboardTab } from '@/components/editor/tabs/DashboardTab'
import { OverlaysTab } from '@/components/editor/tabs/OverlaysTab'
import { Undo2, Redo2, Copy, RotateCcw, X, GripVertical } from 'lucide-react'
import { getDefaultTheme } from '@/payload-theme/config'
import { generateExportCSS } from '@/payload-theme/generator'

type Tab = 'general' | 'ui-elements' | 'fields' | 'views' | 'dashboard' | 'overlays'

const TABS: { key: Tab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'ui-elements', label: 'UI Elements' },
  { key: 'fields', label: 'Fields' },
  { key: 'views', label: 'Views' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'overlays', label: 'Overlays' },
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
    setComponentOverride,
    resetComponentOverrides,
  } = useEditorStore()

  const [activeTab, setActiveTab] = useState<Tab>('general')
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
    const css = generateExportCSS(config)
    try {
      await navigator.clipboard.writeText(css)
      showToast('CSS copied — paste into your custom.scss')
    } catch {
      showToast('Copy failed — see panel below')
    }
    setCssPanel({ open: true, css })
  }, [config, showToast])

  const handleReset = useCallback(() => {
    resetTheme()
    showToast('Theme reset to defaults')
  }, [resetTheme, showToast])

  const mono = "'JetBrains Mono', monospace"

  // ── Custom resizable panel logic ──
  const [panelWidth, setPanelWidth] = useState(340)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const clamped = Math.max(260, Math.min(x, rect.width * 0.5))
      setPanelWidth(clamped)
    }
    const onMouseUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      // re-enable iframe pointer events
      const iframe = document.getElementById('payload-preview') as HTMLIFrameElement | null
      if (iframe) iframe.style.pointerEvents = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    // disable iframe pointer events while dragging so mousemove works
    const iframe = document.getElementById('payload-preview') as HTMLIFrameElement | null
    if (iframe) iframe.style.pointerEvents = 'none'
  }, [])

  return (
    <div ref={containerRef} className="flex h-screen bg-[#F8F7F5] text-[#1C1917] overflow-hidden">
        {/* ── Left panel ── */}
        <div style={{ width: panelWidth, minWidth: 260, maxWidth: '50%' }} className="flex-shrink-0">
          <div className="flex flex-col h-full overflow-hidden bg-white border-r border-[#E5E2DC]">
            {/* Logo row */}
            <div className="px-4 py-3 border-b border-[#E5E2DC] flex-shrink-0">
              <div className="flex items-center gap-2">
                {/* Geometric accent logo */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" rx="3" fill="#5B6CF0" />
                  <rect x="4" y="4" width="8" height="8" rx="1.5" fill="#FFFFFF" />
                </svg>
                <h1 className="text-sm font-semibold text-[#1C1917] tracking-tight">
                  payloadtwist
                </h1>
                <span
                  className="text-[9px] text-[#78726C] bg-[#F0EDE8] px-1.5 py-0.5 rounded"
                  style={{ fontFamily: mono }}
                >
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-[#78726C] mt-0.5 ml-6 tracking-wide uppercase">
                Payload CSS Editor
              </p>
            </div>

            {/* Action bar */}
            <div className="px-3 py-1.5 border-b border-[#E5E2DC] flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleCopyCSS}
                className="flex items-center gap-1.5 text-xs bg-[#5B6CF0] hover:bg-[#4A5AD9] text-white rounded px-2.5 py-1.5 transition-colors active:scale-[0.97] font-medium"
              >
                <Copy size={12} />
                Export
                {modifiedCount > 0 && (
                  <span className="text-[9px] bg-white/20 text-white px-1.5 rounded-full font-medium" style={{ fontFamily: mono }}>
                    {modifiedCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded hover:bg-[#F0EDE8] text-[#78726C] hover:text-[#E5484D] transition-colors active:scale-[0.97]"
                title="Reset to defaults"
                aria-label="Reset"
              >
                <RotateCcw size={13} />
              </button>
              <div className="w-px h-4 bg-[#E5E2DC] mx-0.5" />
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="p-1.5 rounded hover:bg-[#F0EDE8] text-[#78726C] hover:text-[#1C1917] transition-colors disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.97]"
                title="Undo"
                aria-label="Undo"
              >
                <Undo2 size={13} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="p-1.5 rounded hover:bg-[#F0EDE8] text-[#78726C] hover:text-[#1C1917] transition-colors disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.97]"
                title="Redo"
                aria-label="Redo"
              >
                <Redo2 size={13} />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-0.5 px-2 py-1.5 border-b border-[#E5E2DC] flex-shrink-0 overflow-x-auto">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`text-[11px] px-2.5 py-1 rounded transition-colors whitespace-nowrap active:scale-[0.97] font-medium ${
                    activeTab === key
                      ? 'bg-[#5B6CF0] text-white'
                      : 'text-[#78726C] hover:text-[#1C1917] hover:bg-[#F0EDE8]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Scrollable tab content */}
            <div className="flex-1 overflow-y-auto panel-scroll min-h-0">
              <div className="p-3">
                {activeTab === 'general' && (
                  <GeneralTab
                    config={config}
                    setVariable={setVariable}
                    setBaseScale={setBaseScale}
                    setBaseRadius={setBaseRadius}
                    importTheme={importTheme}
                    resetTheme={resetTheme}
                  />
                )}
                {activeTab === 'ui-elements' && (
                  <UIElementsTab config={config} setComponentOverride={setComponentOverride} />
                )}
                {activeTab === 'fields' && (
                  <FieldsTab config={config} setComponentOverride={setComponentOverride} />
                )}
                {activeTab === 'views' && (
                  <ViewsTab config={config} setComponentOverride={setComponentOverride} />
                )}
                {activeTab === 'dashboard' && (
                  <DashboardTab config={config} setComponentOverride={setComponentOverride} />
                )}
                {activeTab === 'overlays' && (
                  <OverlaysTab config={config} setComponentOverride={setComponentOverride} />
                )}
              </div>
            </div>

            {/* CSS slide-up panel */}
            {cssPanel.open && (
              <div className="border-t border-[#E5E2DC] bg-[#F8F7F5] flex-shrink-0">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#E5E2DC]">
                  <span className="text-[10px] uppercase tracking-wider text-[#78726C]">
                    Generated CSS
                  </span>
                  <button
                    onClick={() => setCssPanel((s) => ({ ...s, open: false }))}
                    className="p-1 rounded hover:bg-[#F0EDE8] text-[#78726C] hover:text-[#1C1917] transition-colors"
                    aria-label="Close"
                  >
                    <X size={12} />
                  </button>
                </div>
                <pre
                  className="text-xs text-[#1C1917] p-3 overflow-x-auto overflow-y-auto max-h-48 whitespace-pre"
                  style={{ fontFamily: mono }}
                >
                  {cssPanel.css || '/* No changes from defaults */'}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={onDragStart}
          className="w-[6px] flex-shrink-0 bg-[#E5E2DC] hover:bg-[#5B6CF0]/20 transition-colors cursor-col-resize flex items-center justify-center group"
        >
          <GripVertical size={12} className="text-[#B8B4AE] group-hover:text-[#5B6CF0] transition-colors" />
        </div>

        {/* ── Right panel: iframe preview ── */}
        <div className="flex-1 min-w-0">
          <IframePanel config={config} />
        </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-[#E5E2DC] border-l-2 border-l-[#5B6CF0] text-[#1C1917] text-xs px-4 py-2 rounded shadow-lg pointer-events-none z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
