'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Contrast, ExternalLink, Laptop, Moon, Smartphone, Sun, Tablet } from 'lucide-react'
import { isFromPreview, type ToPreviewBody } from '@/payload-theme/preview-protocol'
import { CustomPreviewSetup } from './CustomPreviewSetup'

type Source = 'demo' | 'custom'
type Viewport = 'desktop' | 'tablet' | 'mobile'

const DEMO_ROUTES = [
  { label: 'Dashboard', path: '/preview' },
  { label: 'List', path: '/preview/collections/posts' },
  { label: 'Edit', path: '/preview/collections/posts/1' },
  { label: 'Fields', path: '/preview/collections/field-showcase/1' },
  { label: 'Media', path: '/preview/collections/media' },
  { label: 'Settings', path: '/preview/globals/site-settings' },
  { label: 'Gallery', path: '/preview/gallery' },
]

const VIEWPORTS: Record<Viewport, { width: string; icon: typeof Laptop }> = {
  desktop: { width: '100%', icon: Laptop },
  tablet: { width: '820px', icon: Tablet },
  mobile: { width: '390px', icon: Smartphone },
}

const CUSTOM_URL_KEY = 'payloadtwist-custom-preview-url'

function originOf(url: string): string | null {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.origin : null
  } catch {
    return null
  }
}

interface PreviewPanelProps {
  css: string
  theme: 'light' | 'dark'
  enhancedContrast: boolean
  onThemeChange: (theme: 'light' | 'dark') => void
  onContrastChange: (enabled: boolean) => void
}

