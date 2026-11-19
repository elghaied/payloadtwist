import type { AdminUITheme } from 'payload-admin-ui-themes'

export const paperTheme: AdminUITheme = {
  id: "paper",
  label: "Editorial",
  description: "Serif headlines on warm paper, rust ink",
  Provider: '@/admin-themes/paper/client#PaperThemeProvider',
}
