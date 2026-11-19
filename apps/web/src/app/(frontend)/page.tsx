import type { Metadata } from 'next'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ArchitectureDiagram } from '@/components/architecture/ArchitectureDiagram'
import { UserMenu } from '@/components/auth/UserMenu'
import { LogoMark, Wordmark } from '@/components/Logo'
import { buildThemeCss } from '@/payload-theme/css'
import { defaultTheme, setFont, setRoundness, setToken } from '@/payload-theme/theme'
import './landing.css'

export const metadata: Metadata = {
  title: 'payloadtwist — Visual Theme Editor for Payload CMS',
  description:
    'A visual theme editor for the Payload v4 admin. Pick brand colors, surfaces, radius, density and fonts on a live admin, then export clean custom.css or an installable theme.',
  openGraph: {
    title: 'payloadtwist — Visual Theme Editor for Payload CMS',
    description:
      'Design your Payload v4 admin visually. Theme brand colors, surfaces, radius, density and fonts on a live admin, then export clean CSS.',
  },
}

/* ─────────────────────────────────────────────────
   Animated Logo with orbit ring + pulsing core
   ───────────────────────────────────────────────── */

function AnimatedLogo({ size = 180 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 0 60px rgba(168, 85, 247, 0.2))' }}
    >
      <defs>
        <linearGradient id="hero-strand1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="hero-strand2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="hero-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="33%" stopColor="#ec4899" />
          <stop offset="66%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="hero-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
        </linearGradient>
        <filter id="hero-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hero-soft-glow">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Orbiting ring */}
      <g className="logo-orbit">
        <circle cx="100" cy="100" r="88" stroke="url(#hero-ring)" strokeWidth="1" fill="none" opacity="0.4" />
        <circle cx="100" cy="12" r="3" fill="#a855f7" opacity="0.8" />
        <circle cx="188" cy="100" r="2.5" fill="#ec4899" opacity="0.6" />
        <circle cx="100" cy="188" r="2" fill="#06b6d4" opacity="0.7" />
      </g>

      {/* Back strand */}
      <path d="M 56 56 C 56 90, 90 95, 100 100 C 110 105, 144 110, 144 144" stroke="url(#hero-strand2)" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.35" />
      {/* Front strand */}
      <path d="M 144 56 C 144 90, 110 95, 100 100 C 90 105, 56 110, 56 144" stroke="url(#hero-strand1)" strokeWidth="14" strokeLinecap="round" fill="none" filter="url(#hero-glow)" />
      {/* Crossover */}
      <path d="M 100 100 C 110 105, 144 110, 144 144" stroke="url(#hero-strand2)" strokeWidth="14" strokeLinecap="round" fill="none" filter="url(#hero-glow)" />

      {/* Connecting lines */}
      <line x1="56" y1="56" x2="93" y2="93" stroke="#06b6d4" strokeWidth="1" opacity="0.2" />
      <line x1="144" y1="56" x2="107" y2="93" stroke="#ec4899" strokeWidth="1" opacity="0.2" />
      <line x1="56" y1="144" x2="93" y2="107" stroke="#a855f7" strokeWidth="1" opacity="0.2" />
      <line x1="144" y1="144" x2="107" y2="107" stroke="#22c55e" strokeWidth="1" opacity="0.2" />

      {/* Center nexus */}
      <circle cx="100" cy="100" r="10" style={{ fill: 'var(--lp-logo-center)' }} />
      <circle cx="100" cy="100" r="7" fill="url(#hero-core)" filter="url(#hero-soft-glow)" className="logo-core-pulse" />
      <circle cx="100" cy="100" r="3" fill="white" opacity="0.9" />

      {/* Terminal nodes */}
      <circle cx="144" cy="56" r="7" fill="#ec4899" filter="url(#hero-glow)" />
      <circle cx="144" cy="56" r="3" fill="white" opacity="0.8" />
      <circle cx="56" cy="56" r="7" fill="#06b6d4" filter="url(#hero-glow)" />
      <circle cx="56" cy="56" r="3" fill="white" opacity="0.8" />
      <circle cx="56" cy="144" r="7" fill="#a855f7" filter="url(#hero-glow)" />
      <circle cx="56" cy="144" r="3" fill="white" opacity="0.8" />
      <circle cx="144" cy="144" r="7" fill="#22c55e" filter="url(#hero-glow)" />
      <circle cx="144" cy="144" r="3" fill="white" opacity="0.8" />
    </svg>
  )
}


/* ─────────────────────────────────────────────────
   Data
   ───────────────────────────────────────────────── */

