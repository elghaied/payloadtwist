import type { ReactNode } from 'react'
import '../globals.css'

export const metadata = {
  title: 'Repaint — Payload Theme Editor',
}

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  )
}
