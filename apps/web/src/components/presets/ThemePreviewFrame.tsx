'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { buildThemeCss } from '@/payload-theme/css'
import { isFromPreview } from '@/payload-theme/preview-protocol'
import type { ThemeConfig } from '@/payload-theme/theme'

/** The embedded demo admin with a theme applied — for browsing presets. */
export function ThemePreviewFrame({ theme, path = '/preview' }: { theme: ThemeConfig; path?: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  // Shared presets render without their custom CSS (it is shown, not executed, elsewhere)
  const css = useMemo(() => buildThemeCss({ ...theme, customCss: '' }), [theme])
  const latest = useRef({ css, mode })
  useEffect(() => {
    latest.current = { css, mode }
  })

  const send = (msg: object) => ref.current?.contentWindow?.postMessage({ source: 'payloadtwist', ...msg }, window.location.origin)

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow || e.origin !== window.location.origin) return
      if (isFromPreview(e.data) && e.data.type === 'ready') {
        send({ type: 'css', css: latest.current.css })
        send({ type: 'theme', theme: latest.current.mode })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    send({ type: 'theme', theme: mode })
  }, [mode])
  useEffect(() => {
    send({ type: 'css', css })
  }, [css])

  return (
    <div className="rounded-xl border border-[var(--lp-border)] overflow-hidden bg-[var(--lp-surface)]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--lp-border)]">
        <span className="text-xs text-[var(--lp-text-muted)]">Live preview — Payload v4 admin</span>
        <div className="flex gap-1">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              aria-label={`${m} mode`}
              className={`p-1.5 rounded ${mode === m ? 'bg-[var(--lp-surface-2)] text-[var(--lp-text)]' : 'text-[var(--lp-text-muted)]'}`}
            >
              {m === 'light' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          ))}
        </div>
      </div>
      <iframe ref={ref} src={path} title="Theme preview" className="w-full h-[32rem] border-0 bg-white" loading="lazy" />
    </div>
  )
}
