import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editor',
  description:
    'Design your Payload CMS admin theme visually. Adjust colors, fonts, spacing and components with a live iframe preview.',
}

export default function EditorLayout({ children }: { children: ReactNode }) {
  return children
}
