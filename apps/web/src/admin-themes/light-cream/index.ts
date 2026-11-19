import type { AdminUITheme } from 'payload-admin-ui-themes'

export const lightCreamTheme: AdminUITheme = {
  id: "light-cream",
  label: "Light Cream",
  description: "Cream paper, sage green, soft and roomy",
  Provider: '@/admin-themes/light-cream/client#LightCreamThemeProvider',
}
