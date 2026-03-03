import { getDefaultTheme } from '@/payload-theme/config'
import { PayloadThemeConfig } from '@/payload-theme/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_HISTORY_COUNT = 30
const HISTORY_OVERRIDE_THRESHOLD_MS = 500

interface HistoryEntry {
  config: PayloadThemeConfig
  timestamp: number
}

interface EditorStore {
  config: PayloadThemeConfig
  history: HistoryEntry[]
  future: HistoryEntry[]

  setVariable(varName: string, value: string, mode: 'light' | 'dark'): void
  setBaseScale(vars: Record<string, string>): void
  setBaseRadius(m: number): void
  setBemOverride(blockName: string, css: string): void
  setComponentOverride(selector: string, property: string, value: string): void
  resetComponentOverrides(): void
  resetTheme(): void
  importTheme(config: PayloadThemeConfig): void
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      config: getDefaultTheme(),
      history: [],
      future: [],

      setVariable(varName: string, value: string, mode: 'light' | 'dark') {
        const currentConfig = get().config
        const currentHistory = get().history
        const currentTime = Date.now()

        const lastEntry =
          currentHistory.length > 0 ? currentHistory[currentHistory.length - 1] : null
        let updatedHistory = currentHistory

        if (!lastEntry || currentTime - lastEntry.timestamp >= HISTORY_OVERRIDE_THRESHOLD_MS) {
          updatedHistory = [...currentHistory, { config: currentConfig, timestamp: currentTime }]
          if (updatedHistory.length > MAX_HISTORY_COUNT) {
            updatedHistory = updatedHistory.slice(1)
          }
        }

        const newConfig: PayloadThemeConfig = {
          ...currentConfig,
          [mode]: {
            ...currentConfig[mode],
            [varName]: value,
          },
        }

        set({
          config: newConfig,
          history: updatedHistory,
          future: [],
        })
      },

      setBaseScale(vars: Record<string, string>) {
        const currentConfig = get().config
        const currentHistory = get().history
        const currentTime = Date.now()

        const lastEntry =
          currentHistory.length > 0 ? currentHistory[currentHistory.length - 1] : null
        let updatedHistory = currentHistory

        if (!lastEntry || currentTime - lastEntry.timestamp >= HISTORY_OVERRIDE_THRESHOLD_MS) {
          updatedHistory = [...currentHistory, { config: currentConfig, timestamp: currentTime }]
          if (updatedHistory.length > MAX_HISTORY_COUNT) {
            updatedHistory = updatedHistory.slice(1)
          }
        }

        set({
          config: {
            ...currentConfig,
            light: { ...currentConfig.light, ...vars },
          },
          history: updatedHistory,
          future: [],
        })
      },

      setBaseRadius(m: number) {
        const currentConfig = get().config
        const currentHistory = get().history
        const currentTime = Date.now()

        const lastEntry =
          currentHistory.length > 0 ? currentHistory[currentHistory.length - 1] : null
        let updatedHistory = currentHistory

        if (!lastEntry || currentTime - lastEntry.timestamp >= HISTORY_OVERRIDE_THRESHOLD_MS) {
          updatedHistory = [...currentHistory, { config: currentConfig, timestamp: currentTime }]
          if (updatedHistory.length > MAX_HISTORY_COUNT) {
            updatedHistory = updatedHistory.slice(1)
          }
        }

        const s = Math.max(1, Math.round(m / 1.5))
        const l = Math.round(m * 2)

        set({
          config: {
            ...currentConfig,
            light: {
              ...currentConfig.light,
              '--style-radius-s': `${s}px`,
              '--style-radius-m': `${m}px`,
              '--style-radius-l': `${l}px`,
            },
          },
          history: updatedHistory,
          future: [],
        })
      },

