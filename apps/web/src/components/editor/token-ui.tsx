'use client'

import { useMemo, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { ColorPopover } from '@/components/controls'
import { contrastRatio, flatten } from '@/payload-theme/color'
import { resolveAll, TOKENS } from '@/payload-theme/schema'
import type { Mode, ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'

/** Every token resolved for both modes, recomputed only when overrides change. */
export function useResolved(theme: ThemeConfig) {
  const { ramps, light, dark } = theme
  return useMemo(
    () => ({ light: resolveAll('light', { ramps, light, dark }), dark: resolveAll('dark', { ramps, light, dark }) }),
    [ramps, light, dark],
  )
}

export const tokenLabel = (v: string) =>
  v
    .replace(/^--(color|field-color|special)-/, '')
    .replace(/-/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())

export function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <header>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--pt-text-muted)]">{title}</h3>
        {hint && <p className="text-[13px] text-[var(--pt-text-faint)] mt-0.5">{hint}</p>}
      </header>
      {children}
    </section>
  )
}

function ResetButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="p-0.5 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)] transition-colors"
      title={label}
      aria-label={label}
    >
      <RotateCcw size={10} />
    </button>
  )
}

/** One semantic color token with light and dark pickers. */
export function TokenColorRow({
  varName,
  theme,
  resolved,
  label,
}: {
  varName: string
  theme: ThemeConfig
  resolved: { light: Record<string, string>; dark: Record<string, string> }
  label?: string
}) {
  const setToken = useEditorStore((s) => s.setToken)
  const token = TOKENS[varName]
  if (!token) return null

  const cell = (mode: Mode) => {
    const overridden = varName in theme[mode]
    return (
      <div className="flex items-center gap-0.5 w-[54px] justify-end">
        {overridden && <ResetButton onClick={() => setToken(varName, null, mode)} label={`Reset ${mode}`} />}
        <ColorPopover
          value={resolved[mode][varName]}
          onChange={(hex) => setToken(varName, hex, mode)}
          hasOverride={overridden}
          label={`${varName} (${mode})`}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-0.5 min-h-[28px]">
      <div className="flex-1 min-w-0">
        <span className="text-[13px] text-[var(--pt-text-label)] block truncate" title={varName}>
          {label ?? tokenLabel(varName)}
        </span>
      </div>
      {cell('light')}
      {cell('dark')}
    </div>
  )
}

export function ModeHeader() {
  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--pt-text-faint)]">
      <span className="flex-1" />
      <span className="w-[54px] text-right">Light</span>
      <span className="w-[54px] text-right">Dark</span>
    </div>
  )
}

/** WCAG contrast badge for a text/background pair. Skips translucent values it can't judge. */
export function ContrastBadge({ fg, bg, page, large = false }: { fg: string; bg: string; page: string; large?: boolean }) {
  // Payload's text and surface roles are often translucent: composite them the way the browser does
  const bgFlat = flatten(bg, page)
  const fgFlat = bgFlat ? flatten(fg, bgFlat) : null
  if (!bgFlat || !fgFlat) return <span className="text-xs text-[var(--pt-text-faint)]">n/a</span>
  const ratio = contrastRatio(fgFlat, bgFlat)
  const pass = ratio >= (large ? 3 : 4.5)
  return (
    <span
      className={`text-xs font-mono px-1.5 py-0.5 rounded ${
        pass ? 'text-[var(--pt-success)] bg-[var(--pt-success)]/10' : 'text-[var(--pt-danger)] bg-[var(--pt-danger)]/10'
      }`}
      title={`Contrast ${ratio.toFixed(2)}:1 — WCAG AA needs ${large ? '3' : '4.5'}:1`}
    >
      {ratio.toFixed(1)} {pass ? 'AA' : 'fail'}
    </span>
  )
}

// ─── Section intro ──────────────────────────────────────────────────────────

const SCOPES = {
  whole: { label: 'Whole theme', cls: 'bg-[var(--pt-accent-soft)] text-[var(--pt-accent)]' },
  global: { label: 'Global — whole admin', cls: 'bg-sky-500/10 text-sky-700 [[data-editor-theme=dark]_&]:text-sky-300' },
  specific: { label: 'Specific elements', cls: 'bg-amber-500/10 text-amber-700 [[data-editor-theme=dark]_&]:text-amber-300' },
  raw: { label: 'Raw variables', cls: 'bg-[var(--pt-surface-active)] text-[var(--pt-text-muted)]' },
} as const

/** Opens every editor tab: what scope the controls change, in one plain sentence. */
export function SectionIntro({ scope, children }: { scope: keyof typeof SCOPES; children: ReactNode }) {
  const s = SCOPES[scope]
  return (
    <div className="rounded-lg border border-[var(--pt-border)] bg-[var(--pt-surface-alt)] p-3 space-y-1.5">
      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
      <p className="text-[13px] leading-relaxed text-[var(--pt-text-muted)]">{children}</p>
    </div>
  )
}
