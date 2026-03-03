'use client'

import { ComponentControlsSection } from './ComponentControlsSection'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface UIElementsTabProps {
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}

export function UIElementsTab({ config, setComponentOverride }: UIElementsTabProps) {
  return (
    <ComponentControlsSection
      regionNames={['UI Elements', 'Other']}
      config={config}
      setComponentOverride={setComponentOverride}
    />
  )
}
