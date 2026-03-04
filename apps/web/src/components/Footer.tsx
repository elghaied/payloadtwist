'use client'

import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/Logo'
import { GShellBrand } from '@/components/GShellBrand'

const HIDDEN_ROUTES = ['/editor']

export function Footer() {
  const pathname = usePathname()

  if (HIDDEN_ROUTES.some((route) => pathname.startsWith(route))) {
    return null
  }

  return (
    <footer className="border-t border-border/30 py-8 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground/70 text-xs">
          <LogoMark size={16} />
          <span>payloadtwist — open source</span>
        </div>
        <div className="flex items-center gap-4">
          <GShellBrand showPrefix prefixText="Built by" size="sm" />
          <span className="text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground/70">MIT License</span>
        </div>
      </div>
    </footer>
  )
}
