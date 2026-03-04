'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { injectIntoIframe, setIframeTheme } from '@/payload-theme/generator'
import { CrossOriginBridge, type ConnectionStatus } from '@/payload-theme/cross-origin-bridge'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { Sun, Moon, RotateCcw, ExternalLink, Copy, Check } from 'lucide-react'

type PreviewTab = 'admin' | 'gallery' | 'custom'

const PREVIEW_TABS: { key: PreviewTab; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'custom', label: 'Custom' },
]

function getTabUrl(tab: PreviewTab, customUrl: string): string {
  switch (tab) {
    case 'admin':
      return '/preview/admin'
    case 'gallery':
      return '/preview/gallery'
    case 'custom':
      return customUrl || '/preview/admin'
  }
}

interface IframePanelProps {
  config: PayloadThemeConfig
}

const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://payloadtwist.com'

const PROVIDER_SNIPPET = `// src/components/LivePreviewProvider.tsx
'use client'
import Script from 'next/script'
import React from 'react'

const LivePreviewProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => (
  <>
    <Script
      src="${ORIGIN}/live-preview.js"
      strategy="afterInteractive"
    />
    {children}
  </>
)

export default LivePreviewProvider`

const CONFIG_SNIPPET = `// payload.config.ts
admin: {
  components: {
    providers: ['/components/LivePreviewProvider'],
  },
}`

const IMPORTMAP_SNIPPET = `pnpm payload generate:importmap`

type CopiedKey = 'provider' | 'config' | 'importmap' | null

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  if (status === 'disconnected') return null

  const styles: Record<ConnectionStatus, { bg: string; dot: string; text: string; label: string }> = {
    connecting: {
      bg: 'bg-amber-500/10',
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      label: 'Connecting...',
    },
    connected: {
      bg: 'bg-emerald-500/10',
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
      label: 'Connected',
    },
    failed: {
      bg: 'bg-red-500/10',
      dot: 'bg-red-400',
      text: 'text-red-400',
      label: 'Script not detected',
    },
    disconnected: { bg: '', dot: '', text: '', label: '' },
  }

  const s = styles[status]

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  )
}

