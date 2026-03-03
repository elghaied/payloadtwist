'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark, Wordmark } from '@/components/Logo'
import { UserMenu } from '@/components/auth/UserMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useSession } from '@/lib/auth-client'

const navLinks = [
  { href: '/editor', label: 'Editor' },
  { href: '/dashboard', label: 'Dashboard', authOnly: true },
  { href: '/presets', label: 'Gallery' },
]

export function AppNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--lp-nav-border)] bg-[var(--lp-nav-bg)] backdrop-blur-xl">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark size={28} />
          <Wordmark className="text-lg" />
        </Link>
        <div className="flex items-center gap-8 text-sm text-[var(--lp-text-muted)]">
          {navLinks
            .filter((link) => !link.authOnly || session)
            .map((link) => (
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
        </div>
      </div>
    </nav>
  )
}
