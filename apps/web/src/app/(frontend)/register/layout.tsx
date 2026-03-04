import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a payloadtwist account to save and share your Payload CMS theme presets.',
  robots: { index: false, follow: true },
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children
}
