// Source of the provider users add to their own Payload v4 project so the editor can preview
// themes on their real admin ("Your Payload" preview). Mirrors src/payload/components/PreviewBridge
// but only trusts the payloadtwist origin it was generated for.

export function bridgeSource(editorOrigin: string): string {
  return `'use client'

// payloadtwist live preview bridge — lets ${editorOrigin} preview themes on this admin.
// Register in payload.config.ts:  admin.components.providers: ['@/components/PayloadTwistBridge#PayloadTwistBridge']
// Remove it once you are done theming.
import { usePathname, useRootTheme, useRouter } from '@payloadcms/ui'
import { useEffect, type ReactNode } from 'react'

const EDITOR_ORIGIN = ${JSON.stringify(editorOrigin)}
const STYLE_ID = 'payloadtwist-theme'

export function PayloadTwistBridge({ children }: { children?: ReactNode }) {
  const { setTheme, setHighContrastMode } = useRootTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (window.parent === window) return
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== EDITOR_ORIGIN || event.source !== window.parent) return
      const msg = event.data
      if (!msg || msg.source !== 'payloadtwist') return
      if (msg.type === 'css' && typeof msg.css === 'string') {
        let el = document.getElementById(STYLE_ID)
        if (!el) {
          el = document.createElement('style')
          el.id = STYLE_ID
        }
        el.textContent = msg.css
        document.head.appendChild(el)
      } else if (msg.type === 'theme' && (msg.theme === 'light' || msg.theme === 'dark')) {
        setTheme(msg.theme)
      } else if (msg.type === 'contrast') {
        setHighContrastMode(msg.enabled === true)
      } else if (msg.type === 'navigate' && typeof msg.path === 'string' && msg.path.startsWith('/')) {
        router.push(msg.path)
      }
    }
    window.addEventListener('message', onMessage)
    window.parent.postMessage({ source: 'payloadtwist-preview', type: 'ready', version: 1 }, EDITOR_ORIGIN)
    return () => window.removeEventListener('message', onMessage)
  }, [setTheme, setHighContrastMode, router])

  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ source: 'payloadtwist-preview', type: 'route', path: pathname }, EDITOR_ORIGIN)
    }
  }, [pathname])

  return children
}
`
}

/** next.config headers so the editor may frame the admin (development only). */
export function frameHeadersSource(editorOrigin: string): string {
  return `// next.config.ts — allow payloadtwist to frame your admin while theming (dev only)
async headers() {
  if (process.env.NODE_ENV !== 'development') return []
  return [
    {
      source: '/admin/:path*',
      headers: [{ key: 'Content-Security-Policy', value: "frame-ancestors 'self' ${editorOrigin}" }],
    },
  ]
},`
}
