import type { AdminUITheme } from 'payload-admin-ui-themes'

export const corporateTheme: AdminUITheme = {
  id: "corporate",
  label: "Corporate",
  description: "Navy sidebar, crisp white workspace, compact",
  Provider: '@/admin-themes/corporate/client#CorporateThemeProvider',
}
