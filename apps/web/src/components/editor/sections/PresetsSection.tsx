'use client'

import { useMemo } from 'react'
import { PRESET_GROUPS, presetTheme, THEME_PRESETS } from '@/payload-theme/presets'
import { resolveAll } from '@/payload-theme/schema'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { Group, SectionIntro } from '../token-ui'

function MiniAdmin({ theme, mode }: { theme: ThemeConfig; mode: 'light' | 'dark' }) {
  const r = resolveAll(mode, theme)
  const c = theme.components
  const pick = (id: string, prop: 'bg' | 'text', fallback: string) =>
    (mode === 'dark' ? c[id]?.dark?.[prop] : undefined) ?? (mode === 'light' || !c[id]?.dark ? c[id]?.light?.[prop] : undefined) ?? fallback
  const sidebar = mode === 'dark' && c.sidebar?.light?.bg && !c.sidebar?.dark?.bg ? r['--color-bg'] : pick('sidebar', 'bg', r['--color-bg'])
  const active = pick('sidebarLinkActive', 'bg', r['--color-bg-selected'])
  const button = pick('buttonPrimary', 'bg', r['--color-bg-brand'])
  const radius = theme.components.buttonPrimary?.light?.radius ?? r['--button-radius'] ?? '4px'
  return (
    <div className="flex h-14 overflow-hidden" style={{ background: r['--color-bg'] }}>
      <div className="w-[30%] p-1 space-y-1 border-r" style={{ background: sidebar, borderColor: r['--color-border'] }}>
        <div className="h-1.5 w-3/4 rounded-sm" style={{ background: active }} />
        <div className="h-1 w-1/2 rounded-sm opacity-50" style={{ background: pick('sidebarLink', 'text', r['--color-text']) }} />
        <div className="h-1 w-2/3 rounded-sm opacity-50" style={{ background: pick('sidebarLink', 'text', r['--color-text']) }} />
      </div>
      <div className="flex-1 p-1.5 space-y-1">
        <div className="h-1.5 w-1/2 rounded-sm" style={{ background: r['--color-text'] }} />
        <div className="flex gap-1">
          <div className="h-5 flex-1 rounded-[3px] border" style={{ background: r['--color-bg-elevated'], borderColor: r['--color-border'], boxShadow: r['--elevation-300-tooltip'] }} />
          <div className="h-5 flex-1 rounded-[3px]" style={{ background: r['--color-bg-secondary'] }} />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-6" style={{ background: button, borderRadius: radius }} />
          <div className="h-1.5 w-3 rounded-full" style={{ background: r['--color-bg-success'] }} />
          <div className="h-1.5 w-3 rounded-full" style={{ background: r['--color-bg-warning'] }} />
        </div>
      </div>
    </div>
  )
}

function PresetGrid() {
  const loadTheme = useEditorStore((s) => s.loadTheme)
  const previews = useMemo(() => THEME_PRESETS.map((p) => ({ preset: p, theme: presetTheme(p) })), [])
  return (
    <div className="space-y-3">
      {PRESET_GROUPS.map((g) => (
        <div key={g.id}>
          <p className="text-xs text-[var(--pt-text-faint)] mb-1">{g.label}</p>
          <div className="grid grid-cols-2 gap-2">
            {previews
              .filter((p) => p.preset.group === g.id)
              .map(({ preset, theme }) => (
                <button
                  key={preset.id}
                  onClick={() => loadTheme(theme)}
                  title={preset.description}
                  aria-label={preset.name}
                  className="group text-left rounded-lg border border-[var(--pt-border)] overflow-hidden hover:border-[var(--pt-accent)] transition-colors"
                >
                  <div className="grid grid-cols-2" aria-hidden>
                    <MiniAdmin theme={theme} mode="light" />
                    <MiniAdmin theme={theme} mode="dark" />
                  </div>
                  <div className="px-2 py-1.5 bg-[var(--pt-bg)]">
                    <p className="text-[13px] font-medium text-[var(--pt-text)] truncate">{preset.name}</p>
                    <p className="text-xs text-[var(--pt-text-faint)] truncate">{preset.description}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function PresetsSection() {
  return (
    <div className="space-y-6">
      <SectionIntro scope="whole">
        Complete themes to start from. Loading one replaces your current theme — undo brings it back.
      </SectionIntro>
      <Group title="Built-in themes">
        <PresetGrid />
      </Group>
    </div>
  )
}
