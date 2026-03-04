'use client'

import type { PayloadThemeConfig } from '@/payload-theme/types'
import { FontPicker } from './FontPicker'
import { ScrubberInput } from './ScrubberInput'
import { ColorPopover } from '@/components/controls'

interface TextSectionProps {
  config: PayloadThemeConfig
  setVariable: (varName: string, value: string, mode: 'light' | 'dark') => void
  setComponentOverride: (selector: string, property: string, value: string) => void
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_FONT_BODY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
const DEFAULT_FONT_MONO = "'SF Mono', Menlo, Consolas, Monaco, monospace"
const DEFAULT_FONT_SERIF =
  "'Georgia', 'Bitstream Charter', 'Charis SIL', Utopia, 'URW Bookman L', serif"

const DEFAULT_BODY_TEXT_DARK = '#f3f3f3'
const DEFAULT_BASE_800_FALLBACK = '#2f2f2f'

const HEADING_LIGHT_SELECTOR = 'h1, h2, h3, h4, h5, h6'
const HEADING_DARK_SELECTOR = '[data-theme="dark"] :is(h1, h2, h3, h4, h5, h6)'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rgbToHex(value: string): string {
  const match = value.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (!match) return DEFAULT_BASE_800_FALLBACK
  return (
    '#' +
    [match[1], match[2], match[3]]
      .map((n) => parseInt(n).toString(16).padStart(2, '0'))
      .join('')
  )
}

function resolveBase800Color(config: PayloadThemeConfig): string {
  const raw = config.light['--color-base-800']
  if (!raw) return DEFAULT_BASE_800_FALLBACK
  if (raw.startsWith('#')) return raw
  if (raw.startsWith('rgb(')) return rgbToHex(raw)
  return DEFAULT_BASE_800_FALLBACK
}

function parseNumber(value: string): number {
  const n = parseFloat(value)
  return isNaN(n) ? 0 : n
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TextSection({ config, setVariable, setComponentOverride }: TextSectionProps) {
  // Font values
  const bodyFont = config.light['--font-body'] ?? DEFAULT_FONT_BODY
  const monoFont = config.light['--font-mono'] ?? DEFAULT_FONT_MONO
  const serifFont = config.light['--font-serif'] ?? DEFAULT_FONT_SERIF

  // Text color values
  const bodyLightColor = config.light['--theme-text'] ?? resolveBase800Color(config)
  const bodyDarkColor = config.dark['--theme-text'] ?? DEFAULT_BODY_TEXT_DARK

  const headingLightOverride =
    config.componentOverrides?.[`${HEADING_LIGHT_SELECTOR}||color`]
  const headingDarkOverride =
    config.componentOverrides?.[`${HEADING_DARK_SELECTOR}||color`]
  const headingLightColor = headingLightOverride ?? bodyLightColor
  const headingDarkColor = headingDarkOverride ?? bodyDarkColor
  const hasHeadingOverride = !!(headingLightOverride || headingDarkOverride)

  // Size values
  const bodyFontSize = parseNumber(config.light['--base-body-size'] ?? '13')
  const basePx = parseNumber(config.light['--base-px'] ?? '20')

  return (
    <div className="space-y-5">
      {/* ── Group 1: Fonts ── */}
      <div className="space-y-4">
        <span className="text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] font-medium">
          Fonts
        </span>

        <FontPicker
          value={bodyFont}
          onChange={(val) => setVariable('--font-body', val, 'light')}
          label="Body Font"
          defaultCategory="all"
        />

        <FontPicker
          value={monoFont}
          onChange={(val) => setVariable('--font-mono', val, 'light')}
          label="Monospace Font"
          defaultCategory="monospace"
        />

        <FontPicker
          value={serifFont}
          onChange={(val) => setVariable('--font-serif', val, 'light')}
          label="Serif Font"
          defaultCategory="serif"
        />
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-[var(--pt-border)]" />

      {/* ── Group 2: Text Colors ── */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] font-medium">
          Text Colors
        </span>

        {/* Body Text row */}
        <div className="flex items-center gap-2 py-1.5">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-[var(--pt-text-label)] block">Body Text</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex flex-col items-center gap-0.5">
              <ColorPopover
                value={bodyLightColor}
                onChange={(hex) => setVariable('--theme-text', hex, 'light')}
                label="Body Text (light)"
                defaultValue={resolveBase800Color(config)}
                swatchSize="sm"
              />
              <span className="text-[9px] text-[var(--pt-text-muted)]">light</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <ColorPopover
                value={bodyDarkColor}
                onChange={(hex) => setVariable('--theme-text', hex, 'dark')}
                label="Body Text (dark)"
                defaultValue={DEFAULT_BODY_TEXT_DARK}
                swatchSize="sm"
              />
              <span className="text-[9px] text-[var(--pt-text-muted)]">dark</span>
            </div>
          </div>
        </div>

        {/* Headings row */}
        <div className="flex items-center gap-2 py-1.5">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-[var(--pt-text-label)] block">Headings</span>
            {!hasHeadingOverride && (
              <span className="text-[9px] text-[var(--pt-text-faint)] italic">
                inherits body
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex flex-col items-center gap-0.5">
              <ColorPopover
                value={headingLightColor}
                onChange={(hex) =>
                  setComponentOverride(HEADING_LIGHT_SELECTOR, 'color', hex)
                }
                label="Headings (light)"
                defaultValue={bodyLightColor}
                swatchSize="sm"
              />
              <span className="text-[9px] text-[var(--pt-text-muted)]">light</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <ColorPopover
                value={headingDarkColor}
                onChange={(hex) =>
                  setComponentOverride(HEADING_DARK_SELECTOR, 'color', hex)
                }
                label="Headings (dark)"
                defaultValue={bodyDarkColor}
                swatchSize="sm"
              />
              <span className="text-[9px] text-[var(--pt-text-muted)]">dark</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[var(--pt-text-muted)] italic">
          Elevation colors (borders, backgrounds) auto-invert in dark mode.
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-[var(--pt-border)]" />

      {/* ── Group 3: Text Size ── */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] font-medium">
          Text Size
        </span>

        <div className="flex items-center justify-between">
          <label className="text-[11px] text-[var(--pt-text-label)]">Body Font Size</label>
          <ScrubberInput
            value={bodyFontSize}
            onChange={(n) => setVariable('--base-body-size', String(n), 'light')}
            min={10}
            max={20}
            step={1}
            unit="px"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[11px] text-[var(--pt-text-label)]">Base Spacing Unit</label>
          <ScrubberInput
            value={basePx}
            onChange={(n) => setVariable('--base-px', String(n), 'light')}
            min={14}
            max={32}
            step={1}
            unit="px"
          />
        </div>
      </div>
    </div>
  )
}
