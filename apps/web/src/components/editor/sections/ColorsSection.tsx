'use client'

import { RotateCcw } from 'lucide-react'
import { ColorPopover } from '@/components/controls'
import { blockName } from '@/payload-theme/descriptions'
import { defaultSeed, SEED_KEYS, SEEDS, seedUsage, type SeedKey } from '@/payload-theme/ramps'
import { DEFAULT_RAMPS, rampVar } from '@/payload-theme/schema'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { Group, SectionIntro, useHighlight } from '../token-ui'

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
  const usage = seedUsage(seed)
  const hover = useHighlight(usage.map((b) => `.${b}`))
  return (
    <div className="space-y-1.5 py-2" {...hover}>
      <div className="flex items-center gap-2">
        <ColorPopover value={value ?? defaultSeed(seed)} onChange={(hex) => setSeed(seed, hex)} hasOverride={!!value} label={spec.label} swatchSize="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--pt-text)]">{spec.label}</p>
          <p className="text-xs text-[var(--pt-text-muted)] leading-snug">{spec.description}</p>
          <p className="text-xs text-[var(--pt-text-faint)] leading-snug">
            Reaches {usage.length} components, e.g. {usage.slice(0, 4).map(blockName).join(', ')} — hover to see them.
          </p>
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

export function ColorsSection({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="space-y-6">
      <SectionIntro scope="global">
        Your palette. Each color generates a full Payload color scale — everything that uses that scale (buttons, links,
        badges, statuses, greys) changes with it.
      </SectionIntro>
      <Group title="Palette colors" hint="Pick a color for each role. The strip under it is the generated scale — click any step to fine-tune it.">
        <div className="divide-y divide-[var(--pt-border)]">
          {/* Only seeds whose scales Payload actually uses (e.g. its purple "component" scale is unused) */}
          {SEED_KEYS.filter((k) => seedUsage(k).length > 0).map((k) => (
            <SeedRow key={k} seed={k} theme={theme} />
          ))}
        </div>
      </Group>
    </div>
  )
}
