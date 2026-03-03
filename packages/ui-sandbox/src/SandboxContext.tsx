'use client'

import { createContext, useContext } from 'react'

interface SandboxContextValue {
  insideShell: boolean
}

export const SandboxContext = createContext<SandboxContextValue>({ insideShell: false })

/**
 * Returns true if the component is inside a PayloadUIShell.
 * Used by FieldPreview to skip redundant shell wrapping.
 */
export function useInsideShell(): boolean {
  return useContext(SandboxContext).insideShell
}
