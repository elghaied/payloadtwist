import type { AdminUITheme } from 'payload-admin-ui-themes'

export const monoTheme: AdminUITheme = {
  id: "mono",
  label: "Mono",
  description: "Strict black and white, OLED dark mode",
  Provider: '@/admin-themes/mono/client#MonoThemeProvider',
}
