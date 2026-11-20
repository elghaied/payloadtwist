'use client'

import { RotateCcw } from 'lucide-react'
import { ScrubberInput } from '@/components/editor/ScrubberInput'
import { flatten } from '@/payload-theme/color'
import { surfaceSource, type ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { ContrastBadge, Group, ModeHeader, SectionIntro, TokenColorRow, useResolved } from '../token-ui'

function SurfaceFeel({ theme }: { theme: ThemeConfig }) {
  const setSurfaces = useEditorStore((s) => s.setSurfaces)
  const { tint = 0, depth = 0 } = theme.controls.surfaces ?? {}
  return (
    <Group
      title="Tint & depth"
      hint="Quick global changes: give every background a color cast, and choose how dark dark mode gets."
    >
      <div className="flex items-center gap-2 py-0.5">
        <span className="w-4 h-4 rounded-full border border-[var(--pt-border)]" style={{ background: surfaceSource(theme) }} />
        <span className="flex-1 text-[13px] text-[var(--pt-text-label)]" title="Uses the hue of your Neutral color (or Brand when Neutral is plain grey)">Tint backgrounds</span>
        <ScrubberInput value={Math.round(tint * 100)} min={0} max={100} step={1} unit="%" onChange={(n) => setSurfaces({ tint: n / 100, depth })} />
      </div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="w-4" />
        <span className="flex-1 text-[13px] text-[var(--pt-text-label)]">Dark mode depth</span>
        <span className="text-xs text-[var(--pt-text-faint)]">deep</span>
        <ScrubberInput value={Math.round(depth * 100)} min={-100} max={100} step={1} onChange={(n) => setSurfaces({ tint, depth: n / 100 })} />
        <span className="text-xs text-[var(--pt-text-faint)]">dim</span>
      </div>
      {theme.controls.surfaces && (
        <button onClick={() => setSurfaces(null)} className="flex items-center gap-1 text-[13px] text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]">
          <RotateCcw size={10} /> Payload surfaces
        </button>
      )}
    </Group>
  )
}

// The roles that carry most of the admin's look. Everything else is in Advanced.
const GROUPS: { title: string; hint?: string; vars: [string, string?][] }[] = [
  {
    title: 'Backgrounds',
    hint: 'The page and every panel, menu and popup on it.',
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
    hint: 'Colors of text and icons everywhere.',
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
    title: 'Borders & focus ring',
    hint: 'Dividers and outlines, and the ring shown when you tab through the page with a keyboard.',
    vars: [
      ['--color-border', 'Border'],
      ['--color-border-strong', 'Strong border'],
      ['--color-border-selected', 'Selected border'],
      ['--accessibility-focus-color', 'Focus ring'],
    ],
  },
  {
    title: 'Brand color & selection',
    hint: 'These follow your Brand color automatically — set them here only to make an exception.',
    vars: [
      ['--color-bg-brand', 'Primary button'],
      ['--color-bg-brand-hover', 'Primary button hover'],
      ['--color-text-onbrand', 'Text on primary'],
      ['--color-bg-selected', 'Selected row / tab'],
      ['--color-text-selected', 'Selected text'],
    ],
  },
  {
    title: 'Form fields',
    hint: 'Inputs, selects and date pickers.',
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
      <SectionIntro scope="global">
        Background, text and border colors used everywhere in the admin, in light and dark mode. These are Payload&apos;s
        shared color variables — to color one element only (just the sidebar, just the table header) use Components.
      </SectionIntro>
      <SurfaceFeel theme={theme} />
      <Group title="Readability check" hint="Is text readable on its background? AA is the accessibility standard (4.5:1). Fix a failing pair by changing the colors below.">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 items-center text-[13px]">
          <span />
          <span className="text-xs uppercase tracking-wider text-[var(--pt-text-faint)]">Light</span>
          <span className="text-xs uppercase tracking-wider text-[var(--pt-text-faint)]">Dark</span>
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
