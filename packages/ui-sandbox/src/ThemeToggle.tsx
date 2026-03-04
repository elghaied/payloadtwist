'use client'

import React from 'react'
import type { ThemeToggleProps } from './types'

/**
 * Simple light/dark theme toggle button.
 * Uses Payload CSS variables for styling so it matches the current theme.
 *
 * For use inside PayloadUIShell, prefer `useShellTheme()` hook instead:
 * ```tsx
 * const { theme, toggleTheme } = useShellTheme()
 * ```
 */
export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(theme === 'light' ? 'dark' : 'light')}
      style={{
        padding: '6px 12px',
        borderRadius: 'var(--style-radius-s, 4px)',
        border: '1px solid var(--theme-elevation-150, #ddd)',
        background: 'var(--theme-elevation-50, #f5f5f5)',
        color: 'var(--theme-text, #333)',
        cursor: 'pointer',
        fontSize: '13px',
      }}
    >
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  )
}
