import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BorderStyle, Density, FontRole, ShadowStyle, SurfaceOptions } from '@/payload-theme/controls'
import type { SeedKey } from '@/payload-theme/ramps'
import {
  defaultTheme,
  parseTheme,
  setDensity,
  setBorders,
  setFont,
  setRamp,
  setShadows,
  setSurfaces,
  setRoundness,
  setSeed,
  setToken,
  setTypeScale,
  type Mode,
  type ThemeConfig,
} from '@/payload-theme/theme'

const MAX_HISTORY = 50
/** Edits closer together than this (e.g. dragging a picker) collapse into one undo step */
const COALESCE_MS = 500

export type PreviewTheme = 'light' | 'dark'

interface EditorState {
  theme: ThemeConfig
  past: ThemeConfig[]
  future: ThemeConfig[]
  lastEditAt: number

  previewTheme: PreviewTheme
  enhancedContrast: boolean

  setSeed(key: SeedKey, hex: string | null): void
  setRamp(varName: string, value: string | null): void
  setToken(varName: string, value: string | null, mode: Mode): void
  setRoundness(px: number | null): void
  setDensity(density: Density): void
  setTypeScale(scale: number): void
  setFont(role: FontRole, family: string | null): void
  setSurfaces(opts: SurfaceOptions | null): void
  setShadows(style: ShadowStyle): void
  setBorders(style: BorderStyle): void
  setCustomCss(css: string): void
  /** Replace the whole theme (presets, imports, saved presets). Always its own undo step. */
  loadTheme(theme: unknown): void
  resetTheme(): void
  undo(): void
  redo(): void

  setPreviewTheme(theme: PreviewTheme): void
  setEnhancedContrast(enabled: boolean): void
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => {
      const commit = (update: (t: ThemeConfig) => ThemeConfig, coalesce = true) => {
        const { theme, past, lastEditAt } = get()
        const next = update(theme)
        if (next === theme) return
        const now = Date.now()
        const merge = coalesce && now - lastEditAt < COALESCE_MS && past.length > 0
        set({
          theme: next,
          past: merge ? past : [...past, theme].slice(-MAX_HISTORY),
          future: [],
          lastEditAt: coalesce ? now : 0,
        })
      }

      return {
        theme: defaultTheme(),
        past: [],
        future: [],
        lastEditAt: 0,
        previewTheme: 'light',
        enhancedContrast: false,

        setSeed: (key, hex) => commit((t) => setSeed(t, key, hex)),
        setRamp: (v, value) => commit((t) => setRamp(t, v, value)),
        setToken: (v, value, mode) => commit((t) => setToken(t, v, value, mode)),
        setRoundness: (px) => commit((t) => setRoundness(t, px)),
        setDensity: (d) => commit((t) => setDensity(t, d)),
        setTypeScale: (s) => commit((t) => setTypeScale(t, s)),
        setFont: (role, family) => commit((t) => setFont(t, role, family)),
        setSurfaces: (opts) => commit((t) => setSurfaces(t, opts)),
        setShadows: (style) => commit((t) => setShadows(t, style)),
        setBorders: (style) => commit((t) => setBorders(t, style)),
        setCustomCss: (css) => commit((t) => ({ ...t, customCss: css })),
        loadTheme: (input) => commit(() => parseTheme(input), false),
        resetTheme: () => commit(() => defaultTheme(), false),

        undo() {
          const { past, theme, future } = get()
          if (!past.length) return
          set({ theme: past[past.length - 1], past: past.slice(0, -1), future: [theme, ...future], lastEditAt: 0 })
        },
        redo() {
          const { past, theme, future } = get()
          if (!future.length) return
          set({ theme: future[0], past: [...past, theme], future: future.slice(1), lastEditAt: 0 })
        },

        setPreviewTheme: (previewTheme) => set({ previewTheme }),
        setEnhancedContrast: (enhancedContrast) => set({ enhancedContrast }),
      }
    },
    {
      name: 'payloadtwist-editor-v4',
      version: 1,
      partialize: (s) => ({ theme: s.theme, previewTheme: s.previewTheme, enhancedContrast: s.enhancedContrast }),
      // A corrupted or hand-edited localStorage entry must not brick the editor
      merge: (persisted, current) => {
        const p = persisted as Partial<EditorState> | undefined
        let theme = current.theme
        try {
          if (p?.theme) theme = parseTheme(p.theme)
        } catch {
          // fall back to the default theme
        }
        return {
          ...current,
          theme,
          previewTheme: p?.previewTheme === 'dark' ? 'dark' : 'light',
          enhancedContrast: p?.enhancedContrast === true,
        }
      },
    },
  ),
)

export const selectCanUndo = (s: EditorState) => s.past.length > 0
export const selectCanRedo = (s: EditorState) => s.future.length > 0
