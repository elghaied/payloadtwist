'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Download, GripVertical, Moon, Redo2, RotateCcw, Save, Sun, Undo2 } from 'lucide-react'
import { EditorUserMenu } from '@/components/auth/UserMenu'
import { ExportDialog } from '@/components/editor/ExportDialog'
import { PreviewPanel } from '@/components/editor/PreviewPanel'
import { AdvancedSection } from '@/components/editor/sections/AdvancedSection'
import { ComponentsSection } from '@/components/editor/sections/ComponentsSection'
import { CssSection } from '@/components/editor/sections/CssSection'
import { PaletteSection } from '@/components/editor/sections/PaletteSection'
import { ShapeSection } from '@/components/editor/sections/ShapeSection'
import { SurfacesSection } from '@/components/editor/sections/SurfacesSection'
import { TypeSection } from '@/components/editor/sections/TypeSection'
import { LogoMark } from '@/components/Logo'
import { SavePresetDialog } from '@/components/presets/SavePresetDialog'
import { getPresetById } from '@/lib/actions/presets'
import { useSession } from '@/lib/auth-client'
import { buildThemeCss } from '@/payload-theme/css'
import { selectCanRedo, selectCanUndo, useEditorStore } from '@/store/editor-store'

const TABS = [
  { key: 'palette', label: 'Palette' },
  { key: 'surfaces', label: 'Surfaces' },
  { key: 'shape', label: 'Shape' },
  { key: 'type', label: 'Type' },
  { key: 'components', label: 'Components' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'css', label: 'CSS' },
] as const
type Tab = (typeof TABS)[number]['key']

const CHROME_KEY = 'payloadtwist-editor-chrome'
const chromeListeners = new Set<() => void>()

/** Editor chrome theme: light by default, the user's choice remembered across visits. */
function useEditorChromeDark(): [boolean, (update: (dark: boolean) => boolean) => void] {
  const stored = useSyncExternalStore(
    (cb) => {
      chromeListeners.add(cb)
      return () => chromeListeners.delete(cb)
    },
    () => {
      try {
        return localStorage.getItem(CHROME_KEY)
      } catch {
        return null
      }
    },
    () => null,
  )
  const dark = stored === 'dark'
  const set = (update: (dark: boolean) => boolean) => {
    try {
      localStorage.setItem(CHROME_KEY, update(dark) ? 'dark' : 'light')
    } catch {
      // storage unavailable: the toggle still can't persist, but nothing breaks
    }
    chromeListeners.forEach((cb) => cb())
  }
  return [dark, set]
}

export default function EditorPage() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  )
}

