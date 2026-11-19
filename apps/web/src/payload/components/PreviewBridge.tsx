'use client'

import { usePathname, useRootTheme, useRouter } from '@payloadcms/ui'
import { useEffect, type ReactNode } from 'react'
import { applyCss, isToPreview, type FromPreview } from '@/payload-theme/preview-protocol'

/**
 * Admin provider for the embedded preview: receives theme CSS, color mode, contrast and
 * navigation from the editor, and reports the current route back. Uses Payload's own theme
 * hooks so components that read the theme (code editor, etc.) stay in sync.
 */
export function PreviewBridge({ children }: { children?: ReactNode }) {
  const { setTheme, setHighContrastMode } = useRootTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (window.parent === window) return
    const post = (msg: FromPreview) => window.parent.postMessage(msg, window.location.origin)

    const onMessage = (event: MessageEvent) => {
      // Only the editor on our own origin may drive the preview
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      const msg = event.data
      if (!isToPreview(msg)) return
      if (msg.type === 'css') applyCss(document, msg.css)
      else if (msg.type === 'theme') setTheme(msg.theme)
      else if (msg.type === 'contrast') setHighContrastMode(msg.enabled)
      else if (msg.type === 'navigate' && msg.path.startsWith('/preview')) router.push(msg.path)
    }

    window.addEventListener('message', onMessage)
    post({ source: 'payloadtwist-preview', type: 'ready', version: 1 })
    return () => window.removeEventListener('message', onMessage)
  }, [setTheme, setHighContrastMode, router])

  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { source: 'payloadtwist-preview', type: 'route', path: pathname } satisfies FromPreview,
        window.location.origin,
      )
    }
  }, [pathname])

  return children
}
