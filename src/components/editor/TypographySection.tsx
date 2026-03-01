'use client'

import { getVariablesByCategory } from '@/payload-theme/config'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { FontPicker } from './FontPicker'
import { ScrubberInput } from './ScrubberInput'

interface TypographySectionProps {
  config: PayloadThemeConfig
  setVariable: (varName: string, value: string, mode: 'light' | 'dark') => void
}

function parsePx(value: string): number {
  const n = parseFloat(value)
  return isNaN(n) ? 0 : n
}

const mono = "'JetBrains Mono', monospace"

export function TypographySection({ config, setVariable }: TypographySectionProps) {
  const vars = getVariablesByCategory('typography').filter((v) => v.overridable)
  const fontVars = vars.filter((v) => v.resolvedType === 'font')
  const sizeVars = vars.filter((v) => v.resolvedType === 'size')
  const otherVars = vars.filter((v) => v.resolvedType !== 'font' && v.resolvedType !== 'size')

  return (
    <div className="space-y-5">
      {fontVars.map((v) => {
        const value = config.light[v.var] ?? v.value
        return (
          <FontPicker
            key={v.var}
            value={value}
            onChange={(val) => setVariable(v.var, val, 'light')}
            varName={v.var}
          />
        )
      })}

      {sizeVars.length > 0 && (
        <>
          <div className="border-t border-[#E5E2DC]" />
          {sizeVars.map((v) => {
            const value = config.light[v.var] ?? v.value
            const numVal = parsePx(value)
            return (
              <div key={v.var} className="flex items-center justify-between">
                <label
                  className="text-[11px] text-[#57534E]"
                  style={{ fontFamily: mono }}
                >
                  {v.var}
                </label>
                <ScrubberInput
                  value={numVal}
                  onChange={(n) => setVariable(v.var, `${n}px`, 'light')}
                  min={0}
                  max={64}
                  step={1}
                  unit="px"
                />
              </div>
            )
          })}
        </>
      )}

      {otherVars.map((v) => {
        const value = config.light[v.var] ?? v.value
        return (
          <div key={v.var} className="space-y-1">
            <label
              className="text-[11px] text-[#57534E] block"
              style={{ fontFamily: mono }}
            >
              {v.var}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setVariable(v.var, e.target.value, 'light')}
              className="w-full text-xs bg-[#F8F7F5] border border-[#E5E2DC] rounded px-2 py-1.5 text-[#1C1917] focus:outline-none focus:border-[#5B6CF0]"
              style={{ fontFamily: mono }}
            />
          </div>
        )
      })}
    </div>
  )
}
