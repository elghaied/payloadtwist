import { resolveAll } from '@/payload-theme/schema'
import { parseTheme, type ThemeConfig } from '@/payload-theme/theme'

const ROLES = [
  '--color-bg',
  '--color-bg-secondary',
  '--color-bg-brand',
  '--color-bg-component',
  '--color-bg-success',
  '--color-bg-warning',
  '--color-bg-danger',
  '--color-text',
]

/** Light and dark strips of a theme's key roles, resolved exactly as Payload would. */
export function ThemeSwatches({ themeData, size = 'sm' }: { themeData: ThemeConfig | unknown; size?: 'sm' | 'lg' }) {
  let theme: ThemeConfig
  try {
    theme = parseTheme(themeData)
  } catch {
    return null
  }
  const h = size === 'lg' ? 'h-10' : 'h-4'
  return (
    <div className="space-y-0.5" aria-hidden>
      {(['light', 'dark'] as const).map((mode) => {
        const r = resolveAll(mode, theme)
        return (
          <div key={mode} className="flex overflow-hidden first:rounded-t last:rounded-b">
            {ROLES.map((v) => (
              <div key={v} className={`${h} flex-1`} style={{ background: r[v] }} title={`${v} (${mode})`} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
