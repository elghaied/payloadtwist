import type { AdminUITheme } from 'payload-admin-ui-themes'

export const nordTheme: AdminUITheme = {
  id: "nord",
  label: "Nord",
  description: "Arctic blues, cool greys, quiet flat surfaces",
  Provider: '@/admin-themes/nord/client#NordThemeProvider',
}