/** Reads the effective Payload theme, matching Payload's own ThemeProvider logic. */
function getPayloadTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('payload-theme='))
    ?.split('=')[1]
  if (cookie === 'light') return 'light'
  if (cookie === 'dark') return 'dark'
  // No cookie (auto mode) — use system preference, same as Payload
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Sets the payload-theme cookie so Payload's ThemeProvider stays in sync. */
function setPayloadThemeCookie(theme: 'light' | 'dark'): void {
  const d = new Date()
  d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000)
  document.cookie = `payload-theme=${theme};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

export function IframePanel({ config }: IframePanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const bridgeRef = useRef<CrossOriginBridge | null>(null)
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' ? getPayloadTheme() === 'dark' : false,
  )
  const [activeTab, setActiveTab] = useState<PreviewTab>('admin')
  const [customUrl, setCustomUrl] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  const isCrossOrigin = activeTab === 'custom' && !!customUrl

  // ─── Same-origin injection (admin/showcase tabs) ───────────────────────────
  useEffect(() => {
    if (isCrossOrigin) return
    injectIntoIframe(config)
  }, [config, isCrossOrigin])

  useEffect(() => {
    if (isCrossOrigin) return
    const iframe = iframeRef.current
    if (!iframe) return
    const onLoad = () => {
      setIframeTheme(isDark ? 'dark' : 'light')
      injectIntoIframe(config)
    }
    iframe.addEventListener('load', onLoad)
    return () => iframe.removeEventListener('load', onLoad)
  }, [config, isDark, isCrossOrigin])

  // ─── Cross-origin bridge lifecycle ─────────────────────────────────────────
  useEffect(() => {
    if (!isCrossOrigin) {
      // Clean up bridge when switching away from cross-origin
      if (bridgeRef.current) {
        bridgeRef.current.disconnect()
        bridgeRef.current = null
        setConnectionStatus('disconnected')
      }
      return
    }

    const iframe = iframeRef.current
    if (!iframe) return

    const bridge = new CrossOriginBridge()
    bridgeRef.current = bridge

    const onLoad = () => {
      bridge.connect(iframe, setConnectionStatus)
    }

    // If iframe already has the custom URL loaded, connect now
    // Otherwise wait for load event
    iframe.addEventListener('load', onLoad)

    // Also connect immediately if the iframe src is already set
    // (handles the case where src was set before this effect ran)
    if (iframe.src === customUrl) {
      bridge.connect(iframe, setConnectionStatus)
    }

    return () => {
      iframe.removeEventListener('load', onLoad)
      bridge.disconnect()
      bridgeRef.current = null
      setConnectionStatus('disconnected')
    }
  }, [isCrossOrigin, customUrl])

  // ─── Cross-origin: forward config/theme changes ───────────────────────────
  useEffect(() => {
    if (!isCrossOrigin) return
    const bridge = bridgeRef.current
    if (!bridge) return
    bridge.send(config, isDark ? 'dark' : 'light')
  }, [config, isDark, isCrossOrigin])

  // ─── Theme mode ────────────────────────────────────────────────────────────
  const applyThemeMode = useCallback(
    (dark: boolean) => {
      if (isCrossOrigin) {
        bridgeRef.current?.send(config, dark ? 'dark' : 'light')
      } else {
        setIframeTheme(dark ? 'dark' : 'light')
        injectIntoIframe(config)
      }
    },
    [config, isCrossOrigin],
  )

  const handleSetLight = useCallback(() => {
    setIsDark(false)
    setPayloadThemeCookie('light')
    applyThemeMode(false)
  }, [applyThemeMode])

  const handleSetDark = useCallback(() => {
    setIsDark(true)
    setPayloadThemeCookie('dark')
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
    },
    [customInput],
  )

  // Navigate iframe when customUrl changes (iframe is always in DOM)
  useEffect(() => {
    if (activeTab === 'custom' && customUrl) {
      const iframe = iframeRef.current
      if (iframe) iframe.src = customUrl
    }
  }, [customUrl, activeTab])

  const handleCopy = useCallback((text: string, key: CopiedKey) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }, [])

  const currentUrl = getTabUrl(activeTab, customUrl)
  const showCustomSetup = activeTab === 'custom' && !customUrl

  return (
    <div className="h-full min-w-0 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-2 py-1 bg-[var(--pt-bg)] border-b border-[var(--pt-border)] flex-shrink-0">
        {PREVIEW_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`text-[11px] px-2.5 py-1 rounded transition-colors whitespace-nowrap active:scale-[0.97] font-medium ${
              activeTab === key
                ? 'bg-[var(--pt-accent)] text-white'
                : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:bg-[var(--pt-surface-hover)]'
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
          className="flex items-center gap-1.5 px-2 py-1.5 bg-[var(--pt-bg)] border-b border-[var(--pt-border)] flex-shrink-0"
        >
          <input
            type="url"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="http://localhost:3000/admin"
            className="flex-1 text-[11px] px-2 py-1 rounded border border-[var(--pt-border)] bg-[var(--pt-surface)] text-[var(--pt-text)] placeholder-[var(--pt-text-faint)] focus:outline-none focus:border-[var(--pt-accent)] focus:ring-1 focus:ring-[var(--pt-accent-soft)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          <button
            type="submit"
            className="text-[11px] px-2.5 py-1 rounded bg-[var(--pt-accent)] hover:bg-[var(--pt-accent-hover)] text-white font-medium transition-colors active:scale-[0.97]"
          >
            Go
          </button>
        </form>
      )}

      {/* Toolbar (hidden when showing setup instructions) */}
      {!showCustomSetup && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--pt-bg)] border-b border-[var(--pt-border)] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-[11px] text-[var(--pt-text-muted)] truncate"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {activeTab === 'custom' && customUrl ? customUrl : currentUrl}
            </span>
            {isCrossOrigin && <ConnectionBadge status={connectionStatus} />}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={handleSetLight}
              className={`p-1.5 rounded transition-colors ${
                !isDark
                  ? 'bg-[var(--pt-accent)] text-white'
                  : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:bg-[var(--pt-surface-hover)]'
              }`}
              title="Light mode"
              aria-label="Switch to light mode"
            >
              <Sun size={13} />
            </button>
            <button
              onClick={handleSetDark}
              className={`p-1.5 rounded transition-colors ${
                isDark
                  ? 'bg-[var(--pt-accent)] text-white'
                  : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] hover:bg-[var(--pt-surface-hover)]'
              }`}
              title="Dark mode"
              aria-label="Switch to dark mode"
            >
              <Moon size={13} />
            </button>
            <div className="w-px h-4 bg-[var(--pt-border)] mx-1" />
            <button
              onClick={handleReload}
              className="p-1.5 rounded hover:bg-[var(--pt-surface-hover)] transition-colors text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]"
              title="Reload preview"
              aria-label="Reload preview"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Setup instructions (shown when custom tab with no URL) */}
      {showCustomSetup && (
        <div className="flex-1 overflow-y-auto bg-[var(--pt-surface-alt)] p-6">
          <div className="max-w-lg mx-auto space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[var(--pt-text)]">
                Preview your Payload site
              </h3>
              <p className="text-[11px] text-[var(--pt-text-muted)] mt-1">
                Add the live preview provider to your Payload project, then enter your URL above.
              </p>
            </div>

            {/* Step 1 — Provider component */}
            <div className="flex items-start gap-2.5">
              <span className="text-[11px] font-bold text-[var(--pt-accent)] bg-[var(--pt-accent-soft)] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-xs text-[var(--pt-text-label)]">
                  Create <code className="text-[10px] bg-[var(--pt-surface-hover)] px-1 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>src/components/LivePreviewProvider.tsx</code>
                </p>
                <div className="relative group">
                  <pre
                    className="text-[10px] leading-relaxed bg-[var(--pt-code-bg)] text-[var(--pt-code-text)] rounded-md p-2.5 overflow-x-auto whitespace-pre"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {PROVIDER_SNIPPET}
                  </pre>
                  <button
                    onClick={() => handleCopy(PROVIDER_SNIPPET, 'provider')}
                    className="absolute top-1.5 right-1.5 p-1 rounded bg-[var(--pt-code-btn)] hover:bg-[var(--pt-surface-active)] text-[var(--pt-text-faint)] hover:text-white transition-colors"
                    title="Copy"
                  >
                    {copiedKey === 'provider' ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 — payload.config.ts */}
            <div className="flex items-start gap-2.5">
              <span className="text-[11px] font-bold text-[var(--pt-accent)] bg-[var(--pt-accent-soft)] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-xs text-[var(--pt-text-label)]">
                  Add the provider to your <code className="text-[10px] bg-[var(--pt-surface-hover)] px-1 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>payload.config.ts</code>
                </p>
                <div className="relative group">
                  <pre
                    className="text-[10px] leading-relaxed bg-[var(--pt-code-bg)] text-[var(--pt-code-text)] rounded-md p-2.5 overflow-x-auto whitespace-pre"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {CONFIG_SNIPPET}
                  </pre>
                  <button
                    onClick={() => handleCopy(CONFIG_SNIPPET, 'config')}
                    className="absolute top-1.5 right-1.5 p-1 rounded bg-[var(--pt-code-btn)] hover:bg-[var(--pt-surface-active)] text-[var(--pt-text-faint)] hover:text-white transition-colors"
                    title="Copy"
                  >
                    {copiedKey === 'config' ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 — Generate import map */}
            <div className="flex items-start gap-2.5">
              <span className="text-[11px] font-bold text-[var(--pt-accent)] bg-[var(--pt-accent-soft)] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-xs text-[var(--pt-text-label)]">
                  Regenerate the import map and restart your dev server
                </p>
                <div className="relative group">
                  <pre
                    className="text-[10px] leading-relaxed bg-[var(--pt-code-bg)] text-[var(--pt-code-text)] rounded-md p-2.5 overflow-x-auto whitespace-pre"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {IMPORTMAP_SNIPPET}
                  </pre>
                  <button
                    onClick={() => handleCopy(IMPORTMAP_SNIPPET, 'importmap')}
                    className="absolute top-1.5 right-1.5 p-1 rounded bg-[var(--pt-code-btn)] hover:bg-[var(--pt-surface-active)] text-[var(--pt-text-faint)] hover:text-white transition-colors"
                    title="Copy"
                  >
                    {copiedKey === 'importmap' ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 — Enter URL */}
            <div className="flex items-start gap-2.5">
              <span className="text-[11px] font-bold text-[var(--pt-accent)] bg-[var(--pt-accent-soft)] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </span>
              <p className="text-xs text-[var(--pt-text-label)]">
                Paste your site&apos;s URL above (e.g. <code className="text-[10px] bg-[var(--pt-surface-hover)] px-1 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>http://localhost:3000/admin</code>) and click Go.
              </p>
            </div>

            <p className="text-[10px] text-[var(--pt-text-faint)]">
              The provider loads a small script that receives theme changes via postMessage. No CORS configuration needed.
            </p>
          </div>
        </div>
      )}

      {/* Iframe — always in DOM so ref is stable */}
      <iframe
        id="payload-preview"
        ref={iframeRef}
        src={activeTab !== 'custom' ? getTabUrl(activeTab, '') : undefined}
        className={`flex-1 w-full min-w-0 border-0 bg-[var(--pt-surface)] ${showCustomSetup ? 'hidden' : ''}`}
        title="Payload Admin Preview"
      />
    </div>
  )
}
