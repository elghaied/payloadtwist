'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ConfigProvider,
  TranslationProvider,
  ThemeProvider,
  RouteTransitionProvider,
  ServerFunctionsProvider,
  UploadHandlersProvider,
  OperationProvider,
} from '@payloadcms/ui'
import { en } from '@payloadcms/translations/languages/en'
import { defaultMockConfig, defaultMockServerFunction } from './mock/config'
import { SandboxContext } from './SandboxContext'
import type { ShellTheme, ShellThemeContextValue, PayloadUIShellProps } from './types'

// ---------------------------------------------------------------------------
// Shell theme context — external theme control independent of Payload's useTheme
// ---------------------------------------------------------------------------

const ShellThemeContext = createContext<ShellThemeContextValue | null>(null)

/**
 * Hook for external theme control of the PayloadUIShell.
 * Returns `{ theme, setTheme, toggleTheme }`.
 * Must be used within a PayloadUIShell component tree.
 */
export function useShellTheme(): ShellThemeContextValue {
  const ctx = useContext(ShellThemeContext)
  if (!ctx) {
    throw new Error('useShellTheme must be used within a <PayloadUIShell> component')
  }
  return ctx
}

// Payload's TranslationProvider expects I18nClient['translations'] but the
// language pack export shape doesn't exactly match — cast is intentional.
const defaultTranslations = en.translations as Record<string, unknown>

// ---------------------------------------------------------------------------
// PayloadUIShell component
// ---------------------------------------------------------------------------

/**
 * Wrapper component that sets up the 7 required Payload providers for
 * rendering @payloadcms/ui components outside the admin panel.
 *
 * Provider stack (in order):
 * ConfigProvider > TranslationProvider > ThemeProvider > RouteTransitionProvider >
 * ServerFunctionsProvider > UploadHandlersProvider > OperationProvider
 *
 * AuthProvider is deliberately omitted — it makes API calls on mount.
 * The Form's refreshCookie() call after ~15s produces a non-fatal console error.
 */
export function PayloadUIShell({
  children,
  theme: themeProp = 'light',
  config,
  serverFunction,
  operation = 'create',
  gutter = true,
  renderFields = false,
  className,
}: PayloadUIShellProps) {
  const [theme, setThemeState] = useState<ShellTheme>(themeProp)

  // Sync with prop changes
  useEffect(() => {
    setThemeState(themeProp)
  }, [themeProp])

  // Sync data-theme attribute on <html> for Payload's CSS selectors.
  // Restores previous value on unmount.
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme')
    document.documentElement.setAttribute('data-theme', theme)
    return () => {
      document.documentElement.setAttribute('data-theme', prev ?? 'light')
    }
  }, [theme])

  const setTheme = useCallback((newTheme: ShellTheme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const shellThemeValue = useMemo<ShellThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  const resolvedConfig = config ?? defaultMockConfig
  const resolvedServerFunction = serverFunction ?? defaultMockServerFunction

  // Build CSS classes for the wrapper
  const wrapperClasses = [
    gutter ? 'gutter--left gutter--right' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  // Inner content — optionally wrapped in .render-fields
  const content = renderFields ? (
    <div className="render-fields">{children}</div>
  ) : (
    children
  )

  return (
    <SandboxContext.Provider value={{ insideShell: true }}>
      <ShellThemeContext.Provider value={shellThemeValue}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ConfigProvider config={resolvedConfig as any}>
        <TranslationProvider
          dateFNSKey="en-US"
          fallbackLang="en"
          language="en"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          languageOptions={[{ label: 'English', value: 'en' }] as any}
          switchLanguageServerAction={async () => {}}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          translations={defaultTranslations as any}
        >
          <ThemeProvider theme={theme}>
            <RouteTransitionProvider>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ServerFunctionsProvider serverFunction={resolvedServerFunction as any}>
                <UploadHandlersProvider>
                  <OperationProvider operation={operation}>
                    {wrapperClasses ? (
                      <div className={wrapperClasses}>{content}</div>
                    ) : (
                      content
                    )}
                  </OperationProvider>
                </UploadHandlersProvider>
              </ServerFunctionsProvider>
            </RouteTransitionProvider>
          </ThemeProvider>
        </TranslationProvider>
      </ConfigProvider>
      </ShellThemeContext.Provider>
    </SandboxContext.Provider>
  )
}
