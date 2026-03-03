import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { safeRedirectUrl } from '@/lib/validate-redirect'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('better-auth.session_token')?.value

  // Protected routes — require auth
  if (pathname.startsWith('/dashboard')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Auth pages — redirect if already logged in
  if (pathname === '/login' || pathname === '/register') {
    if (sessionToken) {
      const callbackUrl = safeRedirectUrl(
        request.nextUrl.searchParams.get('callbackUrl'),
        '/dashboard'
      )
      return NextResponse.redirect(new URL(callbackUrl, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
