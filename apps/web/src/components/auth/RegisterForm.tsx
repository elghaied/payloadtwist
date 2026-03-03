'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth-client'
import { safeRedirectUrl } from '@/lib/validate-redirect'
import { OAuthButtons } from './OAuthButtons'

export function RegisterForm({ callbackUrl = '/dashboard' }: { callbackUrl?: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signUp.email({ name, email, password })

    if (result.error) {
      setError(result.error.message || 'Registration failed')
      setLoading(false)
    } else {
      router.push(safeRedirectUrl(callbackUrl))
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--lp-text)]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Create account
        </h1>
        <p className="text-sm text-[var(--lp-text-muted)] mt-1">
          Start building your Payload theme
        </p>
      </div>

      <OAuthButtons callbackUrl={callbackUrl} />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[var(--lp-border)]" />
        <span className="text-xs text-[var(--lp-text-muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--lp-border)]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] px-4 py-2.5 text-sm text-[var(--lp-text)] placeholder:text-[var(--lp-text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-colors"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] px-4 py-2.5 text-sm text-[var(--lp-text)] placeholder:text-[var(--lp-text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-colors"
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] px-4 py-2.5 text-sm text-[var(--lp-text)] placeholder:text-[var(--lp-text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-colors"
        />

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--lp-text-muted)] mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
