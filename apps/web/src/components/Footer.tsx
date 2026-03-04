'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/Logo'
import { GShellBrand } from '@/components/GShellBrand'
import { useConsent } from '@/providers/consent-provider'

const HIDDEN_ROUTES = ['/editor']

export function Footer() {
  const pathname = usePathname()
  const { openBanner } = useConsent()

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
        <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <button
            onClick={openBanner}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Cookies
          </button>
          <span className="text-muted-foreground/40">·</span>
          <GShellBrand showPrefix prefixText="Built by" size="sm" />
          <span className="text-muted-foreground/40">·</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  )
}
