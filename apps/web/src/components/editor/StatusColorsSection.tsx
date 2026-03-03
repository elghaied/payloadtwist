'use client'

import { getVariablesByCategory } from '@/payload-theme/config'
import { ColorPopover } from '@/components/controls'
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
  return (
    <div className="flex gap-4">
      {STATUS_GROUPS.map(({ key, label }) => {
        const vars = getVariablesByCategory(key).filter((v) => v.overridable)
        if (vars.length === 0) return null

        return (
          <div key={key} className="flex-1">
            <span className="text-[11px] font-medium text-[var(--pt-text-muted)] mb-1 block">{label}</span>
            <div className="flex flex-col gap-1">
              {vars.map((v) => {
                const value = config.light[v.var] ?? v.value
                const step = v.var.split('-').pop() ?? ''

                return (
                  <div key={v.var} className="flex items-center gap-2">
                    <ColorPopover
                      value={value}
                      onChange={(hex) => setVariable(v.var, hex, 'light')}
                      label={v.var}
                      defaultValue={v.value}
                    />
                    <span className="text-[10px] text-[var(--pt-text-muted)]">{step}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
