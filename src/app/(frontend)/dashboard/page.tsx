import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getMyPresets } from '@/lib/actions/presets'
import { DashboardClient } from './dashboard-client'
import '../landing.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — payloadtwist',
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const presets = await getMyPresets()

  return (
    <div className="landing min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold text-[var(--lp-text)]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Your Presets
            </h1>
            <p className="text-sm text-[var(--lp-text-muted)] mt-1">
              Welcome back, {session!.user.name}
            </p>
          </div>
          <Link
            href="/editor"
            className="rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white px-5 py-2 text-sm font-medium transition-all"
          >
            New Preset
          </Link>
        </div>

        <DashboardClient presets={presets} />
      </div>
    </div>
  )
}
