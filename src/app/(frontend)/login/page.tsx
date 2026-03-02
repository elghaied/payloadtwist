'use client'

import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { Suspense } from 'react'
import '../landing.css'

function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  return (
    <div className="landing min-h-screen flex items-center justify-center px-6">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
