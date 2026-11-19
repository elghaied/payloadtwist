'use client'

import { useState } from 'react'
import type { ThemeConfig } from '@/payload-theme/theme'
import { useEditorStore } from '@/store/editor-store'
import { Group } from '../token-ui'

export function CssSection({ theme, css }: { theme: ThemeConfig; css: string }) {
  const setCustomCss = useEditorStore((s) => s.setCustomCss)
  const [draft, setDraft] = useState(theme.customCss)
  const [synced, setSynced] = useState(theme.customCss)
  if (theme.customCss !== synced) {
    setSynced(theme.customCss)
    setDraft(theme.customCss)
  }
  const invalid = /<\/style/i.test(draft)

  return (
    <div className="space-y-6">
      <Group
        title="Custom CSS"
        hint="Appended after the generated tokens. Prefer tokens; target classes only for what tokens can't reach."
      >
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (!/<\/style/i.test(e.target.value)) setCustomCss(e.target.value)
          }}
          rows={10}
          spellCheck={false}
          placeholder={'.nav__link {\n  font-weight: 600;\n}'}
          aria-invalid={invalid}
          className="w-full font-mono text-[11px] leading-relaxed bg-[var(--pt-code-bg)] text-[var(--pt-code-text)] border border-[var(--pt-border)] rounded p-2 focus:outline-none focus:border-[var(--pt-accent)] resize-y"
        />
        {invalid && <p className="text-[11px] text-[var(--pt-danger)]">Custom CSS cannot contain {'</style>'}.</p>}
      </Group>
      <Group title="Generated output" hint="Exactly what Export gives you.">
        <pre className="font-mono text-[11px] leading-relaxed bg-[var(--pt-code-bg)] text-[var(--pt-code-text)] border border-[var(--pt-border)] rounded p-2 overflow-auto max-h-[28rem] whitespace-pre">
          {css}
        </pre>
      </Group>
    </div>
  )
}
