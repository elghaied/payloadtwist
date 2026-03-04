'use client'

import { useSearchParams } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { AppNavbar } from '@/components/AppNavbar'
import { Suspense } from 'react'
import '../landing.css'

function RegisterContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  return (
    <div className="landing min-h-screen">
      <AppNavbar />
      <div id="main-content" className="min-h-screen flex items-center justify-center px-6 pt-16">
        <RegisterForm callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  )
}
