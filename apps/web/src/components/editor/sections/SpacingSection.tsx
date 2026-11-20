'use client'

import { RotateCcw } from 'lucide-react'
import { SliderInput } from '@/components/editor/SliderInput'
import { DENSITIES, type Density } from '@/payload-theme/controls'
import { highlightSelectors } from '@/payload-theme/descriptions'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { PxTokenRow, Segmented } from '../control-rows'
import { Group, SectionIntro, useResolved } from '../token-ui'

const DENSITY_INFO: Record<Density, string> = {
  compact: 'Payload default · 24px',
  comfortable: 'Roomier · 40px',
  spacious: 'Touch-friendly · 46px',
}

const STEPS: [string, string][] = [
  ['--spacer-1', 'Step 1'],
  ['--spacer-1-5', 'Step 1.5'],
  ['--spacer-2', 'Step 2'],
  ['--spacer-2-5', 'Step 2.5'],
  ['--spacer-3', 'Step 3'],
  ['--spacer-4', 'Step 4'],
  ['--spacer-5', 'Step 5'],
  ['--spacer-6', 'Step 6'],
]

export function SpacingSection({ theme }: { theme: ThemeConfig }) {
  const { setDensity, setSpacing } = useEditorStore()
  const resolved = useResolved(theme).light
  const spacing = theme.controls.spacing ?? 1
  const row = (v: string, label: string, min: number, max: number) => (
    <PxTokenRow key={v} varName={v} label={label} min={min} max={max} theme={theme} resolved={resolved} />
  )

  return (
    <div className="space-y-6">
      <SectionIntro scope="global">
        Space, sizes and widths for the whole admin. Padding and margin for one element (a card, a button, table cells)
        are under Components.
      </SectionIntro>

      <Group title="Spacing scale" hint="Makes every gap, gutter and padding tighter or roomier at once. Control heights are left to Control size.">
        <div className="flex items-center gap-3">
          <SliderInput value={Math.round(spacing * 100)} min={50} max={200} step={5} unit="%" label="Spacing scale" onChange={(n) => setSpacing(n / 100)} />
          {spacing !== 1 && (
            <button onClick={() => setSpacing(1)} className="p-1 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label="Reset spacing scale">
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </Group>

      <Group title="Page & forms" hint="The spaces you notice most.">
        {row('--gutter-h', 'Page padding', 0, 96)}
        {row('--spacing-field', 'Gap between fields', 0, 64)}
        {row('--field-padding-inline', 'Padding inside fields', 0, 32)}
        {row('--spacing-view-bottom', 'Space below pages', 0, 160)}
      </Group>

      <Group title="Control size" hint="Height of fields, buttons and small controls like search and pagination.">
        <Segmented
          label="Control size"
          options={DENSITIES}
          value={theme.controls.density ?? 'compact'}
          info={DENSITY_INFO}
          onChange={setDensity}
          highlight={[...new Set(['--button-height', '--field-min-height-large', '--control-height'].flatMap(highlightSelectors))]}
        />
        {row('--button-height', 'Button height', 16, 64)}
        {row('--field-min-height-large', 'Field height', 16, 72)}
        {row('--field-min-height-medium', 'Small field height', 16, 64)}
        {row('--control-height', 'Compact control height', 16, 64)}
      </Group>

      <Group title="Layout widths" hint="Width of the main sidebar and of the sidebar inside documents.">
        {row('--nav-width', 'Main sidebar', 160, 420)}
        {row('--doc-sidebar-width', 'Document sidebar', 200, 520)}
      </Group>

      <Group title="Spacing steps" hint="Payload's spacing scale. Paddings and gaps everywhere point at these steps; the scale slider above sets them all.">
        {STEPS.map(([v, label]) => row(v, label, 0, 96))}
      </Group>
    </div>
  )
}
