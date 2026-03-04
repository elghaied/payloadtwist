import type { Metadata } from 'next'
import '@payloadcms/ui/css'
import './globals.scss'

export const metadata: Metadata = {
  title: 'Preview — payloadtwist',
  description: 'Sandbox preview for Payload CMS theme editor',
}

export default function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
