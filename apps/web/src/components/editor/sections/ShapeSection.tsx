'use client'

import { RotateCcw } from 'lucide-react'
import { ScrubberInput } from '@/components/editor/ScrubberInput'
import { BORDER_STYLES, DEFAULT_ROUNDNESS, SHADOW_STYLES } from '@/payload-theme/controls'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { PxTokenRow, Segmented, SHADOW_INFO } from '../control-rows'
import { Group, SectionIntro } from '../token-ui'

export function ShapeSection({ theme }: { theme: ThemeConfig }) {
  const { setRoundness, setShadows, setBorders } = useEditorStore()
  const roundness = theme.controls.roundness ?? DEFAULT_ROUNDNESS

  return (
    <div className="space-y-6">
      <SectionIntro scope="global">
        Corners, borders and shadows for the whole admin. To shape one element differently (for example round only the
        buttons), use Components.
      </SectionIntro>

      <Group title="Corner roundness" hint="How rounded corners are — buttons, fields, chips, menus and cards all follow it.">
        <div className="flex items-center gap-3">
          <ScrubberInput value={roundness} min={0} max={24} step={0.5} unit="px" onChange={(n) => setRoundness(n)} />
          <div className="flex gap-1.5" aria-hidden>
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
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </Group>

      <Group title="Borders" hint="How visible the outlines of fields and controls are.">
        <Segmented label="Border strength" options={BORDER_STYLES} value={theme.controls.borders ?? 'default'} onChange={setBorders} />
        <PxTokenRow varName="--stroke-width-small" label="Border width" min={0} max={3} theme={theme} />
      </Group>

      <Group title="Shadows" hint="Depth under cards, tooltips, menus and dialogs.">
        <Segmented label="Shadows" options={SHADOW_STYLES} value={theme.controls.shadows ?? 'default'} info={SHADOW_INFO} onChange={setShadows} />
      </Group>
    </div>
  )
}
