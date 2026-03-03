'use client'

import React, { useState } from 'react'
import scaleImpactData from '@/payload-theme/scale-impact-map.json'
import type { ImpactEntry } from '@/payload-theme/scale-impact'

/* ─────────────────────────────────────────────
 * Scale Impact Palette View
 *
 * Visualises the full Payload color base scale (0-1000)
 * with per-step impact data showing which components,
 * CSS properties, and selectors are affected.
 *
 * ALL styling uses Payload CSS variables only.
 * No Tailwind, no shadcn, no external CSS.
 * ───────────────────────────────────────────── */

// ── shared style tokens (all reference Payload vars) ──
const s = {
  bg: 'var(--theme-bg)',
  text: 'var(--theme-elevation-1000)',
  muted: 'var(--theme-elevation-500)',
  subtle: 'var(--theme-elevation-400)',
  border: 'var(--theme-elevation-150)',
  surface: 'var(--theme-elevation-0)',
  surfaceRaised: 'var(--theme-elevation-50)',
  surfaceOverlay: 'var(--theme-elevation-100)',
  radius: 'var(--style-radius-m)',
  radiusL: 'var(--style-radius-l)',
  radiusS: 'var(--style-radius-s)',
  font: 'var(--font-body)',
  mono: 'var(--font-mono, monospace)',
  success500: 'var(--color-success-500)',
  warning500: 'var(--color-warning-500)',
  error500: 'var(--color-error-500)',
  success100: 'var(--color-success-100)',
  warning100: 'var(--color-warning-100)',
  error100: 'var(--color-error-100)',
} as const

// ── category badge color map ──
const categoryColors: Record<string, { bg: string; text: string }> = {
  elements: { bg: 'var(--color-base-150)', text: 'var(--color-base-800)' },
  fields: { bg: s.success100, text: s.success500 },
  views: { bg: s.warning100, text: s.warning500 },
  global: { bg: s.error100, text: s.error500 },
  icons: { bg: 'var(--color-base-100)', text: 'var(--color-base-600)' },
}

// ── data ──
const impactMap = scaleImpactData as {
  meta: { generatedAt: string; schemaSource: string }
  steps: Record<string, ImpactEntry[]>
}

const ALL_STEPS = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000]
const stepsWithData = ALL_STEPS.filter((step) => {
  const entries = impactMap.steps[String(step)]
  return entries && entries.length > 0
})

// ── helpers ──
function getStepEntries(step: number): ImpactEntry[] {
  return impactMap.steps[String(step)] ?? []
}

function getTotalUsages(entries: ImpactEntry[]): number {
  return entries.reduce((sum, e) => sum + e.count, 0)
}

function getUniqueProperties(entries: ImpactEntry[]): string[] {
  const set = new Set<string>()
  for (const e of entries) {
    for (const p of e.properties) set.add(p)
  }
  return Array.from(set)
}

/* ═══════════════════════════════════════════
 *  MAIN COMPONENT
 * ═══════════════════════════════════════════ */

