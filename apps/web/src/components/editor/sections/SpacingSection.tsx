'use client'

import { DENSITIES, type Density } from '@/payload-theme/controls'
import { highlightSelectors } from '@/payload-theme/descriptions'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { PxTokenRow, Segmented } from '../control-rows'
import { Group, SectionIntro } from '../token-ui'

const DENSITY_INFO: Record<Density, string> = {
  compact: 'Payload default · 24px',
  comfortable: 'Roomier · 40px',
  spacious: 'Touch-friendly · 46px',
}

export function SpacingSection({ theme }: { theme: ThemeConfig }) {
  const setDensity = useEditorStore((s) => s.setDensity)
  return (
    <div className="space-y-6">
      <SectionIntro scope="global">
        Sizes and spacing for the whole admin: how tall controls are and how wide the side panels are. Padding for one
        element (a card, a button) is under Components.
      </SectionIntro>

      <Group title="Control size" hint="Height of fields, buttons and small controls like search and pagination.">
        <Segmented
          label="Control size"
          options={DENSITIES}
          value={theme.controls.density ?? 'compact'}
          info={DENSITY_INFO}
          onChange={setDensity}
          highlight={[...new Set(['--button-height', '--field-min-height-large', '--control-height'].flatMap(highlightSelectors))]}
        />
      </Group>

      <Group title="Layout widths" hint="Width of the main sidebar and of the sidebar inside documents.">
        <PxTokenRow varName="--nav-width" label="Main sidebar" min={200} max={400} theme={theme} />
        <PxTokenRow varName="--doc-sidebar-width" label="Document sidebar" min={240} max={480} theme={theme} />
      </Group>
    </div>
  )
}
