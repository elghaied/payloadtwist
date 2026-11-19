import type { AdminUITheme } from 'payload-admin-ui-themes'

export const brutalTheme: AdminUITheme = {
  id: "brutal",
  label: "Brutal",
  description: "Black and yellow, hard offset shadows, square",
  Provider: '@/admin-themes/brutal/client#BrutalThemeProvider',
}
