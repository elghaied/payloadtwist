'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { injectIntoIframe } from '@/payload-theme/generator'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { Sun, Moon, RotateCcw, ExternalLink } from 'lucide-react'

type PreviewTab = 'admin' | 'showcase' | 'custom'

const PREVIEW_TABS: { key: PreviewTab; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'showcase', label: 'Showcase' },
  { key: 'custom', label: 'Custom' },
]

function getTabUrl(tab: PreviewTab, customUrl: string): string {
  switch (tab) {
    case 'admin':
      return '/admin'
    case 'showcase':
      return '/admin/showcase'
    case 'custom':
      return customUrl || '/admin'
  }
}

interface IframePanelProps {
  config: PayloadThemeConfig
}

export function IframePanel({ config }: IframePanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isDark, setIsDark] = useState(false)
  const [activeTab, setActiveTab] = useState<PreviewTab>('admin')
  const [customUrl, setCustomUrl] = useState('')
  const [customInput, setCustomInput] = useState('')

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

  const navigateIframe = useCallback((url: string) => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.src = url
  }, [])

  const handleReload = useCallback(() => {
    navigateIframe(getTabUrl(activeTab, customUrl))
  }, [navigateIframe, activeTab, customUrl])

  const handleTabChange = useCallback(
    (tab: PreviewTab) => {
      setActiveTab(tab)
      if (tab !== 'custom') {
        navigateIframe(getTabUrl(tab, customUrl))
      } else if (customUrl) {
        navigateIframe(customUrl)
      }
    },
    [navigateIframe, customUrl],
  )

  const handleCustomSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const url = customInput.trim()
      if (!url) return
      setCustomUrl(url)
      navigateIframe(url)
    },
    [customInput, navigateIframe],
  )

  const currentUrl = getTabUrl(activeTab, customUrl)

  return (
    <div className="h-full min-w-0 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-2 py-1 bg-[#F8F7F5] border-b border-[#E5E2DC] flex-shrink-0">
        {PREVIEW_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`text-[11px] px-2.5 py-1 rounded transition-colors whitespace-nowrap active:scale-[0.97] font-medium ${
              activeTab === key
                ? 'bg-[#5B6CF0] text-white'
                : 'text-[#78726C] hover:text-[#1C1917] hover:bg-[#F0EDE8]'
            }`}
          >
            {key === 'custom' && <ExternalLink size={10} className="inline mr-1 -mt-px" />}
            {label}
          </button>
        ))}
      </div>

      {/* Custom URL input (only when custom tab active) */}
      {activeTab === 'custom' && (
        <form
          onSubmit={handleCustomSubmit}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-[#F8F7F5] border-b border-[#E5E2DC] flex-shrink-0"
        >
          <input
            type="url"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="https://your-payload-admin.com/admin"
            className="flex-1 text-[11px] px-2 py-1 rounded border border-[#E5E2DC] bg-white text-[#1C1917] placeholder-[#B8B4AE] focus:outline-none focus:border-[#5B6CF0] focus:ring-1 focus:ring-[#5B6CF0]/20"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          <button
            type="submit"
            className="text-[11px] px-2.5 py-1 rounded bg-[#5B6CF0] hover:bg-[#4A5AD9] text-white font-medium transition-colors active:scale-[0.97]"
          >
            Go
          </button>
        </form>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#F8F7F5] border-b border-[#E5E2DC] flex-shrink-0">
        <span
          className="text-[11px] text-[#78726C] truncate"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {activeTab === 'custom' && customUrl ? customUrl : currentUrl}
        </span>
        <div className="flex items-center gap-0.5 flex-shrink-0">
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
