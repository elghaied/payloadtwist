'use client'

import { ComponentControlsSection } from './ComponentControlsSection'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface OverlaysTabProps {
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}

export function OverlaysTab({ config, setComponentOverride }: OverlaysTabProps) {
  return (
    <ComponentControlsSection
      regionNames={['Overlays & Modals']}
      config={config}
      setComponentOverride={setComponentOverride}
    />
  )
}
