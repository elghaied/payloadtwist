/* eslint-disable @next/next/no-page-custom-font -- Pages Router rule; in the App Router the root layout loads fonts for every page */
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import { ConsentProvider } from '@/providers/consent-provider'
import { Footer } from '@/components/Footer'
import { CookieConsent } from '@/components/CookieConsent'
import { pageMetadata, SITE_DESCRIPTION, SITE_URL } from '@/lib/seo'
import './globals.css'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// Share cards for pages without their own; canonical URLs are set per page
const shared = pageMetadata({ path: '/' })

export const metadata: Metadata = {
  title: {
    default: 'payloadtwist — Visual Theme Editor for Payload CMS',
    template: '%s | payloadtwist',
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: shared.openGraph,
  twitter: shared.twitter,
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
