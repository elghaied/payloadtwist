'use client'

import { PayloadUIShell } from '@payloadtwist/ui-sandbox'
import type { ShellTheme } from '@payloadtwist/ui-sandbox'
import { useState } from 'react'
import ScaleImpactPaletteView from '@/components/preview/ScaleImpactPaletteView'

export default function PalettePage() {
  const [theme] = useState<ShellTheme>('light')

  return (
    <PayloadUIShell theme={theme} gutter={false}>
      <ScaleImpactPaletteView />
    </PayloadUIShell>
  )
}
