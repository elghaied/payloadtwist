'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  readConsent,
  writeConsent,
  type ConsentCategory,
  type ConsentState,
} from '@/lib/consent'

interface ConsentContextValue {
  consent: ConsentState | null
  showBanner: boolean
  acceptAll: () => void
  acceptEssentialOnly: () => void
  savePreferences: (categories: Record<ConsentCategory, boolean>) => void
  openBanner: () => void
  hasConsent: (category: ConsentCategory) => boolean
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error('useConsent must be used within <ConsentProvider>')
  }
  return ctx
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Read from localStorage after mount
  useEffect(() => {
    const stored = readConsent()
    setConsent(stored)
    if (!stored) {
      setShowBanner(true)
    }
    setMounted(true)
  }, [])

  const persist = useCallback((categories: Record<ConsentCategory, boolean>) => {
    const state: ConsentState = {
      updatedAt: new Date().toISOString(),
      categories: { ...categories, essential: true },
    }
    writeConsent(state)
    setConsent(state)
    setShowBanner(false)
  }, [])

  const acceptAll = useCallback(() => {
    persist({ essential: true, analytics: true })
  }, [persist])

  const acceptEssentialOnly = useCallback(() => {
    persist({ essential: true, analytics: false })
  }, [persist])

  const savePreferences = useCallback(
    (categories: Record<ConsentCategory, boolean>) => {
      persist(categories)
    },
    [persist],
  )

  const openBanner = useCallback(() => {
    setShowBanner(true)
  }, [])

  const hasConsent = useCallback(
    (category: ConsentCategory): boolean => {
      if (category === 'essential') return true
      return consent?.categories[category] ?? false
    },
    [consent],
  )

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      showBanner: mounted && showBanner,
      acceptAll,
      acceptEssentialOnly,
      savePreferences,
      openBanner,
      hasConsent,
    }),
    [consent, mounted, showBanner, acceptAll, acceptEssentialOnly, savePreferences, openBanner, hasConsent],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}