export function PreviewPanel({ css, theme, enhancedContrast, onThemeChange, onContrastChange }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [source, setSource] = useState<Source>('demo')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [demoSrc, setDemoSrc] = useState('/preview')
  const [path, setPath] = useState('/preview')
  const [customUrl, setCustomUrl] = useState('')
  const [customSrc, setCustomSrc] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Latest state for re-sending whenever the preview (re)announces itself
  const latest = useRef({ css, theme, enhancedContrast })
  useEffect(() => {
    latest.current = { css, theme, enhancedContrast }
  })

  const targetOrigin =
    source === 'demo' ? (typeof window === 'undefined' ? null : window.location.origin) : customSrc ? originOf(customSrc) : null

  const send = useCallback(
    (msg: ToPreviewBody) => {
      const win = iframeRef.current?.contentWindow
      if (win && targetOrigin) win.postMessage({ source: 'payloadtwist', ...msg }, targetOrigin)
    },
    [targetOrigin],
  )

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== targetOrigin) return
      if (!isFromPreview(event.data)) return
      if (event.data.type === 'ready') {
        const s = latest.current
        send({ type: 'css', css: s.css })
        send({ type: 'theme', theme: s.theme })
        send({ type: 'contrast', enabled: s.enhancedContrast })
        setReady(true)
      } else if (event.data.type === 'route') {
        setPath(event.data.path)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [send, targetOrigin])

  useEffect(() => {
    if (ready) send({ type: 'css', css })
  }, [css, ready, send])
  useEffect(() => {
    if (ready) send({ type: 'theme', theme })
  }, [theme, ready, send])
  useEffect(() => {
    if (ready) send({ type: 'contrast', enabled: enhancedContrast })
  }, [enhancedContrast, ready, send])

  const navigate = (to: string) => {
    if (ready) send({ type: 'navigate', path: to })
    else setDemoSrc(to)
  }

  const switchSource = (next: Source) => {
    setReady(false)
    setSource(next)
    if (next === 'custom' && !customUrl) {
      try {
        setCustomUrl(localStorage.getItem(CUSTOM_URL_KEY) ?? '')
      } catch {
        // storage unavailable
      }
    }
  }

  const connect = (e: React.FormEvent) => {
    e.preventDefault()
    if (!originOf(customUrl)) return
    try {
      localStorage.setItem(CUSTOM_URL_KEY, customUrl)
    } catch {
      // storage unavailable
    }
    setReady(false)
    setCustomSrc(customUrl)
  }

  const iframeSrc = source === 'demo' ? demoSrc : customSrc
  // Longest route the current path falls under (so an edit view doesn't also light up "List")
  const activeRoute = DEMO_ROUTES.map((r) => r.path)
    .filter((p) => path === p || (p !== '/preview' && path.startsWith(p + '/')))
    .sort((a, b) => b.length - a.length)[0]
  const btn = (active: boolean) =>
    `px-2.5 py-1 rounded text-[13px] font-medium transition-colors ${
      active ? 'bg-[var(--pt-accent)] text-white' : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:bg-[var(--pt-surface-hover)]'
    }`
  const iconBtn = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active ? 'bg-[var(--pt-surface-active)] text-[var(--pt-text)]' : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:bg-[var(--pt-surface-hover)]'
    }`

  return (
    <div className="flex flex-col h-full bg-[var(--pt-bg)]">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--pt-border)] bg-[var(--pt-surface)] flex-wrap">
        <div className="flex items-center gap-0.5 bg-[var(--pt-bg)] rounded p-0.5" role="tablist" aria-label="Preview source">
          <button role="tab" aria-selected={source === 'demo'} className={btn(source === 'demo')} onClick={() => switchSource('demo')}>
            Demo admin
          </button>
          <button role="tab" aria-selected={source === 'custom'} className={btn(source === 'custom')} onClick={() => switchSource('custom')}>
            Your Payload
          </button>
        </div>

        {source === 'demo' && (
          <nav className="flex items-center gap-0.5" aria-label="Preview pages">
            {DEMO_ROUTES.map((r) => {
              const active = r.path === activeRoute
              return (
                <button key={r.path} className={btn(active)} onClick={() => navigate(r.path)} aria-current={active ? 'page' : undefined}>
                  {r.label}
                </button>
              )
            })}
          </nav>
        )}

        {source === 'custom' && (
          <form onSubmit={connect} className="flex items-center gap-1.5 flex-1 min-w-[16rem]">
            <input
              type="url"
              required
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="http://localhost:3000/admin"
              aria-label="Your Payload admin URL"
              className="flex-1 min-w-0 text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-2 py-1 text-[var(--pt-text)] placeholder:text-[var(--pt-text-faint)] focus:outline-none focus:border-[var(--pt-accent)]"
            />
            <button type="submit" className={btn(false) + ' border border-[var(--pt-border)]'}>
              Connect
            </button>
          </form>
        )}

        <div className="ml-auto flex items-center gap-0.5">
          {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => {
            const Icon = VIEWPORTS[v].icon
            return (
              <button key={v} className={iconBtn(viewport === v)} onClick={() => setViewport(v)} aria-label={`${v} width`} aria-pressed={viewport === v}>
                <Icon size={14} />
              </button>
            )
          })}
          <div className="w-px h-4 bg-[var(--pt-border)] mx-1" />
          <button className={iconBtn(theme === 'light')} onClick={() => onThemeChange('light')} aria-label="Preview light mode" aria-pressed={theme === 'light'}>
            <Sun size={14} />
          </button>
          <button className={iconBtn(theme === 'dark')} onClick={() => onThemeChange('dark')} aria-label="Preview dark mode" aria-pressed={theme === 'dark'}>
            <Moon size={14} />
          </button>
          <button
            className={iconBtn(enhancedContrast)}
            onClick={() => onContrastChange(!enhancedContrast)}
            aria-label="Preview enhanced contrast"
            aria-pressed={enhancedContrast}
            title="Payload's enhanced contrast mode"
          >
            <Contrast size={14} />
          </button>
          {iframeSrc && (
            <a href={source === 'demo' ? path : iframeSrc} target="_blank" rel="noreferrer" className={iconBtn(false)} aria-label="Open preview in a new tab">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex justify-center overflow-auto bg-[var(--pt-surface-alt)]">
        {iframeSrc ? (
          <div className="h-full transition-[width] duration-200" style={{ width: VIEWPORTS[viewport].width, maxWidth: '100%' }}>
            <iframe
              key={`${source}:${iframeSrc}`}
              id="payload-preview"
              ref={iframeRef}
              src={iframeSrc}
              title="Payload admin preview"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        ) : (
          <CustomPreviewSetup />
        )}
        {source === 'custom' && customSrc && !ready && (
          <div className="absolute bottom-6 right-6 max-w-sm text-xs bg-[var(--pt-surface)] border border-[var(--pt-border)] rounded-lg p-3 shadow-lg">
            Waiting for your admin to connect… If nothing happens, make sure the payloadtwist bridge is installed (see setup) and you are logged in.
          </div>
        )}
      </div>
    </div>
  )
}
