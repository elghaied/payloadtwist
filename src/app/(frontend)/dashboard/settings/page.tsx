import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { SettingsClient } from './settings-client'
import { AppNavbar } from '@/components/AppNavbar'
import '../../landing.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Account Settings',
  description: 'Manage your payloadtwist account settings.',
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="landing min-h-screen">
      <AppNavbar />
      <div className="mx-auto max-w-2xl px-6 pt-24 pb-16">
        <h1
          className="text-2xl font-bold text-[var(--lp-text)] mb-8"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Account Settings
        </h1>
        <SettingsClient
          userName={session!.user.name}
          userEmail={session!.user.email}
        />
      </div>
    </div>
  )
}
