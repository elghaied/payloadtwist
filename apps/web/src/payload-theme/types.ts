export type PayloadDarkMode = 'auto-inverted' | 'explicit' | 'none'

export interface PayloadCSSVariable {
  var: string           // e.g. "--color-base-0"
  value: string         // light mode value
  darkValue?: string    // only if explicitly set (currently none in schema)
  darkMode: PayloadDarkMode
  overridable: boolean
  category: string      // "elevation" | "theme" | "status.success" | etc.
  sourceFile: string
  resolvedType: string  // "color" | "size" | "font" | "number" | "other"
  responsive?: boolean  // true if the value is overridden at different breakpoints
  note?: string         // human-readable annotation (e.g. breakpoint overrides)
}

export interface PayloadThemeState {
  [varName: string]: string  // keyed by CSS var name
}

export interface PayloadThemeConfig {
  light: PayloadThemeState   // all overridable vars
  dark: PayloadThemeState    // only vars where darkMode === 'explicit'
  bemOverrides?: Record<string, string>      // key = block name, value = CSS string
  componentOverrides?: Record<string, string>  // key = "selector||property", value = CSS value
}

export interface PayloadThemeSchema {
  meta: {
    extractedAt: string
    payloadUiVersion: string
    sourceFiles: string[]
    stats: { totalCssVars: number; overridableVars: number; bemBlocks: number }
  }
  cssVariables: {
    baseScale: PayloadCSSVariable[]  // --color-base-* raw palette (primary theming lever)
    elevation: PayloadCSSVariable[]  // --theme-elevation-* computed aliases (overridable: false)
    theme: PayloadCSSVariable[]
    status: {
      success: PayloadCSSVariable[]
      warning: PayloadCSSVariable[]
      error: PayloadCSSVariable[]
    }
    typography: PayloadCSSVariable[]
    layout: PayloadCSSVariable[]
    other: PayloadCSSVariable[]
  }
}
