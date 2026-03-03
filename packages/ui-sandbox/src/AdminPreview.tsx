'use client'

import React from 'react'
import { PayloadUIShell } from './PayloadUIShell'
import { ThemeToggle } from './ThemeToggle'
import type { AdminPreviewProps, NavGroupConfig } from './types'

const defaultNavGroups: NavGroupConfig[] = [
  {
    label: 'Collections',
    items: [
      { label: 'Posts', slug: 'posts', active: true },
      { label: 'Users', slug: 'users' },
      { label: 'Media', slug: 'media' },
    ],
  },
]

/**
 * Full Payload admin panel preview shell.
 *
 * Renders the admin chrome (header bar, left nav sidebar, content area)
 * using Payload's own BEM CSS class names. Since consumers import
 * `@payloadcms/ui/css`, all styles are picked up automatically.
 *
 * Children are rendered inside `.document-fields > .render-fields`
 * exactly like the Payload collection edit view.
 */
export function AdminPreview({
  children,
  theme = 'light',
  collectionName = 'Posts',
  navGroups = defaultNavGroups,
  onThemeChange,
}: AdminPreviewProps) {
  return (
    <PayloadUIShell theme={theme} gutter={false}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          background: 'var(--theme-bg)',
          color: 'var(--theme-text)',
        }}
      >
        {/* ── App Header ── */}
        <header
          className="app-header"
          style={{
            height: 'var(--app-header-height, 54px)',
            borderBottom: '1px solid var(--theme-elevation-150)',
            flexShrink: 0,
          }}
        >
          <div className="app-header__wrapper">
            <div className="app-header__step-nav-wrapper">
              <nav className="step-nav">
                <span
                  className="step-nav__home"
                  style={{
                    width: 18,
                    height: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.5 3L3 7.5V17.5L11.5 22L20 17.5V7.5L11.5 3Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span
                  style={{
                    margin: '0 calc(var(--base, 1.54rem) / 2)',
                    opacity: 0.4,
                  }}
                >
                  /
                </span>
                <span>{collectionName}</span>
                <span
                  style={{
                    margin: '0 calc(var(--base, 1.54rem) / 2)',
                    opacity: 0.4,
                  }}
                >
                  /
                </span>
                <span className="step-nav__last">Edit</span>
              </nav>
            </div>

            <div className="app-header__actions-wrapper">
              <div className="app-header__actions">
                {onThemeChange && (
                  <ThemeToggle theme={theme} onChange={onThemeChange} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Nav + Content ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ── Left Nav Sidebar ── */}
          <nav
            style={{
              width: 'var(--nav-width, 275px)',
              flexShrink: 0,
              borderRight: '1px solid var(--theme-elevation-150)',
              overflowY: 'auto',
              padding: 'var(--base, 1.54rem)',
              background: 'var(--theme-bg)',
            }}
          >
            {navGroups.map((group) => (
              <div className="nav-group" key={group.label}>
                <button
                  className="nav-group__toggle"
                  type="button"
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="nav-group__label">{group.label}</div>
                </button>
                <div>
                  {group.items.map((item) => (
                    <div
                      key={item.slug}
                      style={{
                        padding: 'calc(var(--base, 1.54rem) * 0.35) 0',
                        paddingLeft: 'calc(var(--base, 1.54rem) * 0.5)',
                        fontSize: '13px',
                        color: item.active
                          ? 'var(--theme-text)'
                          : 'var(--theme-elevation-500)',
                        fontWeight: item.active ? 600 : 400,
                        cursor: 'default',
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* ── Main Content Area ── */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="collection-edit">
              <div className="collection-edit__main">
                <div className="document-fields">
                  <div className="document-fields__main">
                    <div
                      className="document-fields__edit"
                      style={{
                        padding: 'var(--gutter-h, 60px)',
                        paddingTop: 'calc(var(--base, 1.54rem) * 1.5)',
                      }}
                    >
                      <div className="render-fields">
                        {children}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </PayloadUIShell>
  )
}
