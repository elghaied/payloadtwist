import type { AdminUITheme } from 'payload-admin-ui-themes'

export const midnightTheme: AdminUITheme = {
  id: "midnight",
  label: "Midnight",
  description: "Deep indigo sidebar, violet glow, near-black dark mode",
  Provider: '@/admin-themes/midnight/client#MidnightThemeProvider',
}
