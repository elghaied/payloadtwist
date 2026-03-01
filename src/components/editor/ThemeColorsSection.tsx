'use client'

import { getVariablesByCategory } from '@/payload-theme/config'
import { ColorPopover } from '@/components/controls'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface ThemeColorsSectionProps {
  config: PayloadThemeConfig
  setVariable: (varName: string, value: string, mode: 'light' | 'dark') => void
}

export function ThemeColorsSection({ config, setVariable }: ThemeColorsSectionProps) {
  const vars = getVariablesByCategory('theme').filter((v) => v.overridable)

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {vars.map((v) => {
          const lightValue = config.light[v.var] ?? v.value
          const darkValue = config.dark[v.var] ?? ''

          return (
            <div
              key={v.var}
              className="flex items-center gap-2 py-1.5 border-b border-[#E5E2DC] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <code
                  className="text-[11px] text-[#57534E] block truncate"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {v.var}
                </code>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  <ColorPopover
                    value={lightValue}
                    onChange={(hex) => setVariable(v.var, hex, 'light')}
                    label={`${v.var} (light)`}
                    defaultValue={v.value}
                    swatchSize="sm"
                  />
                  <span className="text-[9px] text-[#78726C]">light</span>
                </div>
                {v.darkMode === 'explicit' && (
                  <div className="flex flex-col items-center gap-0.5">
                    <ColorPopover
                      value={darkValue || '#000000'}
                      onChange={(hex) => setVariable(v.var, hex, 'dark')}
                      label={`${v.var} (dark)`}
                      swatchSize="sm"
                    />
                    <span className="text-[9px] text-[#78726C]">dark</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-[#78726C] italic">
        Elevation colors auto-invert in dark mode — no overrides needed.
      </p>
    </div>
  )
}
