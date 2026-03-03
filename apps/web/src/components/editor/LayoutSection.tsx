'use client'

import { getVariablesByCategory } from '@/payload-theme/config'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { ScrubberInput } from './ScrubberInput'

interface LayoutSectionProps {
  config: PayloadThemeConfig
  setVariable: (varName: string, value: string, mode: 'light' | 'dark') => void
  setBaseRadius: (m: number) => void
}

function parsePx(value: string): number {
  const n = parseFloat(value)
  return isNaN(n) ? 0 : n
}

function parseNumber(value: string): number {
  const n = parseInt(value)
  return isNaN(n) ? 0 : n
}

function isZVar(varName: string): boolean {
  return varName.includes('-z-') || varName.includes('z-index') || varName.startsWith('--z-')
}

function isRadiusVar(varName: string): boolean {
  return varName.includes('radius') || varName.includes('-r-')
}

const mono = "'JetBrains Mono', monospace"

export function LayoutSection({ config, setVariable, setBaseRadius }: LayoutSectionProps) {
  const vars = getVariablesByCategory('layout').filter((v) => v.overridable)

  const radiusVars = vars.filter((v) => isRadiusVar(v.var))
  const nonRadiusVars = vars.filter((v) => !isRadiusVar(v.var))

  const radiusM = parsePx(config.light['--style-radius-m'] ?? '4')
  const radiusS = parsePx(config.light['--style-radius-s'] ?? '3')
  const radiusL = parsePx(config.light['--style-radius-l'] ?? '8')

  return (
    <div className="space-y-5">
      {radiusVars.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] font-medium">Roundness</span>
            <ScrubberInput
              value={radiusM}
              onChange={(v) => setBaseRadius(v)}
              min={0}
              max={20}
              step={1}
              unit="px"
            />
          </div>

          <div className="flex gap-2">
            {[
              { label: 'S', value: radiusS },
              { label: 'M', value: radiusM },
              { label: 'L', value: radiusL },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className="w-8 h-6 bg-[var(--pt-border)] border border-[var(--pt-border-strong)]"
                  style={{ borderRadius: `${value}px` }}
                />
                <span
                  className="text-[10px] text-[var(--pt-text-muted)]"
                  style={{ fontFamily: mono }}
                >
                  {label}: {value}px
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {radiusVars.length > 0 && nonRadiusVars.length > 0 && (
        <div className="border-t border-[var(--pt-border)]" />
      )}

      {nonRadiusVars.map((v) => {
        const value = config.light[v.var] ?? v.value

        if (isZVar(v.var)) {
          const numVal = parseNumber(value)
          return (
            <div key={v.var} className="flex items-center gap-2">
              <label
                className="text-[11px] text-[var(--pt-text-label)] flex-1 truncate"
                style={{ fontFamily: mono }}
              >
                {v.var}
              </label>
              <input
                type="number"
                value={numVal}
                min={0}
                max={9999}
                step={1}
                onChange={(e) => setVariable(v.var, e.target.value, 'light')}
                className="w-20 text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded px-1.5 py-1 text-[var(--pt-text)] text-right focus:outline-none focus:border-[var(--pt-accent)]"
                style={{ fontFamily: mono }}
              />
            </div>
          )
        }

        const numVal = parsePx(value)
        const isResponsive = v.responsive
        return (
          <div key={v.var} className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                className="text-[11px] text-[var(--pt-text-label)]"
                style={{ fontFamily: mono }}
              >
                {v.var}
              </label>
              <ScrubberInput
                value={numVal}
                onChange={(n) => setVariable(v.var, `${n}px`, 'light')}
                min={0}
                max={400}
                step={4}
                unit="px"
              />
            </div>
            {isResponsive && v.note && (
              <p className="text-[10px] text-[var(--pt-text-muted)] italic">{v.note}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
