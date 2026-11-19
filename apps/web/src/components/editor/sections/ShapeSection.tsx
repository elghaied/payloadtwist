'use client'

import { RotateCcw } from 'lucide-react'
import { ScrubberInput } from '@/components/editor/ScrubberInput'
import { DEFAULT_ROUNDNESS, DENSITIES, type Density } from '@/payload-theme/controls'
import { TOKENS } from '@/payload-theme/schema'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { Group } from '../token-ui'

const DENSITY_INFO: Record<Density, string> = {
  compact: 'Payload default — 24px controls',
  comfortable: '40px controls, roomier fields',
  spacious: '46px controls, large touch targets',
}

const pxOf = (v: string | undefined) => (v ? (v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v)) : 0)

function PxTokenRow({ varName, label, min, max, theme }: { varName: string; label: string; min: number; max: number; theme: ThemeConfig }) {
  const setToken = useEditorStore((s) => s.setToken)
  const value = pxOf(theme.light[varName] ?? TOKENS[varName]?.light)
  const overridden = varName in theme.light
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="flex-1 text-[11px] text-[var(--pt-text-label)]">{label}</span>
      {overridden && (
        <button onClick={() => setToken(varName, null, 'light')} className="p-0.5 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label={`Reset ${label}`}>
          <RotateCcw size={10} />
        </button>
      )}
      <ScrubberInput value={value} min={min} max={max} step={1} unit="px" onChange={(n) => setToken(varName, `${n}px`, 'light')} />
    </div>
  )
}

export function ShapeSection({ theme }: { theme: ThemeConfig }) {
  const { setRoundness, setDensity } = useEditorStore()
  const roundness = theme.controls.roundness ?? DEFAULT_ROUNDNESS
  const density = theme.controls.density ?? 'compact'

  return (
    <div className="space-y-6">
      <Group title="Roundness" hint="One value drives every radius: buttons, fields, chips, popups and cards.">
        <div className="flex items-center gap-3">
          <ScrubberInput value={roundness} min={0} max={24} step={0.5} unit="px" onChange={(n) => setRoundness(n)} />
          <div className="flex gap-1.5">
            {[0.4, 1, 2.6].map((ratio) => (
              <span
                key={ratio}
                className="w-8 h-6 border-2 border-[var(--pt-accent)] bg-[var(--pt-accent-soft)]"
                style={{ borderRadius: roundness * ratio }}
              />
            ))}
          </div>
          {theme.controls.roundness !== undefined && (
            <button onClick={() => setRoundness(null)} className="p-1 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label="Reset roundness">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </Group>

      <Group title="Density" hint="Heights of fields, buttons and compact controls.">
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Density">
          {DENSITIES.map((d) => (
            <button
              key={d}
              role="radio"
              aria-checked={density === d}
              onClick={() => setDensity(d)}
              className={`rounded-md border px-2 py-2 text-left transition-colors ${
                density === d
                  ? 'border-[var(--pt-accent)] bg-[var(--pt-accent-soft)]'
                  : 'border-[var(--pt-border)] hover:border-[var(--pt-border-strong)]'
              }`}
            >
              <span className="block text-[11px] font-medium capitalize text-[var(--pt-text)]">{d}</span>
              <span className="block text-[10px] text-[var(--pt-text-faint)] leading-tight mt-0.5">{DENSITY_INFO[d]}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Layout">
        <PxTokenRow varName="--nav-width" label="Sidebar width" min={200} max={400} theme={theme} />
        <PxTokenRow varName="--doc-sidebar-width" label="Document sidebar width" min={240} max={480} theme={theme} />
        <PxTokenRow varName="--stroke-width-small" label="Border width" min={0} max={3} theme={theme} />
      </Group>
    </div>
  )
}
