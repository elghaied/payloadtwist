'use client'

import { useState } from 'react'
import { SectionHeader } from '@/components/controls'
import { PaletteSelector } from '../PaletteSelector'
import { BaseScaleEditor } from '../BaseScaleEditor'
import { PaletteEditor } from '../PaletteEditor'
import { ThemeColorsSection } from '../ThemeColorsSection'
import { StatusColorsSection } from '../StatusColorsSection'
import { TypographySection } from '../TypographySection'
import { LayoutSection } from '../LayoutSection'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface GeneralTabProps {
  config: PayloadThemeConfig
  setVariable: (varName: string, value: string, mode: 'light' | 'dark') => void
  setBaseScale: (vars: Record<string, string>) => void
  setBaseRadius: (m: number) => void
  importTheme: (config: PayloadThemeConfig) => void
  resetTheme: () => void
}

export function GeneralTab({
  config,
  setVariable,
  setBaseScale,
  setBaseRadius,
  importTheme,
  resetTheme,
}: GeneralTabProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    colors: true,
    theme: true,
    status: true,
    typography: true,
    layout: true,
  })

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-1">
      {/* Colors section */}
      <SectionHeader label="Colors" isOpen={openSections.colors} onToggle={() => toggle('colors')} />
      {openSections.colors && (
        <div className="pl-1 pb-4 space-y-5">
          <PaletteSelector onApply={importTheme} onReset={resetTheme} />
          <div>
            <p className="text-[10px] text-[#78726C] mb-3 uppercase tracking-wider font-medium">
              Fine-Tune Base Scale
            </p>
            <BaseScaleEditor
              config={config}
              setBaseScale={setBaseScale}
              setVariable={setVariable}
            />
          </div>
          <div>
            <p className="text-[10px] text-[#78726C] mb-3 uppercase tracking-wider font-medium">
              General Palette
            </p>
            <PaletteEditor config={config} setBaseScale={setBaseScale} />
          </div>
        </div>
      )}

      {/* Theme Colors */}
      <SectionHeader label="Theme Colors" isOpen={openSections.theme} onToggle={() => toggle('theme')} />
      {openSections.theme && (
        <div className="pl-1 pb-4">
          <ThemeColorsSection config={config} setVariable={setVariable} />
        </div>
      )}

      {/* Status Colors */}
      <SectionHeader label="Status Colors" isOpen={openSections.status} onToggle={() => toggle('status')} />
      {openSections.status && (
        <div className="pl-1 pb-4">
          <StatusColorsSection config={config} setVariable={setVariable} />
        </div>
      )}

      {/* Typography */}
      <SectionHeader label="Typography" isOpen={openSections.typography} onToggle={() => toggle('typography')} />
      {openSections.typography && (
        <div className="pl-1 pb-4">
          <TypographySection config={config} setVariable={setVariable} />
        </div>
      )}

      {/* Layout */}
      <SectionHeader label="Layout" isOpen={openSections.layout} onToggle={() => toggle('layout')} />
      {openSections.layout && (
        <div className="pl-1 pb-4">
          <LayoutSection config={config} setVariable={setVariable} setBaseRadius={setBaseRadius} />
        </div>
      )}
    </div>
  )
}
