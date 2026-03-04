'use server'

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
}

export async function verifyTurnstile(token: string): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // If no secret key configured, skip verification (dev mode)
    return { success: true }
  }

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })

  const data: TurnstileVerifyResponse = await res.json()

  if (!data.success) {
    return { success: false, error: 'CAPTCHA verification failed. Please try again.' }
  }

  return { success: true }
}
