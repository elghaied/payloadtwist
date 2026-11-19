import type { AdminUITheme } from 'payload-admin-ui-themes'

export const forestTheme: AdminUITheme = {
  id: "forest",
  label: "Forest",
  description: "Moss sidebar, emerald accents, Lora headings",
  Provider: '@/admin-themes/forest/client#ForestThemeProvider',
}
