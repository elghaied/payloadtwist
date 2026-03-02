'use client'

import { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEditorStore } from '@/store/editor-store'
import { IframePanel } from '@/components/editor/IframePanel'
import { GeneralTab } from '@/components/editor/tabs/GeneralTab'
import { UIElementsTab } from '@/components/editor/tabs/UIElementsTab'
import { FieldsTab } from '@/components/editor/tabs/FieldsTab'
import { ViewsTab } from '@/components/editor/tabs/ViewsTab'
import { DashboardTab } from '@/components/editor/tabs/DashboardTab'
import { OverlaysTab } from '@/components/editor/tabs/OverlaysTab'
import { Undo2, Redo2, Copy, RotateCcw, X, GripVertical, Sun, Moon, Save } from 'lucide-react'
import { EditorUserMenu } from '@/components/auth/UserMenu'
import { useSession } from '@/lib/auth-client'
import { SavePresetDialog } from '@/components/presets/SavePresetDialog'
import { ThemePresetSelector } from '@/components/editor/ThemePresetSelector'
import { getPresetById } from '@/lib/actions/presets'
import { getDefaultTheme } from '@/payload-theme/config'
import { generateExportCSS } from '@/payload-theme/generator'

function EditorLogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ed-s1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="ed-s2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="ed-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="33%" stopColor="#ec4899" />
          <stop offset="66%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d="M 56 56 C 56 90, 90 95, 100 100 C 110 105, 144 110, 144 144" stroke="url(#ed-s2)" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.35" />
      <path d="M 144 56 C 144 90, 110 95, 100 100 C 90 105, 56 110, 56 144" stroke="url(#ed-s1)" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M 100 100 C 110 105, 144 110, 144 144" stroke="url(#ed-s2)" strokeWidth="16" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="100" r="10" style={{ fill: 'var(--pt-surface)' }} />
      <circle cx="100" cy="100" r="7" fill="url(#ed-core)" />
      <circle cx="100" cy="100" r="3" fill="white" />
      <circle cx="144" cy="56" r="6" fill="#ec4899" />
      <circle cx="56" cy="56" r="6" fill="#06b6d4" />
      <circle cx="56" cy="144" r="6" fill="#a855f7" />
      <circle cx="144" cy="144" r="6" fill="#22c55e" />
    </svg>
  )
}

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
  return (
    <Suspense>
      <EditorContent />
    </Suspense>
  )
}

