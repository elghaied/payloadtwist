'use client'

import { useState } from 'react'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { ColorPopover } from '@/components/controls'
import { NumberInput, SliderInput } from '@/components/editor/SliderInput'
import {
  BORDER_STYLES,
  DEFAULT_ROUNDNESS,
  parseShadow,
  SHADOW_STYLES,
  SHADOW_VARS,
  shadowLayerTokens,
  type ShadowLayer,
} from '@/payload-theme/controls'
import { describeToken, highlightSelectors } from '@/payload-theme/descriptions'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { PxTokenRow, Segmented, SHADOW_INFO } from '../control-rows'
import { Group, SectionIntro, useHighlight, useResolved } from '../token-ui'

const RADII: [string, string, number][] = [
  ['--radius-small', 'Small (checkboxes, tags)', 16],
  ['--radius-chip', 'Chips', 24],
  ['--radius-medium', 'Medium', 32],
  ['--radius-large', 'Large (cards, popups)', 48],
  ['--button-radius', 'Buttons', 32],
  ['--field-border-radius', 'Form fields', 32],
  ['--popup-radius', 'Menus & popups', 48],
  ['--popup-item-radius', 'Items inside menus', 32],
]

const SHADOW_LABELS: Record<string, string> = {
  '--elevation-100-canvas': 'Level 1 · cards & panels',
  '--elevation-300-tooltip': 'Level 2 · tooltips',
  '--elevation-400-menu-panel': 'Level 3 · menus & dropdowns',
  '--elevation-500-modal-window': 'Level 4 · dialogs & drawers',
}

const FALLBACK_LAYER: ShadowLayer = { x: 0, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.12 }

function ShadowLevel({ varName, theme, current }: { varName: string; theme: ThemeConfig; current: string }) {
  const setShadowLevel = useEditorStore((s) => s.setShadowLevel)
  const [open, setOpen] = useState(false)
  const hover = useHighlight(highlightSelectors(varName))
  const custom = theme.controls.shadowLevels?.[varName]
  const layer = custom ?? parseShadow(current) ?? FALLBACK_LAYER
  const set = (patch: Partial<ShadowLayer>) => setShadowLevel(varName, { ...layer, ...patch })
  const preview = custom ? shadowLayerTokens(custom).light : current
  const field = (key: 'x' | 'y' | 'blur' | 'spread', label: string, min: number, max: number) => (
    <label className="flex items-center justify-between gap-1 text-xs text-[var(--pt-text-label)]">
      {label}
      <NumberInput value={layer[key]} min={min} max={max} step={0.5} unit="px" label={`${SHADOW_LABELS[varName]} ${label}`} onChange={(n) => set({ [key]: n })} />
    </label>
  )
  return (
    <div {...hover} className="border-b border-[var(--pt-border)] last:border-0">
      <div className="flex items-center gap-2 py-2">
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex-1 min-w-0 flex items-start gap-1.5 text-left">
          <ChevronRight size={14} className={`mt-0.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
          <span className="min-w-0">
            <span className="block text-[13px] text-[var(--pt-text)]">{SHADOW_LABELS[varName]}</span>
            <span className="block text-xs text-[var(--pt-text-muted)] leading-snug">{describeToken(varName)}</span>
          </span>
        </button>
        {custom && (
          <button onClick={() => setShadowLevel(varName, null)} className="p-0.5 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label={`Reset ${SHADOW_LABELS[varName]}`}>
            <RotateCcw size={11} />
          </button>
        )}
        <span className="w-10 h-7 rounded-md bg-white shrink-0" style={{ boxShadow: preview }} aria-hidden />
      </div>
      {open && (
        <div className="pl-5 pb-3 space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {field('x', 'X offset', -100, 100)}
            {field('y', 'Y offset', -100, 100)}
            {field('blur', 'Blur', 0, 200)}
            {field('spread', 'Spread', -100, 100)}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs text-[var(--pt-text-label)]">Color &amp; opacity</span>
            <ColorPopover value={layer.color} onChange={(hex) => set({ color: hex })} hasOverride={!!custom} label={`${SHADOW_LABELS[varName]} color`} />
            <SliderInput value={Math.round(layer.opacity * 100)} min={0} max={100} unit="%" label={`${SHADOW_LABELS[varName]} opacity`} onChange={(n) => set({ opacity: n / 100 })} />
          </div>
          <p className="text-xs text-[var(--pt-text-faint)]">Dark mode uses the same shape, about twice as strong, so it stays visible on dark backgrounds.</p>
        </div>
      )}
    </div>
  )
}

export function ShapeSection({ theme }: { theme: ThemeConfig }) {
  const { setRoundness, setShadows, setBorders } = useEditorStore()
  const resolved = useResolved(theme).light
  const roundness = theme.controls.roundness ?? DEFAULT_ROUNDNESS

  return (
    <div className="space-y-6">
      <SectionIntro scope="global">
        Corners, borders and shadows for the whole admin. To shape one element differently (for example round only the
        buttons), use Components.
      </SectionIntro>

      <Group title="Corner roundness" hint="One slider for every corner. Moving it resets the individual sizes below.">
        <div className="flex items-center gap-3">
          <SliderInput value={roundness} min={0} max={24} step={0.5} unit="px" label="Corner roundness" onChange={(n) => setRoundness(n)} />
          <div className="flex gap-1.5" aria-hidden>
            {[0.4, 1, 2.6].map((ratio) => (
              <span key={ratio} className="w-7 h-6 border-2 border-[var(--pt-accent)] bg-[var(--pt-accent-soft)]" style={{ borderRadius: roundness * ratio }} />
            ))}
          </div>
          {theme.controls.roundness !== undefined && (
            <button onClick={() => setRoundness(null)} className="p-1 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label="Reset roundness">
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </Group>

      <Group title="Each corner size" hint="Fine-tune one kind of corner. Buttons, fields and menus follow Medium / Large unless you set them here.">
        {RADII.map(([v, label, max]) => (
          <PxTokenRow key={v} varName={v} label={label} min={0} max={max} step={0.5} theme={theme} resolved={resolved} />
        ))}
      </Group>

      <Group title="Borders" hint="How visible the outlines of fields and controls are, and how thick.">
        <Segmented label="Border strength" options={BORDER_STYLES} value={theme.controls.borders ?? 'default'} onChange={setBorders} highlight={highlightSelectors('--special-border-translucent')} />
        <PxTokenRow varName="--stroke-width-small" label="Border width" min={0} max={4} step={0.5} theme={theme} resolved={resolved} />
        <PxTokenRow varName="--stroke-width-medium" label="Emphasized border width" min={0} max={6} step={0.5} theme={theme} resolved={resolved} />
      </Group>

      <Group title="Shadows" hint="Pick a style, then open a level to set its offset, blur, spread, color and opacity by hand.">
        <Segmented
          label="Shadows"
          options={SHADOW_STYLES}
          value={theme.controls.shadows ?? 'default'}
          info={SHADOW_INFO}
          onChange={setShadows}
          highlight={[...new Set(SHADOW_VARS.flatMap(highlightSelectors))]}
        />
        <div className="mt-1">
          {SHADOW_VARS.map((v) => (
            <ShadowLevel key={v} varName={v} theme={theme} current={resolved[v]} />
          ))}
        </div>
      </Group>
    </div>
  )
}