// Real output of the exporter for a small sample theme — the landing never drifts from the product
const SAMPLE_CSS = buildThemeCss(
  setToken(
    setToken(setRoundness(setFont(defaultTheme(), 'body', 'DM Sans'), 8), '--color-bg', '#faf7ed', 'light'),
    '--color-bg',
    '#171a16',
    'dark',
  ),
  { header: false },
).trim()

function cssLineClass(line: string): string {
  const t = line.trim()
  if (t.startsWith('/*') || t.startsWith('*')) return 'text-[var(--lp-code-comment)]'
  if (t.startsWith('--')) return 'text-[var(--lp-code-prop)]'
  if (t.startsWith('@')) return 'text-[var(--lp-code-value)]'
  if (t === '}' || t === '') return 'text-[var(--lp-code-punct)]'
  return 'text-[var(--lp-code-selector)]'
}

const features = [
  {
    title: 'A Real Payload v4 Admin',
    description:
      'The preview is a real Payload v4 admin with demo content — dashboard, lists, edit views, drawers. Or connect your own. Every tweak applies instantly.',
    gradient: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-500/10',
  },
  {
    title: 'Seeds, Not 484 Pickers',
    description:
      'Six seed colors regenerate Payload\'s ramp families along its own lightness curve. Brand, accent, neutral and status — one change rethemes everything.',
    gradient: 'from-cyan-500/10 to-green-500/10',
    border: 'border-cyan-500/10',
  },
  {
    title: 'Light, Dark & Contrast',
    description:
      'Every semantic role has light and dark values, with WCAG contrast checks that blend Payload\'s translucent roles exactly like the browser. Preview enhanced contrast too.',
    gradient: 'from-pink-500/10 to-orange-500/10',
    border: 'border-pink-500/10',
  },
  {
    title: 'Google Fonts Picker',
    description:
      'Browse and preview Google Fonts with a live dropdown. Pick a body font, a heading font — see it applied instantly.',
    gradient: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-500/10',
  },
  {
    title: 'Shape & Density',
    description:
      'One roundness value drives every radius. Density and type scale resize fields, buttons and text together — the way Payload\'s tokens were designed.',
    gradient: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-500/10',
  },
  {
    title: 'custom.css or a Theme Package',
    description:
      'Export a minimal custom.css — no !important, Payload v4 is layered — or a user-selectable theme for payload-admin-ui-themes.',
    gradient: 'from-violet-500/10 to-indigo-500/10',
    border: 'border-violet-500/10',
  },
]

const workflow = [
  {
    num: '1',
    title: 'Open the editor',
    description: 'Visit /editor. A real Payload v4 admin loads next to the controls — or connect your own.',
  },
  {
    num: '2',
    title: 'Tweak visually',
    description: 'Start from a preset, set seed colors, tune surfaces, roundness, density and fonts. Check contrast in light and dark.',
  },
  {
    num: '3',
    title: 'Export your theme',
    description: 'Export custom.css for your Payload project, or a theme package your editors can pick from their settings.',
  },
]

