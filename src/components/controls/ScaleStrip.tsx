'use client'

import { ColorSwatch } from './ColorSwatch'
import { ColorPopover } from './ColorPopover'

interface ScaleStep {
  step: number
  color: string
  isOverridden: boolean
  isAnchor?: boolean
  defaultColor?: string
}

interface ScaleStripProps {
  steps: ScaleStep[]
  onStepChange?: (step: number, color: string) => void
  onStepReset?: (step: number) => void
}

export function ScaleStrip({ steps, onStepChange, onStepReset }: ScaleStripProps) {
  return (
    <div>
      <div className="flex gap-0.5">
        {steps.map((s) => (
          <div key={s.step} className="flex-1 flex justify-center">
            <ColorPopover
              value={s.color}
              onChange={(hex) => onStepChange?.(s.step, hex)}
              label={`--color-base-${s.step}`}
              hasOverride={s.isOverridden}
              swatchSize={s.isAnchor ? 'lg' : 'sm'}
              defaultValue={s.defaultColor}
            />
          </div>
        ))}
      </div>
      {/* Step labels */}
      <div className="flex gap-0.5 mt-1">
        {steps.map((s) => (
          <div key={s.step} className="flex-1 text-center">
            <span
              className="text-[9px] text-[#78726C]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {s.step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
