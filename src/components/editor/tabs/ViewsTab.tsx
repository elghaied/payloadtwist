'use client'

import { ComponentControlsSection } from './ComponentControlsSection'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface ViewsTabProps {
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}

export function ViewsTab({ config, setComponentOverride }: ViewsTabProps) {
  return (
    <ComponentControlsSection
      regionNames={['List View', 'Edit View']}
      config={config}
      setComponentOverride={setComponentOverride}
    />
  )
}
