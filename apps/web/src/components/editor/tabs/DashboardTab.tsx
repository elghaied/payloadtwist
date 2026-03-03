'use client'

import { useState } from 'react'
import { ComponentControlsSection } from './ComponentControlsSection'
import { BemSection } from '../BemSection'
import { SectionHeader } from '@/components/controls'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface DashboardTabProps {
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}

export function DashboardTab({ config, setComponentOverride }: DashboardTabProps) {
  const [rawCssOpen, setRawCssOpen] = useState(false)

  return (
    <div className="space-y-2">
      <ComponentControlsSection
        regionNames={['Navigation', 'App Shell']}
        config={config}
        setComponentOverride={setComponentOverride}
      />

      <div className="border-t border-[var(--pt-border)] pt-2">
        <SectionHeader
          label="Raw CSS"
          isOpen={rawCssOpen}
          onToggle={() => setRawCssOpen(!rawCssOpen)}
        />
        {rawCssOpen && (
          <div className="pt-2">
            <BemSection config={config} />
          </div>
        )}
      </div>
    </div>
  )
}
