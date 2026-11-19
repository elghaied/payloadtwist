'use client'

import { RotateCcw } from 'lucide-react'
import { FontPicker } from '@/components/editor/FontPicker'
import { ScrubberInput } from '@/components/editor/ScrubberInput'
import { FONT_VARS, type FontRole } from '@/payload-theme/controls'
import { TOKENS } from '@/payload-theme/schema'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { Group } from '../token-ui'

const ROLES: { role: FontRole; label: string; category: 'sans-serif' | 'monospace' | 'all' }[] = [
  { role: 'body', label: 'Body', category: 'sans-serif' },
  { role: 'heading', label: 'Headings', category: 'all' },
  { role: 'mono', label: 'Code', category: 'monospace' },
]

export function TypeSection({ theme }: { theme: ThemeConfig }) {
  const { setFont, setTypeScale } = useEditorStore()
  const scale = theme.controls.typeScale ?? 1

  return (
    <div className="space-y-6">
      <Group title="Fonts" hint="Google Fonts are imported by the exported CSS.">
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

      <Group title="Type scale" hint="Multiplies every Payload text size. Payload's body text is 12px; 117% gives 14px.">
        <div className="flex items-center gap-3">
          <ScrubberInput value={Math.round(scale * 100)} min={85} max={150} step={1} unit="%" onChange={(n) => setTypeScale(n / 100)} />
          <span className="text-[11px] text-[var(--pt-text-faint)]">Body {Math.round(12 * scale * 4) / 4}px</span>
          {scale !== 1 && (
            <button onClick={() => setTypeScale(1)} className="p-1 text-[var(--pt-text-faint)] hover:text-[var(--pt-text)]" aria-label="Reset type scale">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </Group>
    </div>
  )
}