export default function ScaleImpactPaletteView() {
  return (
    <div style={{
      padding: '24px',
      background: s.bg,
      minHeight: '100vh',
      fontFamily: s.font,
      color: s.text,
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: '0 0 8px',
            color: s.text,
          }}>
            Color Scale Impact Map
          </h1>
          <p style={{
            fontSize: '14px',
            color: s.muted,
            margin: 0,
            lineHeight: 1.6,
          }}>
            Each step in the base color scale (<code style={{ fontFamily: s.mono, fontSize: '13px' }}>--color-base-0</code> through <code style={{ fontFamily: s.mono, fontSize: '13px' }}>--color-base-1000</code>) affects
            specific components, properties, and selectors. Click a swatch to jump to its detail card.
          </p>
        </div>

        {/* Horizontal overview strip */}
        <div style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          marginBottom: '32px',
          padding: '16px',
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: s.radiusL,
        }}>
          {ALL_STEPS.map((step) => {
            const entries = getStepEntries(step)
            const hasData = entries.length > 0
            return (
              <a
                key={step}
                href={hasData ? `#step-${step}` : undefined}
                title={hasData ? `base-${step} -- ${entries.length} component${entries.length !== 1 ? 's' : ''}` : `base-${step} -- no impact data`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  cursor: hasData ? 'pointer' : 'default',
                  opacity: hasData ? 1 : 0.4,
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: s.radiusS,
                  background: `var(--color-base-${step})`,
                  border: `1px solid ${s.border}`,
                  transition: 'transform 0.15s ease',
                }} />
                <span style={{
                  fontSize: '9px',
                  fontFamily: s.mono,
                  color: hasData ? s.text : s.subtle,
                }}>
                  {step}
                </span>
              </a>
            )
          })}
        </div>

        {/* Step cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stepsWithData.map((step) => (
            <StepCard key={step} step={step} entries={getStepEntries(step)} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
 *  STEP CARD
 * ═══════════════════════════════════════════ */

function StepCard({ step, entries }: { step: number; entries: ImpactEntry[] }) {
  const [expanded, setExpanded] = useState(false)
  const totalUsages = getTotalUsages(entries)
  const uniqueProps = getUniqueProperties(entries)
  const displayProps = uniqueProps.slice(0, 4)
  const hasMoreProps = uniqueProps.length > 4

  return (
    <div
      id={`step-${step}`}
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: s.radiusL,
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: s.font,
          color: s.text,
          textAlign: 'left',
        }}
      >
        {/* Color swatch */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: s.radius,
          background: `var(--color-base-${step})`,
          border: `1px solid ${s.border}`,
          flexShrink: 0,
        }} />

        {/* Step number */}
        <span style={{
          fontSize: '24px',
          fontWeight: 700,
          fontFamily: s.mono,
          minWidth: '56px',
          color: s.text,
        }}>
          {step}
        </span>

        {/* Var name + stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px',
            fontFamily: s.mono,
            color: s.muted,
            marginBottom: '6px',
          }}>
            --color-base-{step}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <StatBadge label="components" value={entries.length} />
            <StatBadge label="usages" value={totalUsages} />
            <StatBadge label="properties" value={uniqueProps.length} />

            {/* Property pills */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {displayProps.map((prop) => (
                <PropertyPill key={prop} name={prop} />
              ))}
              {hasMoreProps && (
                <span style={{
                  fontSize: '11px',
                  color: s.subtle,
                  padding: '2px 6px',
                }}>
                  +{uniqueProps.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand chevron */}
        <span style={{
          fontSize: '18px',
          color: s.muted,
          transition: 'transform 0.2s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink: 0,
        }}>
          &#9660;
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${s.border}`,
          padding: '12px 20px 20px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map((entry, i) => (
              <ImpactEntryRow key={`${entry.component}-${i}`} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
 *  IMPACT ENTRY ROW
 * ═══════════════════════════════════════════ */

function ImpactEntryRow({ entry }: { entry: ImpactEntry }) {
  const [showSelectors, setShowSelectors] = useState(false)
  const catColors = categoryColors[entry.category] ?? categoryColors.elements

  return (
    <div style={{
      padding: '12px 16px',
      background: s.surfaceRaised,
      borderRadius: s.radius,
    }}>
      {/* Row header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {/* Component name */}
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: s.text,
        }}>
          {entry.component}
        </span>

        {/* Category badge */}
        <span style={{
          fontSize: '11px',
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: s.radiusS,
          background: catColors.bg,
          color: catColors.text,
        }}>
          {entry.category}
        </span>

        {/* Usage count */}
        <span style={{
          fontSize: '12px',
          color: s.muted,
        }}>
          {entry.count} usage{entry.count !== 1 ? 's' : ''}
        </span>

        {/* Property pills */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {entry.properties.map((prop) => (
            <PropertyPill key={prop} name={prop} />
          ))}
        </div>

        {/* Selectors toggle */}
        {entry.selectors.length > 0 && (
          <button
            onClick={() => setShowSelectors(!showSelectors)}
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              color: s.muted,
              background: 'transparent',
              border: `1px solid ${s.border}`,
              borderRadius: s.radiusS,
              padding: '2px 8px',
              cursor: 'pointer',
              fontFamily: s.font,
            }}
          >
            {showSelectors ? 'Hide' : 'Show'} {entry.selectors.length} selector{entry.selectors.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Selectors list */}
      {showSelectors && entry.selectors.length > 0 && (
        <div style={{
          marginTop: '10px',
          padding: '10px 12px',
          background: s.surfaceOverlay,
          borderRadius: s.radiusS,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {entry.selectors.map((sel, i) => (
            <code key={i} style={{
              fontSize: '11px',
              fontFamily: s.mono,
              color: s.muted,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: 1.5,
            }}>
              {sel}
            </code>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
 *  SMALL SHARED COMPONENTS
 * ═══════════════════════════════════════════ */

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <span style={{
      fontSize: '11px',
      color: s.muted,
    }}>
      <span style={{ fontWeight: 600, color: s.text, fontFamily: s.mono }}>{value}</span>
      {' '}{label}
    </span>
  )
}

function PropertyPill({ name }: { name: string }) {
  return (
    <span style={{
      fontSize: '11px',
      fontFamily: s.mono,
      padding: '2px 8px',
      borderRadius: s.radiusS,
      background: s.surfaceOverlay,
      color: s.muted,
    }}>
      {name}
    </span>
  )
}
