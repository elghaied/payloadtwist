'use client'

import { getVariablesByCategory } from '@/payload-theme/config'
import { ColorPicker } from './ColorPicker'
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
    <div className="space-y-5">
      {STATUS_GROUPS.map(({ key, label }) => {
        const vars = getVariablesByCategory(key).filter((v) => v.overridable)
        if (vars.length === 0) return null

        return (
          <div key={key}>
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
              {label}
            </h3>
            <div className="flex gap-2">
              {vars.map((v) => {
                const value = config.light[v.var] ?? v.value
                // Extract step number from e.g. "--color-success-500"
                const step = v.var.split('-').pop() ?? ''

                return (
                  <div key={v.var} className="flex flex-col items-center gap-1">
                    <ColorPicker
                      value={value}
                      onChange={(hex) => setVariable(v.var, hex, 'light')}
                      label={v.var}
                      size="md"
                    />
                    <span className="text-[10px] text-zinc-500">{step}</span>
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
