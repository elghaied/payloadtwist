import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to payloadtwist to save and manage your Payload CMS theme presets.',
  robots: { index: false, follow: true },
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
