export const CONSENT_STORAGE_KEY = 'payloadtwist-consent'

export type ConsentCategory = 'essential' | 'analytics'

export interface ConsentState {
  updatedAt: string
  categories: Record<ConsentCategory, boolean>
}

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    if (!parsed.categories || typeof parsed.categories.essential !== 'boolean') return null
    return parsed
  } catch {
    return null
  }
}

export function writeConsent(state: ConsentState): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (e.g. private browsing quota exceeded)
  }
}