function EditorContent() {
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
  } = useEditorStore()

  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [editorDark, setEditorDark] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [cssPanel, setCssPanel] = useState<{ open: boolean; css: string }>({
    open: false,
    css: '',
  })

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  // Load preset from URL param on mount
  const presetLoaded = useRef(false)
  useEffect(() => {
    const presetId = searchParams.get('preset')
    if (presetId && !presetLoaded.current) {
      presetLoaded.current = true
      getPresetById(presetId).then((preset) => {
        if (preset) importTheme(preset.themeData)
      })
    }
  }, [searchParams, importTheme])

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
  const [panelWidth, setPanelWidth] = useState(420)
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
    <div ref={containerRef} data-editor-theme={editorDark ? 'dark' : 'light'} className="flex h-screen bg-[var(--pt-bg)] text-[var(--pt-text)] overflow-hidden">
        {/* ── Left panel ── */}
        <div style={{ width: panelWidth, minWidth: 260, maxWidth: '50%' }} className="flex-shrink-0">
          <div className="flex flex-col h-full overflow-hidden bg-[var(--pt-surface)] border-r border-[var(--pt-border)]">
            {/* Logo row */}
            <div className="px-4 py-2.5 border-b border-[var(--pt-border)] flex-shrink-0">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <EditorLogoMark size={22} />
                  <h1
                    className="text-sm font-bold tracking-tight"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    payload<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">twist</span>
                  </h1>
                  <span
                    className="text-[9px] text-[var(--pt-text-muted)] bg-[var(--pt-surface-hover)] px-1.5 py-0.5 rounded"
                    style={{ fontFamily: mono }}
                  >
                    v1.0
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                <EditorUserMenu />
                {/* Editor UI theme toggle */}
                <div className="flex items-center bg-[var(--pt-bg)] rounded-full p-0.5" title="Editor theme">
                  <button
                    onClick={() => setEditorDark(false)}
                    className={`p-1.5 rounded-full transition-colors ${
                      !editorDark
                        ? 'bg-[var(--pt-accent)] text-white'
                        : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]'
                    }`}
                    aria-label="Light editor"
                  >
                    <Sun size={12} />
                  </button>
                  <button
                    onClick={() => setEditorDark(true)}
                    className={`p-1.5 rounded-full transition-colors ${
                      editorDark
                        ? 'bg-[var(--pt-accent)] text-white'
                        : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]'
                    }`}
                    aria-label="Dark editor"
                  >
                    <Moon size={12} />
                  </button>
                </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="px-3 py-1.5 border-b border-[var(--pt-border)] flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleCopyCSS}
                className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white rounded-full px-3 py-1.5 transition-all active:scale-[0.97] font-medium"
              >
                <Copy size={12} />
                Export
                {modifiedCount > 0 && (
                  <span className="text-[9px] bg-white/20 text-white px-1.5 rounded-full font-medium" style={{ fontFamily: mono }}>
                    {modifiedCount}
                  </span>
                )}
              </button>
              {session ? (
                <button
                  onClick={() => setSaveDialogOpen(true)}
                  className="flex items-center gap-1.5 text-xs border border-[var(--pt-border)] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:border-[var(--pt-border-strong)] rounded-full px-3 py-1.5 transition-all active:scale-[0.97] font-medium"
                >
                  <Save size={12} />
                  Save
                </button>
              ) : (
                <Link
                  href="/login?callbackUrl=/editor"
                  className="flex items-center gap-1.5 text-xs border border-[var(--pt-border)] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:border-[var(--pt-border-strong)] rounded-full px-3 py-1.5 transition-all font-medium"
                >
                  <Save size={12} />
                  Save
                </Link>
              )}
              <ThemePresetSelector onApply={importTheme} isLoggedIn={!!session} />
              <button
                onClick={handleReset}
                className="p-1.5 rounded hover:bg-[var(--pt-surface-hover)] text-[var(--pt-text-muted)] hover:text-[var(--pt-danger)] transition-colors active:scale-[0.97]"
                title="Reset to defaults"
                aria-label="Reset"
              >
                <RotateCcw size={13} />
              </button>
              <div className="w-px h-4 bg-[var(--pt-border)] mx-0.5" />
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="p-1.5 rounded hover:bg-[var(--pt-surface-hover)] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] transition-colors disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.97]"
                title="Undo"
                aria-label="Undo"
              >
                <Undo2 size={13} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="p-1.5 rounded hover:bg-[var(--pt-surface-hover)] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] transition-colors disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.97]"
                title="Redo"
                aria-label="Redo"
              >
                <Redo2 size={13} />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-0.5 px-2 py-1.5 border-b border-[var(--pt-border)] flex-shrink-0 overflow-x-auto">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`text-[11px] px-2.5 py-1 rounded transition-colors whitespace-nowrap active:scale-[0.97] font-medium ${
                    activeTab === key
                      ? 'bg-[var(--pt-accent)] text-white'
                      : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:bg-[var(--pt-surface-hover)]'
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
              <div className="border-t border-[var(--pt-border)] bg-[var(--pt-bg)] flex-shrink-0">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--pt-border)]">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)]">
                    Generated CSS
                  </span>
                  <button
                    onClick={() => setCssPanel((s) => ({ ...s, open: false }))}
                    className="p-1 rounded hover:bg-[var(--pt-surface-hover)] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] transition-colors"
                    aria-label="Close"
                  >
                    <X size={12} />
                  </button>
                </div>
                <pre
                  className="text-xs text-[var(--pt-code-text)] bg-[var(--pt-code-bg)] p-3 overflow-x-auto overflow-y-auto max-h-48 whitespace-pre"
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
          className="w-[6px] flex-shrink-0 bg-[var(--pt-border)] hover:bg-[var(--pt-accent)]/20 transition-colors cursor-col-resize flex items-center justify-center group"
        >
          <GripVertical size={12} className="text-[var(--pt-text-faint)] group-hover:text-[var(--pt-accent)] transition-colors" />
        </div>

        {/* ── Right panel: iframe preview ── */}
        <div className="flex-1 min-w-0">
          <IframePanel config={config} />
        </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[var(--pt-surface)] border border-[var(--pt-border)] border-l-2 border-l-[var(--pt-accent)] text-[var(--pt-text)] text-xs px-4 py-2 rounded shadow-lg pointer-events-none z-50">
          {toast}
        </div>
      )}

      {/* Save preset dialog */}
      <SavePresetDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        themeData={config}
        onSaved={() => showToast('Preset saved')}
      />
    </div>
  )
}
