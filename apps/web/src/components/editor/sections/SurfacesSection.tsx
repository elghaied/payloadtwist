'use client'

import { RotateCcw } from 'lucide-react'
import { ScrubberInput } from '@/components/editor/ScrubberInput'
import { flatten } from '@/payload-theme/color'
import { surfaceSource, type ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { ContrastBadge, Group, ModeHeader, TokenColorRow, useResolved } from '../token-ui'

function SurfaceFeel({ theme }: { theme: ThemeConfig }) {
  const setSurfaces = useEditorStore((s) => s.setSurfaces)
  const { tint = 0, depth = 0 } = theme.controls.surfaces ?? {}
  return (
    <Group
      title="Surface feel"
      hint="Tints every background, panel and border with the neutral seed (or the brand seed when the neutral is grey), and sets how deep dark mode goes."
    >
      <div className="flex items-center gap-2 py-0.5">
        <span className="w-4 h-4 rounded-full border border-[var(--pt-border)]" style={{ background: surfaceSource(theme) }} />
        <span className="flex-1 text-[11px] text-[var(--pt-text-label)]">Surface tint</span>
        <ScrubberInput value={Math.round(tint * 100)} min={0} max={100} step={1} unit="%" onChange={(n) => setSurfaces({ tint: n / 100, depth })} />
      </div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="w-4" />
        <span className="flex-1 text-[11px] text-[var(--pt-text-label)]">Dark mode depth</span>
        <span className="text-[10px] text-[var(--pt-text-faint)]">deep</span>
        <ScrubberInput value={Math.round(depth * 100)} min={-100} max={100} step={1} onChange={(n) => setSurfaces({ tint, depth: n / 100 })} />
        <span className="text-[10px] text-[var(--pt-text-faint)]">dim</span>
      </div>
      {theme.controls.surfaces && (
        <button onClick={() => setSurfaces(null)} className="flex items-center gap-1 text-[11px] text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]">
          <RotateCcw size={10} /> Payload surfaces
        </button>
      )}
    </Group>
  )
}

// The roles that carry most of the admin's look. Everything else is in Advanced.
const GROUPS: { title: string; hint?: string; vars: [string, string?][] }[] = [
  {
    title: 'Surfaces',
    hint: 'Page, panels and floating layers.',
    vars: [
      ['--color-bg', 'Page background'],
      ['--color-bg-secondary', 'Secondary surface'],
      ['--color-bg-tertiary', 'Tertiary surface'],
      ['--color-bg-elevated', 'Elevated (drawers, popups)'],
      ['--color-bg-hover', 'Hover'],
      ['--color-bg-pressed', 'Pressed'],
      ['--color-bg-menu', 'Menus'],
      ['--color-bg-tooltip', 'Tooltips'],
    ],
  },
  {
    title: 'Text & icons',
    vars: [
      ['--color-text', 'Text'],
      ['--color-text-secondary', 'Secondary text'],
      ['--color-text-tertiary', 'Tertiary text'],
      ['--color-text-brand', 'Brand text & links'],
      ['--color-text-danger', 'Danger text'],
      ['--color-icon', 'Icons'],
      ['--color-icon-secondary', 'Secondary icons'],
    ],
  },
  {
    title: 'Borders & focus',
    vars: [
      ['--color-border', 'Border'],
      ['--color-border-strong', 'Strong border'],
      ['--color-border-selected', 'Selected border'],
      ['--accessibility-focus-color', 'Focus ring'],
    ],
  },
  {
    title: 'Brand & selection',
    hint: 'Normally driven by the Brand seed — override here for exceptions.',
    vars: [
      ['--color-bg-brand', 'Primary button'],
      ['--color-bg-brand-hover', 'Primary button hover'],
      ['--color-text-onbrand', 'Text on primary'],
      ['--color-bg-selected', 'Selected row / tab'],
      ['--color-text-selected', 'Selected text'],
    ],
  },
  {
    title: 'Fields',
    vars: [
      ['--field-color-bg', 'Field background'],
      ['--field-color-border', 'Field border'],
      ['--field-color-border-hover', 'Field border hover'],
      ['--field-color-text', 'Field text'],
      ['--field-color-label', 'Labels'],
    ],
  },
]

const CONTRAST_PAIRS: { label: string; fg: string; bg: string }[] = [
  { label: 'Text on page', fg: '--color-text', bg: '--color-bg' },
  { label: 'Secondary text', fg: '--color-text-secondary', bg: '--color-bg' },
  { label: 'Brand text', fg: '--color-text-brand', bg: '--color-bg' },
  { label: 'Primary button', fg: '--color-text-onbrand', bg: '--color-bg-brand' },
  { label: 'Text on secondary', fg: '--color-text', bg: '--color-bg-secondary' },
  { label: 'Tooltip', fg: '--color-text-ontooltip', bg: '--color-bg-tooltip' },
]

export function SurfacesSection({ theme }: { theme: ThemeConfig }) {
  const resolved = useResolved(theme)
  return (
    <div className="space-y-6">
      <SurfaceFeel theme={theme} />
      <Group title="Contrast" hint="WCAG AA for body text. Translucent roles are blended over their background, as the browser does.">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 items-center text-[11px]">
          <span />
          <span className="text-[10px] uppercase tracking-wider text-[var(--pt-text-faint)]">Light</span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--pt-text-faint)]">Dark</span>
          {CONTRAST_PAIRS.map((p) => (
            <div key={p.label} className="contents">
              <span className="text-[var(--pt-text-label)]">{p.label}</span>
              <ContrastBadge fg={resolved.light[p.fg]} bg={resolved.light[p.bg]} page={flatten(resolved.light['--color-bg'], '#ffffff') ?? '#ffffff'} />
              <ContrastBadge fg={resolved.dark[p.fg]} bg={resolved.dark[p.bg]} page={flatten(resolved.dark['--color-bg'], '#000000') ?? '#000000'} />
            </div>
          ))}
        </div>
      </Group>
      {GROUPS.map((g) => (
        <Group key={g.title} title={g.title} hint={g.hint}>
          <ModeHeader />
          {g.vars.map(([v, label]) => (
            <TokenColorRow key={v} varName={v} label={label} theme={theme} resolved={resolved} />
          ))}
        </Group>
      ))}
    </div>
  )
}
