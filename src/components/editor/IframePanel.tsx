'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { injectIntoIframe } from '@/payload-theme/generator'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { Sun, Moon, RotateCcw } from 'lucide-react'

interface IframePanelProps {
  config: PayloadThemeConfig
}

export function IframePanel({ config }: IframePanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isDark, setIsDark] = useState(false)

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

  const applyThemeMode = useCallback(
    (dark: boolean) => {
      const iframe = iframeRef.current
      const iframeHtml = iframe?.contentDocument?.documentElement
      if (!iframeHtml) return

      if (dark) {
        iframeHtml.setAttribute('data-theme', 'dark')
      } else {
        iframeHtml.setAttribute('data-theme', 'light')
      }
      injectIntoIframe(config)
    },
    [config],
  )

  const handleDarkToggle = useCallback(() => {
    const next = !isDark
    setIsDark(next)
    applyThemeMode(next)
  }, [isDark, applyThemeMode])

  const handleReload = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.src = '/admin'
  }, [])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
        <span className="text-xs text-zinc-400 font-mono">/admin</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDarkToggle}
            className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={handleReload}
            className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            title="Reload preview"
            aria-label="Reload preview"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <iframe
        id="payload-preview"
        ref={iframeRef}
        src="/admin"
        className="flex-1 w-full border-0"
        title="Payload Admin Preview"
      />
    </div>
  )
}
