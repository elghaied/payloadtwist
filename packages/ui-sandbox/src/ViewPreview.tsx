'use client'

import React from 'react'
import { PayloadUIShell } from './PayloadUIShell'
import type { ViewPreviewProps } from './types'

/**
 * Self-contained view preview wrapper.
 * Wraps a view component in PayloadUIShell with appropriate layout.
 */
export function ViewPreview({
  component: Component,
  viewType,
  theme = 'light',
  componentProps,
}: ViewPreviewProps) {
  return (
    <PayloadUIShell theme={theme} gutter={viewType !== 'custom'}>
      <Component {...componentProps} />
    </PayloadUIShell>
  )
}
