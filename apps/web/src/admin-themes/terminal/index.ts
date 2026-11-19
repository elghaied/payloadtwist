import type { AdminUITheme } from 'payload-admin-ui-themes'

export const terminalTheme: AdminUITheme = {
  id: "terminal",
  label: "Terminal",
  description: "Monospace everything, phosphor green, hard edges",
  Provider: '@/admin-themes/terminal/client#TerminalThemeProvider',
}
