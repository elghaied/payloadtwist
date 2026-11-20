'use client'

import { useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import { ColorPopover } from '@/components/controls'
import { PRESET_GROUPS, presetTheme, THEME_PRESETS } from '@/payload-theme/presets'
import { defaultSeed, SEED_KEYS, SEEDS, type SeedKey } from '@/payload-theme/ramps'
import { DEFAULT_RAMPS, rampVar, resolveAll } from '@/payload-theme/schema'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { Group } from '../token-ui'

const steps = (family: string) => Object.keys(DEFAULT_RAMPS[family]).sort((a, b) => +a - +b)

function RampStrip({ family, theme }: { family: string; theme: ThemeConfig }) {
  const setRamp = useEditorStore((s) => s.setRamp)
  return (
    <div className="flex items-center gap-2">
      <code className="w-20 text-xs text-[var(--pt-text-faint)] truncate">{family}</code>
      <div className="flex flex-1 gap-px rounded overflow-hidden">
        {steps(family).map((step) => {
          const v = rampVar(family, step)
          const value = theme.ramps[v] ?? DEFAULT_RAMPS[family][step]
          return (
            <div key={step} className="flex-1">
              <ColorPopover
                value={value}
                onChange={(hex) => setRamp(v, hex)}
                label={v}
                swatchClassName="w-full h-5 rounded-none border-0 shadow-none hover:scale-100 hover:brightness-110"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SeedRow({ seed, theme }: { seed: SeedKey; theme: ThemeConfig }) {
  const setSeed = useEditorStore((s) => s.setSeed)
  const spec = SEEDS[seed]
  const value = theme.seeds[seed]
  return (
    <div className="space-y-1.5 py-1.5">
      <div className="flex items-center gap-2">
        <ColorPopover value={value ?? defaultSeed(seed)} onChange={(hex) => setSeed(seed, hex)} hasOverride={!!value} label={spec.label} swatchSize="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--pt-text)]">{spec.label}</p>
          <p className="text-[13px] text-[var(--pt-text-faint)] truncate">{spec.description}</p>
        </div>
        {value && (
          <button
            onClick={() => setSeed(seed, null)}
            className="p-1 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]"
            aria-label={`Reset ${spec.label}`}
            title="Reset to Payload default"
          >
            <RotateCcw size={11} />
          </button>
        )}
      </div>
      {[spec.family, ...spec.related].map((f) => (
        <RampStrip key={f} family={f} theme={theme} />
      ))}
    </div>
  )
}

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

export function PaletteSection({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="space-y-6">
      <Group title="Start from a preset" hint="Replaces the current theme — undo brings it back.">
        <PresetGrid />
      </Group>
      <Group title="Seed colors" hint="Each seed regenerates a Payload ramp family along Payload's own lightness curve. Click any ramp step to fine-tune it.">
        <div className="divide-y divide-[var(--pt-border)]">
          {SEED_KEYS.map((k) => (
            <SeedRow key={k} seed={k} theme={theme} />
          ))}
        </div>
      </Group>
    </div>
  )
}
