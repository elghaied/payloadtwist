'use client'

import { useState, useSyncExternalStore } from 'react'
import { Check, Copy } from 'lucide-react'
import { bridgeSource, frameHeadersSource } from '@/payload-theme/bridge-source'

const noopSubscribe = () => () => {}

const COOKIE_SNIPPET = `auth: {
  cookies: process.env.NODE_ENV === 'development'
    ? { sameSite: 'None', secure: true } // localhost counts as secure in modern browsers
    : undefined,
},`

function CodeBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded-lg border border-[var(--pt-border)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--pt-surface)] border-b border-[var(--pt-border)]">
        <span className="text-[11px] font-medium text-[var(--pt-text-muted)]">{title}</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="flex items-center gap-1 text-[11px] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="text-[11px] leading-relaxed p-3 overflow-x-auto max-h-64 bg-[var(--pt-code-bg)] text-[var(--pt-code-text)] font-mono">
        {code}
      </pre>
    </div>
  )
}

/** Shown in the "Your Payload" tab before a URL is connected. */
export function CustomPreviewSetup() {
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => 'https://payloadtwist.com')
  return (
    <div className="max-w-2xl w-full p-8 space-y-5 text-sm text-[var(--pt-text)]">
      <div>
        <h2 className="text-base font-semibold mb-1">Preview on your own Payload v4 admin</h2>
        <p className="text-[var(--pt-text-muted)]">
          Theme your real collections and custom components. Three steps, all local to your project — nothing is sent anywhere
          except the CSS you are editing.
        </p>
      </div>
      <ol className="space-y-4 list-decimal pl-5 marker:text-[var(--pt-text-muted)]">
        <li className="space-y-2">
          <p>
            Save this as <code className="text-xs">src/components/PayloadTwistBridge.tsx</code>, add it to{' '}
            <code className="text-xs">admin.components.providers</code>, then run{' '}
            <code className="text-xs">payload generate:importmap</code>.
          </p>
          <CodeBlock title="PayloadTwistBridge.tsx" code={bridgeSource(origin)} />
        </li>
        <li className="space-y-2">
          <p>Allow this editor to embed your admin while developing:</p>
          <CodeBlock title="next.config.ts" code={frameHeadersSource(origin)} />
        </li>
        <li className="space-y-2">
          <p>
            Your admin runs on another site inside this editor, so browsers only send its login cookie when it is{' '}
            <code className="text-xs">SameSite=None</code>. In your users collection (development only):
          </p>
          <CodeBlock title="collections/Users.ts" code={COOKIE_SNIPPET} />
        </li>
        <li>
          Log in to your admin in this browser (or enable <code className="text-xs">admin.autoLogin</code> locally), then enter its
          URL above and press <strong>Connect</strong>.
        </li>
      </ol>
    </div>
  )
}
