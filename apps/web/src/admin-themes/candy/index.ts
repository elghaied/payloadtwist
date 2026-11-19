import type { AdminUITheme } from 'payload-admin-ui-themes'

export const candyTheme: AdminUITheme = {
  id: "candy",
  label: "Candy",
  description: "Bubblegum pink, violet glow, round everything",
  Provider: '@/admin-themes/candy/client#CandyThemeProvider',
}
