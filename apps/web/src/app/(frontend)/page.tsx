import type { Metadata } from 'next'
import Image from 'next/image'
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
    'A visual theme editor for the Payload v4 admin. Colors, backgrounds, shape, spacing, fonts and individual components on a live admin, then export clean custom.css or an installable theme.',
  openGraph: {
    title: 'payloadtwist — Visual Theme Editor for Payload CMS',
    description:
      'Design your Payload v4 admin visually on a live admin, with every control explained, then export clean CSS or a theme package.',
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
      'The preview is a real Payload v4 admin: dashboard, lists, every field type, every rich-text node, drawers, media. Or connect your own admin. Every change shows up instantly.',
    gradient: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-500/10',
  },
  {
    title: 'Seeds, Not 484 Pickers',
    description:
      'A handful of seed colors regenerate Payload\'s color scales along its own lightness curve. Labels on brand colors switch between white and dark for contrast automatically.',
    gradient: 'from-cyan-500/10 to-green-500/10',
    border: 'border-cyan-500/10',
  },
  {
    title: 'Every Control Explained',
    description:
      'Each setting says in plain words what it changes. Hover one and the parts of the admin it affects are outlined in the preview.',
    gradient: 'from-pink-500/10 to-orange-500/10',
    border: 'border-pink-500/10',
  },
  {
    title: 'Exact Control',
    description:
      'Start from a preset, then fine-tune with a slider or a typed value: every corner size, border widths, shadows per level, and size, line height, weight and letter spacing for each text level.',
    gradient: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-500/10',
  },
  {
    title: 'Spacing, Padding & Margin',
    description:
      'Make the whole admin tighter or roomier with one scale, set the page padding and field gaps, then adjust padding and margin on buttons, cards, table cells or inputs.',
    gradient: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-500/10',
  },
  {
    title: 'Style One Element',
    description:
      'Global settings change the whole admin; Components targets a single part: a navy sidebar, uppercase table headers, pill-shaped buttons. Light and dark values for each.',
    gradient: 'from-violet-500/10 to-indigo-500/10',
    border: 'border-violet-500/10',
  },
  {
    title: 'Light, Dark & Contrast',
    description:
      'Every color has a light and a dark value, with WCAG readability checks that account for translucent colors. Preview enhanced-contrast mode and phone or tablet widths too.',
    gradient: 'from-sky-500/10 to-blue-500/10',
    border: 'border-sky-500/10',
  },
  {
    title: 'Presets: Built-in, Yours, Shared',
    description:
      'Twelve built-in themes to start from. Save your own, keep editing them, share a link, and open themes the community shared, all from the editor.',
    gradient: 'from-rose-500/10 to-pink-500/10',
    border: 'border-rose-500/10',
  },
  {
    title: 'custom.css or a Theme Package',
    description:
      'Export a minimal custom.css (no !important, since Payload v4 is layered) or a .zip theme package your editors can pick in payload-admin-ui-themes.',
    gradient: 'from-fuchsia-500/10 to-purple-500/10',
    border: 'border-fuchsia-500/10',
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
    description: 'Start from a preset, pick seed colors, then fine-tune backgrounds, corners, spacing, fonts or single components. Hover any control to see what it changes.',
  },
  {
    num: '3',
    title: 'Export your theme',
    description: 'Download custom.css for your Payload project, or a theme package your editors can pick in their settings. Save it as a preset to come back or share.',
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
            Built for Payload v4&apos;s token system. Change colors, backgrounds, corners, spacing, fonts or a single
            component on a real admin, with every control explained. Export clean CSS or a theme package.
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

          <div className="relative rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.06)]">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--lp-border-subtle)] bg-[var(--lp-surface-2)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-ghost-bg)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-ghost-bg)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--lp-ghost-bg)]" />
              </div>
              <div className="ml-4 flex-1 h-6 rounded-md bg-[var(--lp-ghost-bg)] flex items-center justify-center">
                <span className="text-[10px] text-[var(--lp-text-ghost)] font-mono">payloadtwist.com/editor</span>
              </div>
            </div>
            <Link href="/editor" aria-label="Open the editor">
              <Image
                src="/editor-screenshot.png"
                alt="The payloadtwist editor: the Components tab on the left giving the sidebar a navy background, and a real Payload v4 admin on the right showing it live"
                width={2880}
                height={1720}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="w-full h-auto"
                priority
              />
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--lp-text-faint)]">
            Shown: the Corporate preset, with the Components tab turning only the sidebar navy. The preview is a real Payload v4 admin.
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
