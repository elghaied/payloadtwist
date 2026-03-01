'use client'

import { useState } from 'react'
import { getVariablesByCategory } from '@/payload-theme/config'
import { ColorPopover, SectionHeader } from '@/components/controls'
import type { PayloadThemeConfig } from '@/payload-theme/types'

const STATUS_GROUPS = [
  { key: 'status.success', label: 'Success' },
  { key: 'status.warning', label: 'Warning' },
  { key: 'status.error', label: 'Error' },
] as const

interface StatusColorsSectionProps {
  config: PayloadThemeConfig
  setVariable: (varName: string, value: string, mode: 'light' | 'dark') => void
}

export function StatusColorsSection({ config, setVariable }: StatusColorsSectionProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'status.success': true,
    'status.warning': true,
    'status.error': true,
  })

  return (
    <div className="space-y-1">
      {STATUS_GROUPS.map(({ key, label }) => {
        const vars = getVariablesByCategory(key).filter((v) => v.overridable)
        if (vars.length === 0) return null

        const isOpen = openGroups[key] ?? true

        return (
          <div key={key}>
            <SectionHeader
              label={label}
              count={vars.length}
              isOpen={isOpen}
              onToggle={() =>
                setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
              }
            />
            {isOpen && (
              <div className="flex gap-2 pl-5 pb-3 pt-1">
                {vars.map((v) => {
                  const value = config.light[v.var] ?? v.value
                  const step = v.var.split('-').pop() ?? ''

                  return (
                    <div key={v.var} className="flex flex-col items-center gap-1">
                      <ColorPopover
                        value={value}
                        onChange={(hex) => setVariable(v.var, hex, 'light')}
                        label={v.var}
                        defaultValue={v.value}
                      />
                      <span className="text-[10px] text-[#78726C]">{step}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
