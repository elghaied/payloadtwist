import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://payloadtwist.com'

export const metadata: Metadata = {
  title: {
    default: 'payloadtwist — Visual Theme Editor for Payload CMS',
    template: '%s | payloadtwist',
  },
  description:
    'A visual CSS theme editor for the Payload CMS admin panel. Tweak colors, typography, spacing and components with real-time preview, then export clean CSS.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    siteName: 'payloadtwist',
    title: 'payloadtwist — Visual Theme Editor for Payload CMS',
    description:
      'Design your Payload admin panel visually. Tweak colors, typography, spacing and components with real-time preview, then export clean CSS.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'payloadtwist — Visual Theme Editor for Payload CMS',
    description:
      'Design your Payload admin panel visually. Tweak colors, typography, spacing and components with real-time preview, then export clean CSS.',
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
    'custom.scss',
    'Payload theme',
    'dark mode',
  ],
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