function Editor() {
  const theme = useEditorStore((s) => s.theme)
  const previewTheme = useEditorStore((s) => s.previewTheme)
  const enhancedContrast = useEditorStore((s) => s.enhancedContrast)
  const canUndo = useEditorStore(selectCanUndo)
  const canRedo = useEditorStore(selectCanRedo)
  const { undo, redo, resetTheme, loadTheme, setPreviewTheme, setEnhancedContrast } = useEditorStore.getState()

  const [tab, setTab] = useState<Tab>('palette')
  const [editorDark, setEditorDark] = useEditorChromeDark()
  const [exportOpen, setExportOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // An owned preset opened via ?preset= — Save updates it instead of creating a copy
  const [ownPreset, setOwnPreset] = useState<{ id: string; name: string; description: string | null; isPublic: boolean } | null>(null)
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  const css = useMemo(() => buildThemeCss(theme), [theme])
  const overrideCount =
    Object.keys(theme.ramps).length +
    Object.keys(theme.light).length +
    Object.keys(theme.dark).length +
    Object.values(theme.components).reduce((n, c) => n + Object.keys(c.light ?? {}).length + Object.keys(c.dark ?? {}).length, 0)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }, [])

  // ?preset=<id> opens a saved preset (validated by loadTheme)
  const loadedPreset = useRef<string | null>(null)
  useEffect(() => {
    const id = searchParams.get('preset')
    if (!id || loadedPreset.current === id) return
    loadedPreset.current = id
    getPresetById(id)
      .then((preset) => {
        if (!preset) return showToast('Preset not found')
        // Someone else's custom CSS is never auto-applied: it would run inside a connected admin
        const foreignCss = !preset.isOwner && !!preset.themeData.customCss?.trim()
        setOwnPreset(preset.isOwner ? { id: preset.id, name: preset.name, description: preset.description, isPublic: preset.isPublic } : null)
        loadTheme(foreignCss ? { ...preset.themeData, customCss: '' } : preset.themeData)
        showToast(
          foreignCss
            ? `Loaded “${preset.name}” without its custom CSS (review it on the preset page)`
            : `Loaded “${preset.name}”`,
        )
      })
      .catch(() => showToast('This preset was made for an older Payload version'))
  }, [searchParams, loadTheme, showToast])

  // Keyboard: ⌘/Ctrl+Z undo, ⇧ for redo (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, [contenteditable]')) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Resizable editor panel
  const [panelWidth, setPanelWidth] = useState(430)
  const containerRef = useRef<HTMLDivElement>(null)
  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault()
    const iframe = document.getElementById('payload-preview')
    if (iframe) iframe.style.pointerEvents = 'none'
    const move = (ev: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) setPanelWidth(Math.max(320, Math.min(ev.clientX - rect.left, rect.width * 0.55)))
    }
    const up = () => {
      if (iframe) iframe.style.pointerEvents = ''
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const iconBtn =
    'p-1.5 rounded text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:bg-[var(--pt-surface-hover)] transition-colors disabled:opacity-25 disabled:cursor-not-allowed'

  return (
    <div
      id="main-content"
      ref={containerRef}
      data-editor-theme={editorDark ? 'dark' : 'light'}
      className="flex h-screen bg-[var(--pt-bg)] text-[var(--pt-text)] overflow-hidden"
    >
      <aside style={{ width: panelWidth }} className="flex-shrink-0 flex flex-col h-full bg-[var(--pt-surface)] border-r border-[var(--pt-border)]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--pt-border)]">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LogoMark size={22} />
            <span className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              payload
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">twist</span>
            </span>
            <span className="text-xs font-mono text-[var(--pt-text-muted)] bg-[var(--pt-surface-hover)] px-1.5 py-0.5 rounded">
              Payload v4
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <EditorUserMenu />
            <button className={iconBtn} onClick={() => setEditorDark((d) => !d)} aria-label={editorDark ? 'Switch editor to light' : 'Switch editor to dark'} title="Editor theme (does not affect your Payload theme)">
              {editorDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--pt-border)]">
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 text-xs text-white rounded-full px-3 py-1.5 font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 transition-all active:scale-[0.97]"
          >
            <Download size={12} />
            Export
            {overrideCount > 0 && <span className="text-xs font-mono bg-white/20 px-1.5 rounded-full">{overrideCount}</span>}
          </button>
          {session ? (
            <button
              onClick={() => setSaveOpen(true)}
              className="flex items-center gap-1.5 text-xs border border-[var(--pt-border)] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:border-[var(--pt-border-strong)] rounded-full px-3 py-1.5 font-medium"
            >
              <Save size={12} /> Save
            </button>
          ) : (
            <Link
              href="/login?callbackUrl=/editor"
              className="flex items-center gap-1.5 text-xs border border-[var(--pt-border)] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] rounded-full px-3 py-1.5 font-medium"
            >
              <Save size={12} /> Save
            </Link>
          )}
          <div className="ml-auto flex items-center">
            <button className={iconBtn} onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (⌘Z)">
              <Undo2 size={13} />
            </button>
            <button className={iconBtn} onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (⇧⌘Z)">
              <Redo2 size={13} />
            </button>
            <button
              className={iconBtn}
              onClick={() => {
                resetTheme()
                showToast('Reset to Payload defaults — undo to restore')
              }}
              aria-label="Reset theme"
              title="Reset to Payload defaults"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        <div className="flex gap-0.5 px-2 py-1.5 border-b border-[var(--pt-border)] overflow-x-auto" role="tablist" aria-label="Editor sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`text-[13px] px-2 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'bg-[var(--pt-accent)] text-white'
                  : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:bg-[var(--pt-surface-hover)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto panel-scroll p-4" role="tabpanel">
          {tab === 'palette' && <PaletteSection theme={theme} />}
          {tab === 'surfaces' && <SurfacesSection theme={theme} />}
          {tab === 'shape' && <ShapeSection theme={theme} />}
          {tab === 'type' && <TypeSection theme={theme} />}
          {tab === 'components' && <ComponentsSection theme={theme} />}
          {tab === 'advanced' && <AdvancedSection theme={theme} />}
          {tab === 'css' && <CssSection theme={theme} css={css} />}
        </div>
      </aside>

      <div
        onPointerDown={startDrag}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor panel"
        className="w-[6px] flex-shrink-0 bg-[var(--pt-border)] hover:bg-[var(--pt-accent)]/20 cursor-col-resize flex items-center justify-center group"
      >
        <GripVertical size={12} className="text-[var(--pt-text-faint)] group-hover:text-[var(--pt-accent)]" />
      </div>

      <main className="flex-1 min-w-0">
        <PreviewPanel
          css={css}
          theme={previewTheme}
          enhancedContrast={enhancedContrast}
          onThemeChange={setPreviewTheme}
          onContrastChange={setEnhancedContrast}
        />
      </main>

      {toast && (
        <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[var(--pt-surface)] border border-[var(--pt-border)] border-l-2 border-l-[var(--pt-accent)] text-xs px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} theme={theme} css={css} />
      <SavePresetDialog
        key={ownPreset?.id ?? 'new'}
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        themeData={theme}
        existingPreset={ownPreset}
        onSaved={() => showToast(ownPreset ? 'Preset updated' : 'Preset saved')}
      />
    </div>
  )
}
