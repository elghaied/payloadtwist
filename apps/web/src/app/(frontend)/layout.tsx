import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import { ConsentProvider } from '@/providers/consent-provider'
import { Footer } from '@/components/Footer'
import { CookieConsent } from '@/components/CookieConsent'
import './globals.css'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://payloadtwist.com'

export const metadata: Metadata = {
  title: {
    default: 'payloadtwist — Visual Theme Editor for Payload CMS',
    template: '%s | payloadtwist',
  },
  description:
    'A visual theme editor for the Payload v4 admin. Theme brand colors, surfaces, radius, density and fonts on a live admin, then export clean CSS.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    siteName: 'payloadtwist',
    title: 'payloadtwist — Visual Theme Editor for Payload CMS',
    description:
      'Design your Payload v4 admin visually. Theme brand colors, surfaces, radius, density and fonts on a live admin, then export clean CSS.',
    url: siteUrl,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'payloadtwist — Visual Theme Editor for Payload CMS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'payloadtwist — Visual Theme Editor for Payload CMS',
    description:
      'Design your Payload v4 admin visually. Theme brand colors, surfaces, radius, density and fonts on a live admin, then export clean CSS.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    'Payload CMS',
    'theme editor',
    'CSS editor',
    'admin panel',
    'visual editor',
    'Payload v4',
    'custom.css',
    'design tokens',
    'Payload theme',
    'dark mode',
  ],
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
        <ThemeProvider>
          <ConsentProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-purple-600 focus:text-white focus:text-sm focus:font-medium"
            >
              Skip to main content
            </a>
            {children}
            <Footer />
            <CookieConsent />
          </ConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
