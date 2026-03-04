'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useConsent } from '@/providers/consent-provider'

const HIDDEN_PREFIXES = ['/editor', '/preview']

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-purple)] focus-visible:ring-offset-2"
      style={{
        backgroundColor: checked ? 'var(--lp-purple)' : 'var(--lp-ghost-bg)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          transform: checked ? 'translateX(21px)' : 'translateX(1px)',
          marginTop: '2px',
        }}
      />
    </button>
  )
}

export function CookieConsent() {
  const pathname = usePathname()
  const { showBanner, consent, acceptAll, acceptEssentialOnly, savePreferences } = useConsent()
  const [expanded, setExpanded] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  // Sync analytics toggle when banner re-opens with existing preferences
  const analyticsValue = expanded ? analyticsEnabled : (consent?.categories.analytics ?? false)

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null
  }

  if (!showBanner) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50"
      style={{
        background: 'var(--lp-surface)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--lp-border-medium)',
        animation: 'lp-slide-up 0.3s ease-out forwards',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-4">
        {!expanded ? (
          /* ── Compact view ── */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--lp-text)' }}
              >
                We use cookies to improve your experience.
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--lp-text-faint)' }}
              >
                Essential cookies are always active. Analytics cookies help us improve the product.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={acceptEssentialOnly}
                className="px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer"
                style={{
                  background: 'var(--lp-ghost-bg)',
                  color: 'var(--lp-text)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--lp-ghost-bg-hover)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'var(--lp-ghost-bg)')
                }
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalyticsEnabled(consent?.categories.analytics ?? false)
                  setExpanded(true)
                }}
                className="px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer"
                style={{
                  background: 'var(--lp-ghost-bg)',
                  color: 'var(--lp-text)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--lp-ghost-bg-hover)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'var(--lp-ghost-bg)')
                }
              >
                Manage
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #9333ea, #ec4899, #06b6d4)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          /* ── Expanded view ── */
          <div className="space-y-4">
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--lp-text)' }}
            >
              Cookie Preferences
            </h2>

            {/* Essential */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--lp-text)' }}>
                  Essential{' '}
                  <span
                    className="text-xs ml-1"
                    style={{ color: 'var(--lp-text-faint)' }}
                  >
                    (Required)
                  </span>
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--lp-text-muted)' }}
                >
                  Authentication, security, and basic functionality.
                </p>
              </div>
              <Toggle checked={true} onChange={() => {}} disabled />
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--lp-text)' }}>
                  Analytics
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--lp-text-muted)' }}
                >
                  Anonymous usage data to help us improve the product.
                </p>
              </div>
              <Toggle
                checked={analyticsValue}
                onChange={setAnalyticsEnabled}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer"
                style={{
                  background: 'var(--lp-ghost-bg)',
                  color: 'var(--lp-text)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--lp-ghost-bg-hover)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'var(--lp-ghost-bg)')
                }
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  savePreferences({
                    essential: true,
                    analytics: analyticsEnabled,
                  })
                }
                className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #9333ea, #ec4899, #06b6d4)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