/* ─────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div id="main-content" className="landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'payloadtwist',
            url: 'https://payloadtwist.com',
            description: 'A visual CSS theme editor for the Payload CMS admin panel.',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />

      {/* ═══ Nav ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--lp-nav-border)] bg-[var(--lp-nav-bg)] backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <Wordmark className="text-lg" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--lp-text-muted)]">
            <a href="#how-it-works" className="hover:text-[var(--lp-text)] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[var(--lp-text)] transition-colors">Features</a>
            <a href="#preview" className="hover:text-[var(--lp-text)] transition-colors">Preview</a>
            <Link href="/presets" className="hover:text-[var(--lp-text)] transition-colors">Themes</Link>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
            <ThemeToggle />
            <Link
              href="/editor"
              className="rounded-full bg-[var(--lp-ghost-bg)] border border-[var(--lp-border-medium)] px-5 py-2 text-sm font-medium text-[var(--lp-text-secondary)] hover:bg-[var(--lp-ghost-bg-hover)] hover:border-[var(--lp-border-hover)] transition-all"
            >
              Open Editor
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 noise">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] left-[20%] w-[600px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[120px]" />
          <div className="absolute top-[25%] right-[15%] w-[500px] h-[350px] rounded-full bg-pink-500/[0.03] blur-[120px]" />
          <div className="absolute bottom-[20%] left-[40%] w-[400px] h-[300px] rounded-full bg-cyan-500/[0.025] blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl gap-8">
          {/* Animated logo */}
          <div className="anim-fade-up">
            <div className="anim-float">
              <AnimatedLogo size={160} />
            </div>
          </div>

          <div className="anim-fade-up anim-delay-1 inline-flex items-center gap-2 rounded-full border border-[var(--lp-badge-border)] bg-[var(--lp-badge-bg)] px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--lp-badge-text)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            Theme editor for Payload v4
          </div>

          {/* Wordmark */}
          <div className="anim-fade-up anim-delay-1">
            <span className="font-display font-extrabold text-[44px] tracking-[-2px]">
              payload<span className="text-gradient-shimmer">twist</span>
            </span>
          </div>

          <h1 className="anim-fade-up anim-delay-2 font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[-0.03em] leading-[0.9]">
            Design your Payload
            <br />
            <span className="text-gradient-shimmer">admin panel</span> visually
          </h1>

          <p className="anim-fade-up anim-delay-3 max-w-xl text-lg text-[var(--lp-text-faint)] leading-relaxed font-light">
            Built for Payload v4&apos;s token system. Theme brand, surfaces, radius, density and type on a live admin,
            then export clean CSS. No plugin required.
          </p>

          <div className="anim-fade-up anim-delay-4 flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/editor"
              className="group relative inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-90 transition-opacity group-hover:opacity-100" />
              <span className="relative z-10">Open the Editor</span>
              <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2.5 rounded-full border border-[var(--lp-border-medium)] bg-[var(--lp-ghost-bg)] px-7 py-3.5 text-sm font-medium text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] hover:border-[var(--lp-border-hover)] hover:bg-[var(--lp-ghost-bg-hover)] transition-all"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--lp-text-ghost)] anim-fade-up anim-delay-6">
          <span className="text-[10px] uppercase tracking-[3px] font-light">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[var(--lp-text-ghost)] to-transparent" />
        </div>
      </section>

      {/* ═══ How it works ═══ */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[4px] text-[var(--lp-section-label)] font-medium">How it works</span>
            <h2 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl tracking-[-0.02em] text-[var(--lp-heading)]">
              Three steps to a <span className="text-gradient">custom admin</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflow.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-5">
                <div className="step-num bg-gradient-to-br from-purple-600/80 to-pink-600/80 text-white">
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-xl text-[var(--lp-heading)]">{step.title}</h3>
                <p className="text-sm text-[var(--lp-text-faint)] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Editor Preview Mockup ═══ */}
      <section id="preview" className="relative py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[4px] text-[var(--lp-section-label-alt)] font-medium">The Editor</span>
            <h2 className="mt-4 font-display font-extrabold text-4xl tracking-[-0.02em] text-[var(--lp-heading)]">
              Controls on the left. <span className="text-gradient">Live preview</span> on the right.
            </h2>
          </div>

          <div className="relative rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.04)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--lp-border-subtle)] bg-[var(--lp-surface-2)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-ghost-bg)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-ghost-bg)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-ghost-bg)]" />
              </div>
              <div className="ml-4 flex-1 h-6 rounded-md bg-[var(--lp-ghost-bg)] flex items-center justify-center">
                <span className="text-[10px] text-[var(--lp-text-ghost)] font-mono">localhost:3000/editor</span>
              </div>
            </div>

            <div className="flex min-h-[480px]">
              {/* ── Editor panel (left) — dark theme ── */}
              <div className="w-[300px] shrink-0 border-r border-white/[0.06] bg-[#141416] flex flex-col">
                {/* Logo bar */}
                <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* DNA strand logo mark */}
                    <svg width="18" height="18" viewBox="0 0 200 200" fill="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="mock-s1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                        <linearGradient id="mock-s2" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                        <linearGradient id="mock-core" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="33%" stopColor="#ec4899" />
                          <stop offset="66%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                      <path d="M 56 56 C 56 90, 90 95, 100 100 C 110 105, 144 110, 144 144" stroke="url(#mock-s2)" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.35" />
                      <path d="M 144 56 C 144 90, 110 95, 100 100 C 90 105, 56 110, 56 144" stroke="url(#mock-s1)" strokeWidth="16" strokeLinecap="round" fill="none" />
                      <path d="M 100 100 C 110 105, 144 110, 144 144" stroke="url(#mock-s2)" strokeWidth="16" strokeLinecap="round" fill="none" />
                      <circle cx="100" cy="100" r="10" fill="#141416" />
                      <circle cx="100" cy="100" r="7" fill="url(#mock-core)" />
                      <circle cx="100" cy="100" r="3" fill="white" />
                      <circle cx="144" cy="56" r="6" fill="#ec4899" />
                      <circle cx="56" cy="56" r="6" fill="#06b6d4" />
                      <circle cx="56" cy="144" r="6" fill="#a855f7" />
                      <circle cx="144" cy="144" r="6" fill="#22c55e" />
                    </svg>
                    <span className="text-[12px] font-bold text-[#e4e4e7] tracking-tight">
                      payload<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">twist</span>
                    </span>
                    <span className="text-[8px] bg-white/[0.06] text-[#71717a] px-1.5 py-0.5 rounded font-mono">v1.0</span>
                  </div>
                  {/* Sun/Moon editor theme toggle */}
                  <div className="flex items-center bg-white/[0.04] rounded-full p-0.5">
                    <div className="p-1 rounded-full text-[#71717a]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" /></svg>
                    </div>
                    <div className="p-1 rounded-full bg-purple-600 text-white">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center gap-1.5">
                  {/* Gradient export pill */}
                  <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white rounded-full px-2.5 py-1 text-[10px] font-medium">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    Export
                    <span className="text-[8px] bg-white/20 px-1 rounded-full">12</span>
                  </div>
                  {/* Reset button */}
                  <div className="w-5 h-5 rounded flex items-center justify-center text-[#71717a] hover:text-red-400">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                  </div>
                  <div className="w-px h-3.5 bg-white/[0.06]" />
                  <div className="flex gap-0.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[#71717a]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="14 2 8 8 14 14" /></svg>
                    </div>
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[#71717a]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="10 2 16 8 10 14" /></svg>
                    </div>
                  </div>
                </div>

                {/* Tab bar — 6 tabs */}
                <div className="flex gap-0.5 px-2 py-1.5 border-b border-white/[0.06] overflow-hidden">
                  {['General', 'UI Elements', 'Fields', 'Views', 'Dashboard', 'Overlays'].map((tab, i) => (
                    <div
                      key={tab}
                      className={`text-[8px] px-1.5 py-1 rounded font-medium whitespace-nowrap ${
                        i === 0
                          ? 'bg-purple-600 text-white'
                          : 'text-[#71717a]'
                      }`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>

                {/* Scrollable controls mockup */}
                <div className="flex-1 p-3 flex flex-col gap-4 overflow-hidden">
                  {/* Color scale section */}
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#71717a] font-medium">Brand ramp</span>
                    <div className="mt-2 h-4 rounded-md overflow-hidden flex">
                      {['#e5f4ff', '#bde3ff', '#80caff', '#0d99ff', '#007be5', '#0768cf', '#034ac1', '#093077', '#0d193f'].map((c, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  {/* Theme colors */}
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#71717a] font-medium">Surfaces</span>
                    <div className="mt-2 flex flex-col gap-2">
                      {[
                        { label: '--color-bg', color: '#ffffff' },
                        { label: '--color-text', color: '#1c1917' },
                        { label: '--color-bg-brand', color: '#0d99ff' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-[#71717a]">{item.label}</span>
                          <div className="w-5 h-5 rounded border border-white/[0.08]" style={{ backgroundColor: item.color }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#71717a] font-medium">Typography</span>
                    <div className="mt-2 rounded border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-[#e4e4e7] flex items-center justify-between">
                      <span>DM Sans</span>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                  </div>

                  {/* Layout */}
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#71717a] font-medium">Roundness</span>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06]">
                        <div className="w-2/5 h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      </div>
                      <span className="text-[9px] font-mono text-[#71717a]">8px</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Resize handle ── */}
              <div className="w-[5px] shrink-0 bg-white/[0.04] flex items-center justify-center">
                <svg width="8" height="12" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" opacity="0.5" aria-hidden="true"><line x1="9" y1="4" x2="9" y2="20" /><line x1="15" y1="4" x2="15" y2="20" /></svg>
              </div>

              {/* ── Iframe preview (right) ── */}
              <div className="flex-1 flex flex-col">
                {/* Preview tabs */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#141416] border-b border-white/[0.06]">
                  <div className="flex gap-1">
                    {['Admin', 'Showcase', 'Custom'].map((tab, i) => (
                      <div
                        key={tab}
                        className={`text-[9px] px-2 py-0.5 rounded font-medium ${
                          i === 0
                            ? 'bg-white/[0.08] text-[#e4e4e7]'
                            : 'text-[#71717a]'
                        }`}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#141416] border-b border-white/[0.06]">
                  <span className="text-[10px] font-mono text-[#71717a]">/admin</span>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded flex items-center justify-center bg-purple-600">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" /></svg>
                    </div>
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[#71717a]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                    </div>
                    {/* Reload button */}
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[#71717a]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                    </div>
                  </div>
                </div>

                {/* Payload admin mockup */}
                <div className="flex-1 bg-white p-6">
                  <div className="flex gap-5 h-full">
                    {/* Payload nav */}
                    <div className="w-[140px] shrink-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded bg-[#0d1117]" />
                        <span className="text-[11px] font-semibold text-[#1c1917]">My Project</span>
                      </div>
                      {['Dashboard', 'Posts', 'Media', 'Users', 'Settings'].map((item, i) => (
                        <div
                          key={item}
                          className={`rounded px-2.5 py-1.5 text-[10px] ${
                            i === 1
                              ? 'bg-[#f0ede8] text-[#1c1917] font-medium'
                              : 'text-[#78726c]'
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    {/* Payload content area */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-[#1c1917]">Posts</span>
                        <div className="rounded bg-[#0d1117] px-3 py-1.5 text-[10px] font-medium text-white">
                          Create New
                        </div>
                      </div>
                      {['Getting Started with Payload', 'Customizing Your Dashboard', 'Working with Collections'].map(
                        (title, i) => (
                          <div
                            key={title}
                            className="flex items-center justify-between rounded border border-[#e5e2dc] px-4 py-3 mb-2"
                          >
                            <span className="text-[11px] text-[#1c1917]">{title}</span>
                            <span className="text-[9px] text-[#78726c] font-mono">
                              {['Published', 'Draft', 'Published'][i]}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[var(--lp-text-ghost)]">
            The editor runs alongside Payload in the same Next.js app — same-origin iframe, zero CORS issues
          </p>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="relative py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[4px] text-[var(--lp-section-label-alt)] font-medium">Features</span>
            <h2 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl tracking-[-0.02em] text-[var(--lp-heading)]">
              Built for Payload v4&apos;s <span className="text-gradient">design tokens</span>
            </h2>
            <p className="mt-4 max-w-lg mx-auto text-sm text-[var(--lp-text-faint)] leading-relaxed">
              Payload v4 styles every component from raw color ramps and semantic roles with explicit light and dark values. payloadtwist edits exactly those tokens, so your theme survives upgrades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-7 transition-all hover:border-[var(--lp-border-hover)] hover:shadow-[0_0_40px_rgba(168,85,247,0.04)]`}
              >
                <h3 className="font-display font-bold text-lg text-[var(--lp-heading)] mb-3">{f.title}</h3>
                <p className="text-sm text-[var(--lp-text-faint)] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Architecture ═══ */}
      <ArchitectureDiagram />

      {/* ═══ The Output ═══ */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[4px] text-[var(--lp-section-label-green)] font-medium">The Output</span>
            <h2 className="mt-4 font-display font-extrabold text-4xl tracking-[-0.02em] text-[var(--lp-heading)]">
              Clean CSS you <span className="text-gradient">own</span>
            </h2>
            <p className="mt-4 max-w-md mx-auto text-sm text-[var(--lp-text-faint)] leading-relaxed">
              Only the tokens you changed, scoped so portaled menus and dark mode stay correct. Paste it into custom.css and you&apos;re done.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--lp-border-subtle)]">
              <span className="text-[10px] uppercase tracking-[2px] text-[var(--lp-text-ghost)] font-medium">custom.css</span>
              <div className="flex-1" />
              <span className="text-[9px] text-[var(--lp-text-ghost)] font-mono">generated by payloadtwist</span>
            </div>
            <pre className="p-6 overflow-x-auto">
              <code className="text-[13px] font-mono leading-relaxed whitespace-pre">
                {SAMPLE_CSS.split('\n').map((line, i) => (
                  <span key={i} className={cssLineClass(line)}>
                    {line + '\n'}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-32 px-6 noise">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-[30%] w-[700px] h-[400px] rounded-full bg-purple-500/[0.03] blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl text-center flex flex-col items-center gap-8">
          <LogoMark size={60} />
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl tracking-[-0.02em]">
            Ready to <span className="text-gradient">twist</span>?
          </h2>
          <p className="text-[var(--lp-text-faint)] text-lg font-light max-w-md">
            Stop guessing CSS variable names. Open the editor, design your admin panel visually, and export clean overrides.
          </p>
          <Link
            href="/editor"
            className="group relative inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-semibold text-white overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-90 transition-opacity group-hover:opacity-100" />
            <span className="relative z-10">Open the Editor</span>
            <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer is rendered by (frontend)/layout.tsx */}
    </div>
  )
}
