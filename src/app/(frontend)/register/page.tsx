'use client'

import { useSearchParams } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Suspense } from 'react'
import '../landing.css'

function RegisterContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  return (
    <div className="landing min-h-screen flex items-center justify-center px-6">
      <RegisterForm callbackUrl={callbackUrl} />
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
