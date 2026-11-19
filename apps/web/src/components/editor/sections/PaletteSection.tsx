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
      <code className="w-20 text-[10px] text-[var(--pt-text-faint)] truncate">{family}</code>
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
          <p className="text-[11px] text-[var(--pt-text-faint)] truncate">{spec.description}</p>
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

function PresetGrid() {
  const loadTheme = useEditorStore((s) => s.loadTheme)
  const previews = useMemo(
    () =>
      THEME_PRESETS.map((p) => {
        const t = presetTheme(p)
        const r = resolveAll('light', t)
        return { preset: p, theme: t, chips: [r['--color-bg'], r['--color-bg-brand'], r['--color-bg-component'], r['--ramp-grey-500']] }
      }),
    [],
  )
  return (
    <div className="space-y-3">
      {PRESET_GROUPS.map((g) => (
        <div key={g.id}>
          <p className="text-[10px] text-[var(--pt-text-faint)] mb-1">{g.label}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {previews
              .filter((p) => p.preset.group === g.id)
              .map(({ preset, theme, chips }) => (
                <button
                  key={preset.id}
                  onClick={() => loadTheme(theme)}
                  title={preset.description}
                  className="flex items-center gap-2 rounded-md border border-[var(--pt-border)] bg-[var(--pt-bg)] px-2 py-1.5 text-left hover:border-[var(--pt-border-strong)] hover:bg-[var(--pt-surface-hover)] transition-colors"
                >
                  <span className="flex -space-x-1">
                    {chips.map((c, i) => (
                      <span key={i} className="w-3.5 h-3.5 rounded-full border border-[var(--pt-border)]" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="text-[11px] text-[var(--pt-text)] truncate">{preset.name}</span>
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