      setBemOverride(blockName: string, css: string) {
        const currentConfig = get().config
        const currentHistory = get().history
        const currentTime = Date.now()

        const lastEntry =
          currentHistory.length > 0 ? currentHistory[currentHistory.length - 1] : null
        let updatedHistory = currentHistory

        if (!lastEntry || currentTime - lastEntry.timestamp >= HISTORY_OVERRIDE_THRESHOLD_MS) {
          updatedHistory = [...currentHistory, { config: currentConfig, timestamp: currentTime }]
          if (updatedHistory.length > MAX_HISTORY_COUNT) {
            updatedHistory = updatedHistory.slice(1)
          }
        }

        const bemOverrides = { ...(currentConfig.bemOverrides ?? {}) }
        if (css.trim()) {
          bemOverrides[blockName] = css
        } else {
          delete bemOverrides[blockName]
        }

        set({
          config: { ...currentConfig, bemOverrides },
          history: updatedHistory,
          future: [],
        })
      },

      setComponentOverride(selector: string, property: string, value: string) {
        const currentConfig = get().config
        const currentHistory = get().history
        const currentTime = Date.now()

        const lastEntry =
          currentHistory.length > 0 ? currentHistory[currentHistory.length - 1] : null
        let updatedHistory = currentHistory

        if (!lastEntry || currentTime - lastEntry.timestamp >= HISTORY_OVERRIDE_THRESHOLD_MS) {
          updatedHistory = [...currentHistory, { config: currentConfig, timestamp: currentTime }]
          if (updatedHistory.length > MAX_HISTORY_COUNT) {
            updatedHistory = updatedHistory.slice(1)
          }
        }

        const key = `${selector}||${property}`
        const componentOverrides = { ...(currentConfig.componentOverrides ?? {}) }
        if (value.trim()) {
          componentOverrides[key] = value
        } else {
          delete componentOverrides[key]
        }

        set({
          config: { ...currentConfig, componentOverrides },
          history: updatedHistory,
          future: [],
        })
      },

      resetComponentOverrides() {
        const currentConfig = get().config
        const currentTime = Date.now()
        let updatedHistory = [...get().history, { config: currentConfig, timestamp: currentTime }]
        if (updatedHistory.length > MAX_HISTORY_COUNT) {
          updatedHistory = updatedHistory.slice(1)
        }

        set({
          config: { ...currentConfig, componentOverrides: {} },
          history: updatedHistory,
          future: [],
        })
      },

      resetTheme() {
        const currentConfig = get().config
        const currentTime = Date.now()
        let updatedHistory = [...get().history, { config: currentConfig, timestamp: currentTime }]
        if (updatedHistory.length > MAX_HISTORY_COUNT) {
          updatedHistory = updatedHistory.slice(1)
        }

        set({
          config: getDefaultTheme(),
          history: updatedHistory,
          future: [],
        })
      },

      importTheme(config: PayloadThemeConfig) {
        const currentConfig = get().config
        const currentTime = Date.now()
        let updatedHistory = [...get().history, { config: currentConfig, timestamp: currentTime }]
        if (updatedHistory.length > MAX_HISTORY_COUNT) {
          updatedHistory = updatedHistory.slice(1)
        }

        set({
          config,
          history: updatedHistory,
          future: [],
        })
      },

      undo() {
        const history = get().history
        if (history.length === 0) return

        const currentConfig = get().config
        const future = get().future
        const lastEntry = history[history.length - 1]

        set({
          config: lastEntry.config,
          history: history.slice(0, -1),
          future: [{ config: currentConfig, timestamp: Date.now() }, ...future],
        })
      },

      redo() {
        const future = get().future
        if (future.length === 0) return

        const currentConfig = get().config
        const history = get().history
        const firstEntry = future[0]

        let updatedHistory = [...history, { config: currentConfig, timestamp: Date.now() }]
        if (updatedHistory.length > MAX_HISTORY_COUNT) {
          updatedHistory = updatedHistory.slice(1)
        }

        set({
          config: firstEntry.config,
          history: updatedHistory,
          future: future.slice(1),
        })
      },

      canUndo: () => get().history.length > 0,
      canRedo: () => get().future.length > 0,
    }),
    {
      name: 'payload-editor-storage',
      // Only persist the theme config — history/future are ephemeral session state.
      // Persisting history caused a server/client hydration mismatch: the server
      // renders canUndo()=false (empty history) but the client would rehydrate
      // with a non-empty history, producing a disabled="" vs disabled={false} diff.
      partialize: (state) => ({ config: state.config }),
    },
  ),
)
