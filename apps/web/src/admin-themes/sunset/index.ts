import type { AdminUITheme } from 'payload-admin-ui-themes'

export const sunsetTheme: AdminUITheme = {
  id: "sunset",
  label: "Sunset",
  description: "Coral to pink, warm surfaces, generous radius",
  Provider: '@/admin-themes/sunset/client#SunsetThemeProvider',
}
