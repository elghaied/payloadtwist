import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/auth/UserMenu'
import { LogoMark, Wordmark } from '@/components/Logo'
import { contrastRatio, flatten } from '@/payload-theme/color'
import { buildThemeCss } from '@/payload-theme/css'
import { presetTheme, THEME_PRESETS } from '@/payload-theme/presets'
import { resolveAll } from '@/payload-theme/schema'
import { defaultTheme, setFont, setRoundness, setToken } from '@/payload-theme/theme'
import './landing.css'
import './lookbook.css'

export const metadata: Metadata = {
  title: 'payloadtwist — Visual Theme Editor for Payload CMS',
  description:
    'A visual theme editor for the Payload v4 admin. Start from a look, change colors, shape, spacing, fonts or a single component on a live admin, and export custom.css or an installable theme.',
  openGraph: {
    title: 'payloadtwist — Visual Theme Editor for Payload CMS',
    description: 'Your Payload admin, dressed properly. A visual theme editor for Payload v4.',
  },
}

// ─── Lookbook data: real exports of the built-in presets ─────────────────────

const INK = '#17141f'

interface Spread {
  id: string
  mode: 'light' | 'dark'
  shows: string
}

const SPREADS: Spread[] = [
  { id: 'midnight', mode: 'dark', shows: 'The dashboard in dark mode' },
  { id: 'light-cream', mode: 'light', shows: 'The posts list' },
  { id: 'paper', mode: 'light', shows: 'Editing a post' },
  { id: 'brutal', mode: 'light', shows: 'The dashboard' },
  { id: 'sunset', mode: 'light', shows: 'The dashboard' },
  { id: 'terminal', mode: 'dark', shows: 'The posts list in dark mode' },
  { id: 'forest', mode: 'light', shows: 'Editing a post' },
  { id: 'nord', mode: 'light', shows: 'The dashboard' },
]

const MORE = ['candy', 'mono', 'payload']

