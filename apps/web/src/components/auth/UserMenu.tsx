'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from '@/lib/auth-client'
import { LogOut, LayoutDashboard, Settings } from 'lucide-react'

export function UserMenu() {
  const { data: session, isPending } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isPending) return null

  if (!session) {
    return (
      <Link
        href="/login"
        className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-text)] transition-colors"
      >
        Sign in
      </Link>
    )
  }

  const initials = session.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : session.user.email[0].toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold hover:opacity-90 transition-opacity overflow-hidden"
        aria-label="User menu"
      >
        {session.user.image ? (
          <img src={session.user.image} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--lp-border)]">
            <p className="text-sm font-medium text-[var(--lp-text)] truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-[var(--lp-text-muted)] truncate">
              {session.user.email}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--lp-text-secondary)] hover:bg-[var(--lp-surface-2)] transition-colors"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--lp-text-secondary)] hover:bg-[var(--lp-surface-2)] transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings size={14} />
              Settings
            </Link>
            <button
              onClick={async () => {
                await signOut()
                setOpen(false)
                window.location.href = '/'
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--lp-text-secondary)] hover:bg-[var(--lp-surface-2)] transition-colors w-full text-left"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Compact version for the editor's tight logo row */
export function EditorUserMenu() {
  const { data: session, isPending } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isPending) return null

  if (!session) {
    return (
      <Link
        href="/login?callbackUrl=/editor"
        className="text-[11px] text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] transition-colors"
      >
        Sign in
      </Link>
    )
  }

  const initials = session.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : session.user.email[0].toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[9px] font-bold hover:opacity-90 transition-opacity overflow-hidden"
        aria-label="User menu"
      >
        {session.user.image ? (
          <img src={session.user.image} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-lg border border-[var(--pt-border)] bg-[var(--pt-surface)] shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--pt-border)]">
            <p className="text-xs font-medium text-[var(--pt-text)] truncate">
              {session.user.name}
            </p>
            <p className="text-[10px] text-[var(--pt-text-muted)] truncate">
              {session.user.email}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--pt-text-muted)] hover:bg-[var(--pt-surface-hover)] hover:text-[var(--pt-text)] transition-colors"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={12} />
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--pt-text-muted)] hover:bg-[var(--pt-surface-hover)] hover:text-[var(--pt-text)] transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings size={12} />
              Settings
            </Link>
            <button
              onClick={async () => {
                await signOut()
                setOpen(false)
                window.location.href = '/'
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--pt-text-muted)] hover:bg-[var(--pt-surface-hover)] hover:text-[var(--pt-text)] transition-colors w-full text-left"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
