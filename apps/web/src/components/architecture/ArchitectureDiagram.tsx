'use client'

import {
  siNextdotjs,
  siReact,
  siTailwindcss,
  siTypescript,
  siSqlite,
  siSass,
  siRadixui,
  siGooglefonts,
} from 'simple-icons'
import './architecture.css'

/* ─────────────────────────────────────
   Simple Icons helper
   ───────────────────────────────────── */

type SIcon = { title: string; path: string | string[]; hex: string }

/** Official Payload CMS icon from @payloadcms/ui */
const siPayloadcms: SIcon = {
  title: 'Payload CMS',
  path: [
    'M11.8673 21.2336L4.40922 16.9845C4.31871 16.9309 4.25837 16.8355 4.25837 16.7282V10.1609C4.25837 10.0477 4.38508 9.97616 4.48162 10.0298L13.1404 14.9642C13.2611 15.0358 13.412 14.9464 13.412 14.8093V11.6091C13.412 11.4839 13.3456 11.3647 13.2309 11.2992L2.81624 5.36353C2.72573 5.30989 2.60505 5.30989 2.51454 5.36353L1.15085 6.14422C1.06034 6.19786 1 6.29321 1 6.40048V18.5995C1 18.7068 1.06034 18.8021 1.15085 18.8558L11.8491 24.9583C11.9397 25.0119 12.0603 25.0119 12.1509 24.9583L21.1355 19.8331C21.2562 19.7616 21.2562 19.5948 21.1355 19.5232L18.3357 17.9261C18.2211 17.8605 18.0883 17.8605 17.9737 17.9261L12.175 21.2336C12.0845 21.2872 11.9638 21.2872 11.8733 21.2336H11.8673Z',
    'M22.8491 6.13827L12.1508 0.0417218C12.0603 -0.0119135 11.9397 -0.0119135 11.8491 0.0417218L6.19528 3.2658C6.0746 3.33731 6.0746 3.50418 6.19528 3.57569L8.97092 5.16091C9.08557 5.22647 9.21832 5.22647 9.33296 5.16091L11.8672 3.71872C11.9578 3.66508 12.0784 3.66508 12.1689 3.71872L19.627 7.96782C19.7175 8.02146 19.7778 8.11681 19.7778 8.22408V14.8212C19.7778 14.9464 19.8442 15.0656 19.9589 15.1311L22.7345 16.7104C22.8552 16.7819 23.006 16.6925 23.006 16.5554V6.40048C23.006 6.29321 22.9457 6.19786 22.8552 6.14423L22.8491 6.13827Z',
  ],
  hex: '000000',
}

