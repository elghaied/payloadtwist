import type { Metadata } from 'next'

// Pre-compiled CSS with ALL component styles (Button, TextField, etc.)
// This is the 248KB compiled stylesheet — equivalent to what Payload's RootLayout loads.
import '@payloadcms/ui/css'
// SCSS app entrypoint adds :root variables, global resets, @layer declaration
import './globals.scss'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Payload UI Sandbox',
  description: 'Payload UI components outside the admin panel',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <Script
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="http://localhost:3000/live-preview.js"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
