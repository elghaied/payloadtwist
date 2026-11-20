'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Download, X } from 'lucide-react'
import { zipFiles } from '@/lib/zip'
import { ADMIN_THEMES_INSTALL, buildThemePackage, themeNames, toThemeId } from '@/payload-theme/css'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'

type Tab = 'css' | 'package' | 'json'

function download(name: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

function FileBlock({ name, content, mime }: { name: string; content: string; mime?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded-lg border border-[var(--pt-border)] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--pt-surface-alt)] border-b border-[var(--pt-border)]">
        <code className="text-[13px] text-[var(--pt-text)] flex-1">{name}</code>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(content)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="flex items-center gap-1 text-[13px] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={() => download(name.split('/').pop()!, content, mime)}
          className="flex items-center gap-1 text-[13px] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]"
        >
          <Download size={12} /> Download
        </button>
      </div>
      <pre className="text-[13px] leading-relaxed p-3 overflow-auto max-h-72 bg-[var(--pt-code-bg)] text-[var(--pt-code-text)] font-mono whitespace-pre">
        {content}
      </pre>
    </div>
  )
}

const Code = ({ children }: { children: string }) => (
  <code className="text-[13px] bg-[var(--pt-surface-alt)] px-1 py-0.5 rounded">{children}</code>
)

export function ExportDialog({ open, onClose, theme, css }: { open: boolean; onClose: () => void; theme: ThemeConfig; css: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const loadTheme = useEditorStore((s) => s.loadTheme)
  const [tab, setTab] = useState<Tab>('css')
  const [name, setName] = useState('My theme')
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')

  useEffect(() => {
    if (open) ref.current?.showModal()
    else ref.current?.close()
  }, [open])

  const id = toThemeId(name)
  const names = themeNames(id)
  const pkg = tab === 'package' ? buildThemePackage(theme, { id, label: name }) : null
  const json = JSON.stringify(theme, null, 2)

  const doImport = () => {
    try {
      loadTheme(JSON.parse(importText))
      setImportError('')
      setImportText('')
      onClose()
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid theme JSON')
    }
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      role="tab"
      aria-selected={tab === t}
      onClick={() => setTab(t)}
      className={`px-3 py-1.5 text-xs rounded-md ${tab === t ? 'bg-[var(--pt-accent)] text-white' : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]'}`}
    >
      {label}
    </button>
  )

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100vh-4rem)] rounded-xl border border-[var(--pt-border)] bg-[var(--pt-surface)] text-[var(--pt-text)] p-0 backdrop:bg-black/50"
    >
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--pt-border)]">
        <h2 className="text-sm font-semibold flex-1">Export theme</h2>
        <div className="flex gap-1" role="tablist">
          {tabBtn('css', 'custom.css')}
          {tabBtn('package', 'Theme package')}
          {tabBtn('json', 'JSON')}
        </div>
        <button onClick={onClose} className="p-1 text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-4 overflow-auto max-h-[calc(100vh-9rem)] text-xs leading-relaxed">
        {tab === 'css' && (
          <>
            <p className="text-[var(--pt-text-muted)]">
              Save as <Code>src/app/(payload)/custom.css</Code> and import it in <Code>src/app/(payload)/layout.tsx</Code> right after{' '}
              <Code>{"import '@payloadcms/next/css'"}</Code>. Payload v4 keeps its styles in <Code>@layer payload-default</Code>, so these rules
              win without <Code>!important</Code>, in light, dark and portaled menus.
            </p>
            <FileBlock name="custom.css" content={css} mime="text/css" />
          </>
        )}

        {tab === 'package' && pkg && (
          <>
            <p className="text-[var(--pt-text-muted)]">
              A user-selectable theme for{' '}
              <a className="underline" href="https://github.com/zubricks/payload-admin-ui-themes" target="_blank" rel="noreferrer">
                payload-admin-ui-themes
              </a>
              : editors pick it from their Settings menu next to Payload&apos;s own theme, in light and dark. Every rule is scoped
              to <Code>{`html[data-admin-theme="${id}"]`}</Code>, so it never affects other themes. The demo admin in this editor runs
              exactly these packages — open <Code>/preview</Code> → your account → Settings → Admin theme.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <span className="text-[var(--pt-text-muted)]">Theme name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-48 bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-2 py-1 focus:outline-none focus:border-[var(--pt-accent)]"
                />
              </label>
              <code className="text-[var(--pt-text-faint)]">id: {id}</code>
              <button
                onClick={() => {
                  const files = Object.fromEntries(Object.entries(pkg).map(([f, c]) => [`${id}/${f}`, c]))
                  const zip = zipFiles(files)
                  const url = URL.createObjectURL(new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' }))
                  const a = Object.assign(document.createElement('a'), { href: url, download: `${id}-payload-theme.zip` })
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--pt-accent)] text-white"
              >
                <Download size={12} /> Download .zip
              </button>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-[var(--pt-text-muted)]">
              <li>
                Install the plugin under the name its components expect: <Code>{ADMIN_THEMES_INSTALL}</Code>
              </li>
              <li>
                Unzip into <Code>src/admin-themes/</Code> (or copy the files below into <Code>{`src/admin-themes/${id}/`}</Code>).
              </li>
              <li>Register it (excerpt below), then run <Code>pnpm payload generate:importmap</Code>.</li>
            </ol>
            <FileBlock
              name="payload.config.ts (excerpt)"
              content={`import { payloadAdminUIThemes } from 'payload-admin-ui-themes'\nimport { stockTheme } from 'payload-admin-ui-themes/themes/stock'\nimport { ${names.manifest} } from './admin-themes/${id}'\n\nplugins: [\n  payloadAdminUIThemes({\n    themes: [stockTheme, ${names.manifest}],\n    defaultTheme: '${id}',\n    // this theme sets its own sizes; the plugin's density would override them\n    density: false,\n  }),\n],`}
            />
            {Object.entries(pkg).map(([file, content]) => (
              <FileBlock
                key={file}
                name={`src/admin-themes/${id}/${file}`}
                content={content}
                mime={file.endsWith('.css') ? 'text/css' : file.endsWith('.md') ? 'text/markdown' : 'text/plain'}
              />
            ))}
          </>
        )}

        {tab === 'json' && (
          <>
            <p className="text-[var(--pt-text-muted)]">The editor&apos;s own format — re-import it here later or share it.</p>
            <FileBlock name={`${id}.payloadtwist.json`} content={json} mime="application/json" />
            <div className="space-y-2">
              <p className="font-medium">Import</p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={5}
                placeholder="Paste a payloadtwist theme JSON…"
                className="w-full font-mono text-[13px] bg-[var(--pt-code-bg)] text-[var(--pt-code-text)] border border-[var(--pt-border)] rounded p-2 focus:outline-none focus:border-[var(--pt-accent)]"
              />
              {importError && <p className="text-[var(--pt-danger)]">{importError}</p>}
              <button
                onClick={doImport}
                disabled={!importText.trim()}
                className="px-3 py-1.5 rounded-md bg-[var(--pt-accent)] text-white disabled:opacity-40"
              >
                Import theme
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}