function BrandIcon({
  icon,
  size = 16,
  color,
}: {
  icon: SIcon
  size?: number
  color?: string
}) {
  const paths = Array.isArray(icon.path) ? icon.path : [icon.path]
  const viewBox = Array.isArray(icon.path) ? '0 0 25 25' : '0 0 24 24'
  return (
    <svg
      role="img"
      viewBox={viewBox}
      width={size}
      height={size}
      fill={color ?? `#${icon.hex}`}
      aria-label={icon.title}
    >
      <title>{icon.title}</title>
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

/* ─────────────────────────────────────
   Sub-components
   ───────────────────────────────────── */

function LayerLabel({
  text,
  color,
  delay = 0,
}: {
  text: string
  color: string
  delay?: number
}) {
  return (
    <div
      className="arch-layer-label"
      style={{ '--label-color': color, '--delay': `${delay}ms` } as React.CSSProperties}
    >
      <div className="arch-layer-label__dot" />
      <span>{text}</span>
    </div>
  )
}

function ArchNode({
  title,
  description,
  accentColor,
  wide = false,
  delay = 0,
}: {
  title: string
  description: string
  accentColor: string
  wide?: boolean
  delay?: number
}) {
  return (
    <div
      className={`arch-node${wide ? ' arch-node--wide' : ''}`}
      style={
        {
          '--node-accent': accentColor,
          '--delay': `${delay}ms`,
        } as React.CSSProperties
      }
    >
      <h4 className="arch-node__title">{title}</h4>
      <p className="arch-node__desc">{description}</p>
    </div>
  )
}

function FlowLine({
  label,
  color,
  delay = 0,
}: {
  label: string
  color: string
  delay?: number
}) {
  return (
    <div
      className="arch-connector"
      style={{ '--delay': `${delay}ms` } as React.CSSProperties}
    >
      <div
        className="arch-connector__line"
        style={{ '--flow-color': color } as React.CSSProperties}
      />
      <span className="arch-connector__label">{label}</span>
      <div
        className="arch-connector__line"
        style={{ '--flow-color': color } as React.CSSProperties}
      />
    </div>
  )
}

function TechBadge({
  icon,
  label,
  color,
  delay = 0,
}: {
  icon: SIcon
  label: string
  color?: string
  delay?: number
}) {
  const c = color ?? `#${icon.hex}`
  return (
    <div
      className="arch-tech-badge"
      style={
        { '--badge-color': c, '--delay': `${delay}ms` } as React.CSSProperties
      }
    >
      <BrandIcon icon={icon} size={15} color={c} />
      <span>{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────
   Data
   ───────────────────────────────────── */

const techStack: { icon: SIcon; label: string; color?: string }[] = [
  { icon: siNextdotjs, label: 'Next.js 15', color: 'var(--arch-icon-invert)' },
  { icon: siReact, label: 'React 19' },
  { icon: siTypescript, label: 'TypeScript' },
  {
    icon: siPayloadcms,
    label: 'Payload CMS',
    color: 'var(--arch-icon-invert)',
  },
  { icon: siTailwindcss, label: 'Tailwind CSS' },
  { icon: siSqlite, label: 'SQLite', color: '#4d8ba0' },
  { icon: siSass, label: 'SCSS' },
  { icon: siRadixui, label: 'Radix UI', color: 'var(--arch-icon-invert)' },
  { icon: siGooglefonts, label: 'Google Fonts' },
]

/* ─────────────────────────────────────
   Main component
   ───────────────────────────────────── */

export function ArchitectureDiagram() {
  return (
    <section className="arch-diagram">
      {/* Blueprint dot grid */}
      <div className="arch-diagram__grid" />

      {/* Header */}
      <div className="arch-header">
        <span className="arch-header__eyebrow">Under the Hood</span>
        <h2 className="arch-header__title">
          How{' '}
          <span className="text-gradient">PayloadTwist</span>{' '}
          works
        </h2>
        <p className="arch-header__subtitle">
          A visual editor that injects CSS into a live Payload admin iframe
          &mdash; zero rebuilds, instant feedback.
        </p>
      </div>

      {/* ═══ Flow Diagram ═══ */}
      <div className="arch-flow">
        {/* LAYER 1 — Editor Interface */}
        <LayerLabel text="Editor Interface" color="#a855f7" delay={100} />
        <div className="arch-row arch-row--3">
          <ArchNode
            title="Color Scale"
            description="3-anchor HSL interpolation generates all 16 base color steps"
            accentColor="#a855f7"
            delay={150}
          />
          <ArchNode
            title="Typography"
            description="Live Google Fonts preview with body &amp; heading pickers"
            accentColor="#c084fc"
            delay={220}
          />
          <ArchNode
            title="Layout &amp; Components"
            description="Spacing, radii, z-index, and per-component BEM overrides"
            accentColor="#e879f9"
            delay={290}
          />
        </div>

        {/* Connector: Editor → Store */}
        <FlowLine
          label="setVariable( name, value, mode )"
          color="#a855f7"
          delay={380}
        />

        {/* LAYER 2 — State Management */}
        <LayerLabel text="State Management" color="#06b6d4" delay={440} />
        <div className="arch-row arch-row--1">
          <ArchNode
            title="Zustand Store"
            description="PayloadThemeConfig with light/dark maps, component overrides, undo/redo history (30 entries), and localStorage persistence"
            accentColor="#06b6d4"
            wide
            delay={500}
          />
        </div>

        {/* Connector: Store → Engine */}
        <FlowLine
          label="subscribe( config )"
          color="#06b6d4"
          delay={570}
        />

        {/* LAYER 3 — CSS Engine */}
        <LayerLabel text="CSS Transform" color="#ec4899" delay={630} />
        <div className="arch-row arch-row--2">
          <ArchNode
            title="CSS Generator"
            description="Diffs config against Payload defaults, builds minimal :root and [data-theme=&quot;dark&quot;] blocks"
            accentColor="#ec4899"
            delay={690}
          />
          <ArchNode
            title="Scale Generator"
            description="Two-segment HSL interpolation from 3 anchor colors into 16 smooth steps"
            accentColor="#f472b6"
            delay={750}
          />
        </div>

        {/* Fork to outputs */}
        <div
          className="arch-fork"
          style={{ '--delay': '810ms' } as React.CSSProperties}
        >
          <svg viewBox="0 0 240 48" fill="none" className="arch-fork__svg">
            <path
              d="M 120 0 L 120 16 M 120 16 L 48 16 L 48 48 M 120 16 L 192 16 L 192 48"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 5"
              className="arch-fork__path"
            />
            <circle r="2" fill="#22c55e" opacity="0.7">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path="M 120 0 L 120 16 L 48 16 L 48 48"
              />
            </circle>
            <circle r="2" fill="#4ade80" opacity="0.7">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path="M 120 0 L 120 16 L 192 16 L 192 48"
                begin="0.4s"
              />
            </circle>
          </svg>
        </div>

        {/* LAYER 4 — Output */}
        <LayerLabel text="Output" color="#22c55e" delay={870} />
        <div className="arch-row arch-row--2">
          <ArchNode
            title="Live Iframe Injection"
            description="Injects &lt;style&gt; tags into the Payload admin iframe — same-origin, no CORS, instant preview"
            accentColor="#22c55e"
            delay={930}
          />
          <ArchNode
            title="CSS Export"
            description="Generates clean custom.scss with only changed variables — paste into any Payload project"
            accentColor="#4ade80"
            delay={990}
          />
        </div>
      </div>

      {/* ═══ Payload CSS Layers ═══ */}
      <div className="arch-layers">
        <div className="arch-layers__header">
          <span className="arch-layers__eyebrow">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            Payload&apos;s 3-Layer CSS System
          </span>
          <p className="arch-layers__desc">
            PayloadTwist understands which variables to override and which to
            leave alone
          </p>
        </div>

        <div className="arch-layers__grid">
          <div
            className="arch-layer-card arch-layer-card--1"
            style={{ '--delay': '1050ms' } as React.CSSProperties}
          >
            <div className="arch-layer-card__num">1</div>
            <div>
              <h4>Raw Palette</h4>
              <p>--color-base-0 → 1000</p>
              <span className="arch-layer-card__tag arch-layer-card__tag--editable">
                Editable
              </span>
            </div>
          </div>

          <div
            className="arch-layer-card arch-layer-card--2"
            style={{ '--delay': '1110ms' } as React.CSSProperties}
          >
            <div className="arch-layer-card__num">2</div>
            <div>
              <h4>Elevation Aliases</h4>
              <p>--theme-elevation-*</p>
              <span className="arch-layer-card__tag arch-layer-card__tag--auto">
                Auto-inverted
              </span>
            </div>
          </div>

          <div
            className="arch-layer-card arch-layer-card--3"
            style={{ '--delay': '1170ms' } as React.CSSProperties}
          >
            <div className="arch-layer-card__num">3</div>
            <div>
              <h4>Semantic Theme</h4>
              <p>--theme-bg, --theme-text</p>
              <span className="arch-layer-card__tag arch-layer-card__tag--explicit">
                Light + Dark
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Tech Stack ═══ */}
      <div className="arch-tech">
        <span className="arch-tech__label">Built With</span>
        <div className="arch-tech__grid">
          {techStack.map((t, i) => (
            <TechBadge
              key={t.label}
              icon={t.icon}
              label={t.label}
              color={t.color}
              delay={1230 + i * 50}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
