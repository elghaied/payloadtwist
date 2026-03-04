'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark, Wordmark } from '@/components/Logo'
import { UserMenu } from '@/components/auth/UserMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useSession } from '@/lib/auth-client'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/editor', label: 'Editor' },
  { href: '/dashboard', label: 'Dashboard', authOnly: true },
  { href: '/presets', label: 'Gallery' },
]

export function AppNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleLinks = navLinks.filter((link) => !link.authOnly || session)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--lp-nav-border)] bg-[var(--lp-nav-bg)] backdrop-blur-xl">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark size={28} />
          <Wordmark className="text-lg" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--lp-text-muted)]">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-[var(--lp-text)] transition-colors ${
                pathname.startsWith(link.href) ? 'text-[var(--lp-text)] font-medium' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <UserMenu />
          <ThemeToggle />
          <button
            className="md:hidden p-1 text-[var(--lp-text-muted)] hover:text-[var(--lp-text)]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--lp-nav-border)] bg-[var(--lp-nav-bg)] px-6 py-3 flex flex-col gap-2">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm py-1.5 transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-[var(--lp-text)] font-medium'
                  : 'text-[var(--lp-text-muted)] hover:text-[var(--lp-text)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
