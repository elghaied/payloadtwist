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

  useEffect(() => {
    injectIntoIframe(config)
  }, [config])

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

      iframeHtml.setAttribute('data-theme', dark ? 'dark' : 'light')
      injectIntoIframe(config)
    },
    [config],
  )

  const handleSetLight = useCallback(() => {
    setIsDark(false)
    applyThemeMode(false)
  }, [applyThemeMode])

  const handleSetDark = useCallback(() => {
    setIsDark(true)
    applyThemeMode(true)
  }, [applyThemeMode])

  const handleReload = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.src = '/admin'
  }, [])

  return (
    <div className="h-full min-w-0 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#F8F7F5] border-b border-[#E5E2DC] flex-shrink-0">
        <span
          className="text-[11px] text-[#78726C]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          /admin
        </span>
        <div className="flex items-center gap-0.5">
          {/* Light mode button */}
          <button
            onClick={handleSetLight}
            className={`p-1.5 rounded transition-colors ${
              !isDark
                ? 'bg-[#5B6CF0] text-white'
                : 'text-[#78726C] hover:text-[#1C1917] hover:bg-[#F0EDE8]'
            }`}
            title="Light mode"
            aria-label="Switch to light mode"
          >
            <Sun size={13} />
          </button>
          {/* Dark mode button */}
          <button
            onClick={handleSetDark}
            className={`p-1.5 rounded transition-colors ${
              isDark
                ? 'bg-[#5B6CF0] text-white'
                : 'text-[#78726C] hover:text-[#1C1917] hover:bg-[#F0EDE8]'
            }`}
            title="Dark mode"
            aria-label="Switch to dark mode"
          >
            <Moon size={13} />
          </button>
          <div className="w-px h-4 bg-[#E5E2DC] mx-1" />
          <button
            onClick={handleReload}
            className="p-1.5 rounded hover:bg-[#F0EDE8] transition-colors text-[#78726C] hover:text-[#1C1917]"
            title="Reload preview"
            aria-label="Reload preview"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <iframe
        id="payload-preview"
        ref={iframeRef}
        src="/admin"
        className="flex-1 w-full min-w-0 border-0 bg-white"
        title="Payload Admin Preview"
      />
    </div>
  )
}
