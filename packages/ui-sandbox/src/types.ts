import type { ReactNode, ComponentType } from 'react'

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export type ShellTheme = 'light' | 'dark'

export interface PayloadUIShellProps {
  /** Child components to render inside the Payload UI context */
  children: ReactNode
  /** Theme for Payload's CSS. Default: 'light' */
  theme?: ShellTheme
  /** Override the default mock config passed to ConfigProvider */
  config?: Record<string, unknown>
  /** Override the default mock server function for ServerFunctionsProvider */
  serverFunction?: (args: unknown) => Promise<unknown>
  /** Operation context for OperationProvider. Default: 'create' */
  operation?: 'create' | 'update'
  /** Add gutter padding (Payload CSS classes). Default: true */
  gutter?: boolean
  /** Wrap children in a .render-fields container. Default: false */
  renderFields?: boolean
  /** Additional CSS class on the outermost wrapper div */
  className?: string
}

export interface ShellThemeContextValue {
  theme: ShellTheme
  setTheme: (theme: ShellTheme) => void
  toggleTheme: () => void
}

// ---------------------------------------------------------------------------
// FieldPreview
// ---------------------------------------------------------------------------

export interface FieldPreviewProps {
  /** The field component to preview */
  // Payload field components have varied prop signatures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  /** Field configuration passed to the component */
  fieldConfig: {
    name: string
    label?: string
    type: string
    required?: boolean
    admin?: {
      description?: string
      placeholder?: string
      [key: string]: unknown
    }
    options?: Array<{ label: string; value: string }>
    [key: string]: unknown
  }
  /** Initial value for the field */
  initialValue?: unknown
  /** Theme: 'light' or 'dark'. Default: 'light' */
  theme?: ShellTheme
  /** Additional props passed to the component */
  componentProps?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// ViewPreview
// ---------------------------------------------------------------------------

export interface ViewPreviewProps {
  /** The view component to preview */
  // Payload view components have varied prop signatures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  /** Type of view — determines layout context */
  viewType: 'dashboard' | 'beforeList' | 'afterList' | 'action' | 'custom'
  /** Theme: 'light' or 'dark'. Default: 'light' */
  theme?: ShellTheme
  /** Additional props passed to the component */
  componentProps?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// ThemeToggle
// ---------------------------------------------------------------------------

export interface ThemeToggleProps {
  /** Current theme */
  theme: ShellTheme
  /** Callback when theme changes */
  onChange: (theme: ShellTheme) => void
}

// ---------------------------------------------------------------------------
// ErrorBoundary
// ---------------------------------------------------------------------------

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Name displayed in error/success output */
  name: string
}

// ---------------------------------------------------------------------------
// AdminPreview
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string
  slug: string
  active?: boolean
}

export interface NavGroupConfig {
  label: string
  items: NavItem[]
}

export interface AdminPreviewProps {
  /** Field components to render in the edit form area */
  children: ReactNode
  /** Theme: 'light' or 'dark'. Default: 'light' */
  theme?: ShellTheme
  /** Collection name shown in header breadcrumb. Default: 'Posts' */
  collectionName?: string
  /** Nav sidebar groups. Default: a single "Collections" group */
  navGroups?: NavGroupConfig[]
  /** Callback when theme changes (ThemeToggle in header) */
  onThemeChange?: (theme: ShellTheme) => void
}

// ---------------------------------------------------------------------------
// Mock utilities
// ---------------------------------------------------------------------------

export interface MockConfigOptions {
  /** Custom collections for the mock config */
  collections?: Array<{ slug: string; fields: unknown[] }>
  /** Custom globals for the mock config */
  globals?: Array<{ slug: string; fields: unknown[] }>
  /** Server URL. Default: '' */
  serverURL?: string
  /** Admin route prefix. Default: '/admin' */
  adminRoute?: string
  /** Cookie prefix. Default: 'payload' */
  cookiePrefix?: string
}
