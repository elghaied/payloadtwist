'use client'

import { RotateCcw } from 'lucide-react'
import { FontPicker } from '@/components/editor/FontPicker'
import { NumberInput, SliderInput } from '@/components/editor/SliderInput'
import { boldWeightTokens, FONT_VARS, TYPE_LEVELS, typeLevelTokens, typeVar, type FontRole, type TypeProp } from '@/payload-theme/controls'
import { highlightSelectors } from '@/payload-theme/descriptions'
import { TOKENS } from '@/payload-theme/schema'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { pxOf } from '../control-rows'
import { Group, SectionIntro, useHighlight, useResolved } from '../token-ui'

const COLUMNS: { prop: TypeProp; label: string; min: number; max: number; step: number }[] = [
  { prop: 'font-size', label: 'Size', min: 6, max: 96, step: 0.5 },
  { prop: 'line-height', label: 'Line', min: 6, max: 120, step: 0.5 },
  { prop: 'font-weight', label: 'Weight', min: 100, max: 900, step: 50 },
  { prop: 'letter-spacing', label: 'Spacing', min: -5, max: 10, step: 0.05 },
]

const valueOf = (prop: TypeProp, v: string) => (prop === 'font-weight' ? parseFloat(v) || 400 : +pxOf(v).toFixed(2) || 0)

function TypeLevelRow({ level, label, theme, resolved }: { level: string; label: string; theme: ThemeConfig; resolved: Record<string, string> }) {
  const setTokens = useEditorStore((s) => s.setTokens)
  const hover = useHighlight(highlightSelectors(typeVar(level, 'font-size')))
  const vars = COLUMNS.flatMap((c) => Object.keys(typeLevelTokens(level, c.prop, 0)))
  const overridden = vars.some((v) => v in theme.light)
  const size = valueOf('font-size', resolved[typeVar(level, 'font-size')])
  return (
    <div {...hover} className="grid grid-cols-[1fr_repeat(4,auto)_14px] items-center gap-1 py-0.5 rounded hover:bg-[var(--pt-surface-hover)] -mx-1 px-1">
      <span className="text-[13px] capitalize text-[var(--pt-text)] truncate" style={{ fontSize: Math.min(18, Math.max(11, size)) }}>
        {label}
      </span>
      {COLUMNS.map((c) => (
        <NumberInput
          key={c.prop}
          value={valueOf(c.prop, resolved[typeVar(level, c.prop)])}
          min={c.min}
          max={c.max}
          step={c.step}
          label={`${level} ${c.label}`}
          onChange={(n) => setTokens(typeLevelTokens(level, c.prop, n), 'light')}
        />
      ))}
      {overridden ? (
        <button onClick={() => setTokens(Object.fromEntries(vars.map((v) => [v, null])), 'light')} className="text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label={`Reset ${level}`}>
          <RotateCcw size={11} />
        </button>
      ) : (
        <span />
      )}
    </div>
  )
}

const LEVEL_GROUPS = [...new Set(TYPE_LEVELS.map((l) => l.group))]

const ROLES: { role: FontRole; label: string; category: 'sans-serif' | 'monospace' | 'all' }[] = [
  { role: 'body', label: 'Body', category: 'sans-serif' },
  { role: 'heading', label: 'Headings', category: 'all' },
  { role: 'mono', label: 'Code', category: 'monospace' },
]

export function TypeSection({ theme }: { theme: ThemeConfig }) {
  const { setFont, setTypeScale, setTokens } = useEditorStore()
  const resolved = useResolved(theme).light
  const scale = theme.controls.typeScale ?? 1
  const boldVars = Object.keys(boldWeightTokens(0))
  const boldWeight = parseFloat(resolved[boldVars[0]]) || 550

  return (
    <div className="space-y-6">
      <SectionIntro scope="global">Typefaces and text sizes for the whole admin.</SectionIntro>
      <Group title="Typefaces" hint="Pick from Google Fonts or system fonts. Google Fonts are loaded by the exported CSS.">
        <div className="space-y-2">
          {ROLES.map(({ role, label, category }) => (
            <div key={role} className="flex items-end gap-1.5">
              <div className="flex-1 min-w-0">
                <FontPicker
                  label={label}
                  value={theme.controls.fonts?.[role] ?? TOKENS[FONT_VARS[role]].light}
                  onChange={(value) => setFont(role, value)}
                  defaultCategory={category}
                />
              </div>
              {theme.controls.fonts?.[role] && (
                <button onClick={() => setFont(role, null)} className="p-1.5 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label={`Reset ${label} font`}>
                  <RotateCcw size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Group>

      <Group title="Type scale" hint="Multiplies every Payload text size. Payload's body text is 12px; 117% gives 14px. Moving it resets sizes set below.">
        <div className="flex items-center gap-3">
          <SliderInput value={Math.round(scale * 100)} min={85} max={150} step={1} unit="%" label="Type scale" onChange={(n) => setTypeScale(n / 100)} />
          <span className="text-[13px] text-[var(--pt-text-faint)]">Body {Math.round(12 * scale * 4) / 4}px</span>
          {scale !== 1 && (
            <button onClick={() => setTypeScale(1)} className="p-1 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label="Reset type scale">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </Group>
      <Group title="Bold weight" hint="Weight of bold body text: buttons, labels, table headers. Payload uses 550.">
        <div className="flex items-center gap-3">
          <SliderInput value={boldWeight} min={400} max={900} step={50} label="Bold weight" onChange={(n) => setTokens(boldWeightTokens(n), 'light')} />
          {boldVars.some((v) => v in theme.light) && (
            <button onClick={() => setTokens(Object.fromEntries(boldVars.map((v) => [v, null])), 'light')} className="p-1 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label="Reset bold weight">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </Group>

      {LEVEL_GROUPS.map((group) => (
        <Group
          key={group}
          title={group}
          hint={group === 'Body text' ? 'Sizes in px, line height in px, weight 100–900, letter spacing in px. Medium is the default body text.' : undefined}
        >
          <div className="grid grid-cols-[1fr_repeat(4,auto)_14px] gap-1 px-0 text-xs text-[var(--pt-text-faint)]">
            <span />
            {COLUMNS.map((c) => (
              <span key={c.prop} className="w-[4.25rem] text-right pr-1">{c.label}</span>
            ))}
            <span />
          </div>
          {TYPE_LEVELS.filter((l) => l.group === group).map((l) => (
            <TypeLevelRow key={l.id} level={l.id} label={l.label} theme={theme} resolved={resolved} />
          ))}
        </Group>
      ))}
    </div>
  )
}