/** A spread wears its theme: sidebar (or page) color, a readable ink, and the theme's heading font. */
function dress({ id, mode }: Spread) {
  const preset = THEME_PRESETS.find((p) => p.id === id)!
  const theme = presetTheme(preset)
  const r = resolveAll(mode, theme)
  const side = theme.components.sidebar
  const sideBg = mode === 'dark' ? (side?.dark?.bg ?? side?.light?.bg) : side?.light?.bg
  const bg = sideBg ?? r['--color-bg']
  const solid = bg.match(/#[0-9a-f]{6}/i)?.[0] ?? flatten(bg, mode === 'dark' ? '#000000' : '#ffffff') ?? '#ffffff'
  const ink = contrastRatio('#ffffff', solid) >= contrastRatio(INK, solid) ? '#ffffff' : INK
  return { preset, bg, ink, font: preset.fonts?.heading ?? 'Inter' }
}

const DRESSED = SPREADS.map((s) => ({ ...s, ...dress(s) }))

const THEME_FONTS_URL = `https://fonts.googleapis.com/css2?${[...new Set(DRESSED.map((d) => d.font))]
  .map((f) => `family=${f.replace(/ /g, '+')}:wght@600`)
  .join('&')}&display=swap`

const STEPS = [
  {
    title: 'Set your colors',
    text: 'Pick a brand color and a few others. payloadtwist builds every shade Payload needs, for light and dark mode, and keeps labels readable on top.',
    image: 'ch-colors',
  },
  {
    title: 'Shape it',
    text: 'Corners, borders and shadows. Choose a style, or set exact values: each corner size, each shadow level’s offset, blur and color.',
    image: 'ch-shape',
  },
  {
    title: 'Set the type',
    text: 'Any Google Font for text, headings and code, then size, line height, weight and letter spacing for every text level.',
    image: 'ch-fonts',
  },
  {
    title: 'Style one element',
    text: 'A navy sidebar, uppercase table headers, airier table rows. Change one part of the admin without touching the rest.',
    image: 'ch-components',
  },
  {
    title: 'Take it home',
    text: 'Download a custom.css to paste into your project, or a theme package your editors can pick in their account settings.',
    image: 'ch-export',
  },
]

// Real output of the exporter for a small sample theme — the page never drifts from the product
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

const shot = (name: string) => `/lookbook/${name}.webp`

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div id="main-content" className="landing lookbook">
      <link rel="stylesheet" href={THEME_FONTS_URL} precedence="default" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'payloadtwist',
            url: 'https://payloadtwist.com',
            description: 'A visual theme editor for the Payload CMS v4 admin panel.',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-[var(--lb-line)] bg-[var(--lb-paper)]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="payloadtwist home">
            <LogoMark size={26} />
            <Wordmark className="text-base sm:text-lg" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[15px] lb-muted">
            <a href="#lookbook" className="hover:text-[var(--lb-ink)]">Lookbook</a>
            <a href="#how" className="hover:text-[var(--lb-ink)]">How it works</a>
            <Link href="/presets" className="hover:text-[var(--lb-ink)]">Shared themes</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <UserMenu />
            <ThemeToggle />
            <Link href="/editor" className="lb-button !py-2 !px-4 text-sm !hidden sm:!inline-flex">
              Open the editor
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero: before and after */}
      <header className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:pt-40 lg:pb-32 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-5">
          <h1 className="lb-display text-[clamp(3rem,6vw,5.75rem)]">
            Your Payload admin, <span className="text-gradient-shimmer">dressed properly.</span>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed lb-muted">
            payloadtwist is a visual theme editor for the Payload v4 admin. Start from a look, change anything on a
            live admin, and take home a custom.css.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/editor" className="lb-button">
              Open the editor
            </Link>
            <a href="#lookbook" className="lb-link text-[15px]">
              See the lookbook
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 relative lg:aspect-[16/12]">
          <figure className="lg:absolute lg:top-0 lg:left-0 lg:w-[80%]">
            <figcaption className="mb-3 text-sm lb-muted">Payload, as installed</figcaption>
            <Image
              src={shot('stock')}
              alt="A stock Payload v4 admin dashboard"
              width={2880}
              height={1800}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="lb-shot opacity-90"
              priority
            />
          </figure>
          <figure className="lb-after mt-10 lg:mt-0 lg:absolute lg:bottom-0 lg:right-0 lg:w-[82%]">
            <Image
              src={shot('corporate')}
              alt="The same dashboard wearing the Corporate theme: a navy sidebar and a crisp white workspace"
              width={2880}
              height={1800}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="lb-shot"
              priority
            />
            <figcaption className="mt-3 text-sm lb-muted text-right">The same admin, wearing Corporate</figcaption>
          </figure>
        </div>
      </header>

      {/* Lookbook */}
      <section id="lookbook" aria-labelledby="lookbook-title">
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <h2 id="lookbook-title" className="lb-display text-[clamp(2.75rem,5vw,4.5rem)]">
            The lookbook
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed lb-muted">
            Twelve built-in themes to start from. Every picture is a real Payload v4 admin wearing a theme that
            payloadtwist exported.
          </p>
        </div>

        {DRESSED.map((d, i) => {
          const flip = i % 2 === 1
          return (
            <article
              key={d.id}
              className="overflow-hidden py-20 lg:py-28"
              style={{ background: d.bg, color: d.ink }}
              aria-label={d.preset.name}
            >
              <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                <div className={`lg:col-span-4 ${flip ? 'lg:order-2' : ''}`}>
                  <h3
                    className="text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-tight"
                    style={{ fontFamily: `'${d.font}', sans-serif`, fontWeight: 600 }}
                  >
                    {d.preset.name}
                  </h3>
                  <p className="mt-6 text-lg leading-relaxed" style={{ opacity: 0.85 }}>
                    {d.preset.description}.
                  </p>
                  <p className="mt-2 text-[15px]" style={{ opacity: 0.75 }}>
                    {d.shows}.
                  </p>
                  <Link href={`/editor?theme=${d.id}`} className="lb-link mt-8 inline-block text-[15px] font-medium">
                    Try {d.preset.name} in the editor
                  </Link>
                </div>
                <div className={`lg:col-span-8 ${flip ? 'lg:order-1 lg:-ml-[6vw]' : 'lg:-mr-[6vw]'}`}>
                  <Image
                    src={shot(d.id)}
                    alt={`${d.shows} of a Payload v4 admin wearing the ${d.preset.name} theme`}
                    width={2880}
                    height={1800}
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="lb-shot"
                  />
                </div>
              </div>
            </article>
          )
        })}

        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24">
          <h3 className="lb-display text-[clamp(2rem,3.5vw,3rem)]">And a few more</h3>
          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            {MORE.map((id) => {
              const preset = THEME_PRESETS.find((p) => p.id === id)!
              return (
                <Link key={id} href={`/editor?theme=${id}`} className="group block">
                  <Image
                    src={shot(id === 'payload' ? 'stock' : id)}
                    alt={`A Payload v4 admin wearing the ${preset.name} theme`}
                    width={2880}
                    height={1800}
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="lb-shot transition-transform group-hover:-translate-y-1"
                  />
                  <p className="mt-4 text-lg font-medium">{preset.name}</p>
                  <p className="text-[15px] lb-muted">{preset.description}.</p>
                </Link>
              )
            })}
          </div>
          <p className="mt-12 text-[15px] lb-muted">
            People share their own themes too.{' '}
            <Link href="/presets" className="lb-link text-[var(--lb-ink)]">
              Browse shared themes
            </Link>
          </p>
        </div>
      </section>

      {/* Every control explained */}
      <section className="border-t border-[var(--lb-line)]" aria-labelledby="explained-title">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            <h2 id="explained-title" className="lb-display text-[clamp(2.5rem,4.5vw,4rem)]">
              Every control says what it changes
            </h2>
            <p className="mt-6 text-lg leading-relaxed lb-muted">
              Each setting has a plain description. Hover one and the editor outlines everything it touches in the live
              admin. Here, the brand color reaches buttons, checkboxes, pills and the selected tab.
            </p>
          </div>
          <Image
            src={shot('ch-explained')}
            alt="The editor with the Brand color hovered: every component it affects is outlined in the live admin preview"
            width={2880}
            height={1800}
            sizes="(min-width: 1280px) 1232px, 100vw"
            className="lb-shot mt-14"
          />
        </div>
      </section>

      {/* How it works: a real sequence, so numbered */}
      <section id="how" className="border-t border-[var(--lb-line)]" aria-labelledby="how-title">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <h2 id="how-title" className="lb-display text-[clamp(2.5rem,4.5vw,4rem)] max-w-2xl">
            From a look to your custom.css
          </h2>
          <ol className="mt-16 space-y-20 lg:space-y-24">
            {STEPS.map((step, i) => (
              <li key={step.title} className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <span className="lb-display lg:col-span-1 text-6xl lb-muted" aria-hidden>
                  {i + 1}
                </span>
                <div className="lg:col-span-5 lg:pt-3">
                  <h3 className="text-2xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed lb-muted max-w-md">{step.text}</p>
                </div>
                <div className="lg:col-span-6">
                  <Image
                    src={shot(step.image)}
                    alt={`The editor: ${step.title.toLowerCase()}`}
                    width={step.image === 'ch-export' ? 1792 : 856}
                    height={step.image === 'ch-export' ? 996 : 1200}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className={`lb-shot bg-[var(--lb-panel)] ${step.image === 'ch-export' ? 'w-full' : 'w-full max-w-sm max-h-[420px] object-cover object-top'}`}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Output */}
      <section className="border-t border-[var(--lb-line)]" aria-labelledby="output-title">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <h2 id="output-title" className="lb-display text-[clamp(2.5rem,4.5vw,4rem)]">
              Plain CSS you own
            </h2>
            <p className="mt-6 text-lg leading-relaxed lb-muted max-w-md">
              Only what you changed, with light and dark mode handled and no !important. Paste it into custom.css, or
              download a theme package for payload-admin-ui-themes so your editors can switch themes themselves.
            </p>
          </div>
          <div className="lg:col-span-7 min-w-0 rounded-[10px] border border-[var(--lb-line)] bg-[var(--lb-panel)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--lb-line)] text-sm lb-muted">custom.css</div>
            <pre className="p-5 overflow-x-auto max-h-[440px]">
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

      {/* Close */}
      <section className="border-t border-[var(--lb-line)]">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:py-36 flex flex-col items-center text-center">
          <LogoMark size={56} />
          <h2 className="lb-display mt-8 text-[clamp(3rem,6vw,5.5rem)]">Dress your admin.</h2>
          <p className="mt-6 text-lg lb-muted max-w-md">Free and open source, built for Payload v4. No plugin needed.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <Link href="/editor" className="lb-button">
              Open the editor
            </Link>
            <a href="https://github.com/elghaied/payloadtwist" className="lb-link text-[15px]">
              Source on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
