'use client'

import { ComponentControlsSection } from './ComponentControlsSection'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface FieldsTabProps {
  config: PayloadThemeConfig
  setComponentOverride: (selector: string, property: string, value: string) => void
}

export function FieldsTab({ config, setComponentOverride }: FieldsTabProps) {
  return (
    <ComponentControlsSection
      regionNames={['Fields']}
      config={config}
      setComponentOverride={setComponentOverride}
    />
  )
}
