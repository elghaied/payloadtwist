'use client'

import { ColorPopover } from './ColorPopover'

interface ScaleStep {
  step: number
  color: string
  isOverridden: boolean
  isAnchor?: boolean
  defaultColor?: string
  impactLabels?: string[]
  impactCount?: number
}

interface ScaleStripProps {
  steps: ScaleStep[]
  onStepChange?: (step: number, color: string) => void
  onStepReset?: (step: number) => void
  selectedStep?: number | null
  onStepAddPoint?: (step: number) => void
  onStepSelectPoint?: (step: number) => void
}

export function ScaleStrip({
  steps,
  onStepChange,
  onStepReset: _onStepReset,
  selectedStep,
  onStepAddPoint,
  onStepSelectPoint,
}: ScaleStripProps) {
  return (
    <div>
      {/* Indicator dots */}
      <div className="flex gap-0.5 mb-1">
        {steps.map((s) => {
          const isSelected = s.step === selectedStep
          const isAnchor = s.isAnchor

          return (
            <div key={s.step} className="flex-1 flex justify-center">
              {isAnchor ? (
                <button
                  onClick={() => onStepSelectPoint?.(s.step)}
                  className="w-3 h-3 rounded-full transition-all"
                  style={{
                    background: s.color,
                    boxShadow: isSelected
                      ? '0 0 0 2px var(--pt-accent), 0 0 6px rgba(168,85,247,0.4)'
                      : '0 0 0 1px rgba(255,255,255,0.15)',
                  }}
                  title={`Step ${s.step} — click to select`}
                />
              ) : (
                <button
                  onClick={() => onStepAddPoint?.(s.step)}
                  className="w-3 h-3 rounded-full border border-dashed border-[var(--pt-border-strong)] bg-transparent hover:border-[var(--pt-accent)] hover:bg-[var(--pt-accent-soft)] transition-all"
                  title={`Step ${s.step} — click to add anchor`}
                />
              )}
            </div>
          )
        })}
      </div>
      {/* Color swatches */}
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
              className="text-[9px] text-[var(--pt-text-muted)]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {s.step}
            </span>
          </div>
        ))}
      </div>
      {/* Impact labels — vertical text under each step */}
      {steps.some(s => s.impactLabels && s.impactLabels.length > 0) && (
        <div className="flex gap-0.5 mt-1.5 pt-1.5 border-t border-[var(--pt-border)]">
          {steps.map((s) => (
            <div key={s.step} className="flex-1 flex flex-col items-center gap-0">
              {(s.impactLabels ?? []).map((label, i) => (
                <span
                  key={label}
                  className="text-[8px] leading-none text-[var(--pt-text-muted)] truncate"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    maxHeight: '60px',
                    opacity: i === 0 ? 0.9 : 0.5,
                  }}
                  title={`Step ${s.step}: ${s.impactCount} components — ${label}`}
                >
                  {label}
                </span>
              ))}
              {(s.impactCount ?? 0) > (s.impactLabels?.length ?? 0) && (
                <span
                  className="text-[7px] text-[var(--pt-text-muted)] opacity-40"
                  title={`${s.impactCount} total components use step ${s.step}`}
                >
                  +{(s.impactCount ?? 0) - (s.impactLabels?.length ?? 0)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
