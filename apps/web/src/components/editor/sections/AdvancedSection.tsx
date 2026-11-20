'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, RotateCcw, Search } from 'lucide-react'
import { ColorPopover } from '@/components/controls'
import { parseColor } from '@/payload-theme/color'
import { schema, TOKENS } from '@/payload-theme/schema'
import { isSafeValue, type Mode, type ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { useResolved } from '../token-ui'

const FILE_LABELS: Record<string, string> = {
  colors: 'Color',
  theme: 'Controls',
  radius: 'Radius',
  spacing: 'Spacing & layout',
  typography: 'Typography',
  elevations: 'Elevation',
  'z-index': 'Z-index',
  app: 'App',
}

// Ramps are edited through seeds/ramp strips; everything else is listed here.
const GROUPS = (() => {
  const map = new Map<string, string[]>()
  for (const t of schema.tokens) {
    if (t.file === 'color-ramps') continue
    const key = t.file === 'colors' ? `Color · ${t.section}` : FILE_LABELS[t.file] ?? t.file
    map.set(key, [...(map.get(key) ?? []), t.var])
  }
  return [...map.entries()]
})()

function ValueInput({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    setDraft(value)
  }
  const commit = () => {
    const v = draft.trim()
    // Same rule as parseTheme
    if (v && v !== value && isSafeValue(v)) onCommit(v)
    else setDraft(value)
  }
  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
      className="w-40 min-w-0 text-[13px] font-mono bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-1.5 py-0.5 text-[var(--pt-text)] focus:outline-none focus:border-[var(--pt-accent)]"
      spellCheck={false}
    />
  )
}

function TokenRow({ varName, mode, theme, resolved }: { varName: string; mode: Mode; theme: ThemeConfig; resolved: string }) {
  const setToken = useEditorStore((s) => s.setToken)
  const token = TOKENS[varName]
  const overridden = varName in theme[mode]
  const raw = theme[mode][varName] ?? (mode === 'dark' ? (token.dark ?? theme.light[varName] ?? token.light) : token.light)
  return (
    <div className="flex items-center gap-1.5 py-0.5 min-h-[26px]" title={raw}>
      <code className="flex-1 min-w-0 truncate text-xs text-[var(--pt-text-label)]">{varName}</code>
      {overridden && (
        <button onClick={() => setToken(varName, null, mode)} className="p-0.5 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label={`Reset ${varName}`}>
          <RotateCcw size={10} />
        </button>
      )}
      {token.type === 'color' && parseColor(resolved) ? (
        <ColorPopover value={resolved} onChange={(hex) => setToken(varName, hex, mode)} hasOverride={overridden} label={varName} />
      ) : null}
      <ValueInput value={raw} onCommit={(v) => setToken(varName, v, mode)} />
    </div>
  )
}

export function AdvancedSection({ theme }: { theme: ThemeConfig }) {
  const resolvedBoth = useResolved(theme)
  const [mode, setMode] = useState<Mode>('light')
  const [query, setQuery] = useState('')
  const [onlyOverridden, setOnlyOverridden] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GROUPS.map(([name, vars]) => [
      name,
      vars.filter((v) => (!q || v.includes(q)) && (!onlyOverridden || v in theme[mode])),
    ] as const).filter(([, vars]) => vars.length)
  }, [query, onlyOverridden, theme, mode])

  const searching = query.trim() !== '' || onlyOverridden
  const count = Object.keys(theme.light).length + Object.keys(theme.dark).length

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-[var(--pt-text-faint)]">
        Every Payload v4 token. Values can reference others, e.g. <code>var(--ramp-blue-600)</code>.
      </p>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--pt-text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tokens…"
            aria-label="Search tokens"
            className="w-full text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded pl-7 pr-2 py-1.5 text-[var(--pt-text)] placeholder:text-[var(--pt-text-faint)] focus:outline-none focus:border-[var(--pt-accent)]"
          />
        </div>
        <div className="flex bg-[var(--pt-bg)] rounded p-0.5" role="radiogroup" aria-label="Mode">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 rounded text-[13px] capitalize ${mode === m ? 'bg-[var(--pt-accent)] text-white' : 'text-[var(--pt-text-muted)]'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-[13px] text-[var(--pt-text-muted)]">
        <input type="checkbox" checked={onlyOverridden} onChange={(e) => setOnlyOverridden(e.target.checked)} />
        Only overridden ({count})
      </label>

      <div className="divide-y divide-[var(--pt-border)]">
        {groups.map(([name, vars]) => {
          const isOpen = searching || open[name]
          return (
            <div key={name}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [name]: !o[name] }))}
                className="w-full flex items-center gap-1.5 py-2 text-left text-[13px] font-medium text-[var(--pt-text)]"
                aria-expanded={!!isOpen}
              >
                <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                {name}
                <span className="ml-auto text-xs text-[var(--pt-text-faint)]">{vars.length}</span>
              </button>
              {isOpen && (
                <div className="pb-2 pl-4">
                  {vars.map((v) => (
                    <TokenRow key={v} varName={v} mode={mode} theme={theme} resolved={resolvedBoth[mode][v]} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
