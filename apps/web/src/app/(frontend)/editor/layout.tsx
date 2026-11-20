import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Editor',
  description:
    'Theme your Payload v4 admin on a live admin: colors, backgrounds, corners, spacing, fonts and single components, with every control explained. Export custom.css or a theme package.',
  path: '/editor',
})

export default function EditorLayout({ children }: { children: ReactNode }) {
  return children
}
