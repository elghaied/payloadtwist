// Main components
export { PayloadUIShell, useShellTheme } from './PayloadUIShell'
export { AdminPreview } from './AdminPreview'
export { FieldPreview } from './FieldPreview'
export { ViewPreview } from './ViewPreview'
export { ThemeToggle } from './ThemeToggle'
export { ErrorBoundary } from './ErrorBoundary'
export { useInsideShell } from './SandboxContext'

// Mock utilities
export {
  defaultMockConfig,
  createMockConfig,
  defaultMockServerFunction,
} from './mock/config'
export { mockUser, mockAuthContext } from './mock/auth'
export {
  buildFormState,
  buildMultiFieldState,
  buildFieldConfig,
} from './mock/form'

// Types
export type {
  PayloadUIShellProps,
  ShellTheme,
  ShellThemeContextValue,
  FieldPreviewProps,
  ViewPreviewProps,
  ThemeToggleProps,
  ErrorBoundaryProps,
  AdminPreviewProps,
  NavGroupConfig,
  NavItem,
  MockConfigOptions,
} from './types'
