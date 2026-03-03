'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { FieldContext } from '@payloadcms/ui'
import { PayloadUIShell } from './PayloadUIShell'
import { useInsideShell } from './SandboxContext'
import type { FieldPreviewProps } from './types'

/**
 * Self-contained field preview wrapper.
 *
 * Wraps a field component in PayloadUIShell + FieldContext so that:
 * - Components using `useField()` get a working field state (via FieldContext)
 * - Presentational *Input components receive `value`/`onChange` as props
 *
 * Does NOT use Payload's Form component. Form requires Auth, Locale, and
 * DocumentInfo providers that are impractical to mock outside the admin panel.
 * Instead, we provide FieldContext directly — an API specifically designed for
 * managing field state outside of Form (marked @experimental in Payload).
 */
export function FieldPreview({
  component: Component,
  fieldConfig,
  initialValue,
  theme = 'light',
  componentProps,
}: FieldPreviewProps) {
  const insideShell = useInsideShell()
  const [value, setValue] = useState<unknown>(initialValue ?? '')
  const path = fieldConfig.name

  // setValue compatible with useField's signature: (val | event, disableModifyingForm?) => void
  const setFieldValue = useCallback((val: unknown) => {
    // Handle React events (e.g. from <input onChange>)
    const isEvent =
      val && typeof val === 'object' && typeof (val as any).preventDefault === 'function'
    setValue(isEvent ? (val as any).target.value : val)
  }, [])

  // Provide the full FieldType<unknown> shape that useField() returns.
  // Components using useField() will get this directly via FieldContext,
  // bypassing useFieldInForm and its provider requirements.
  const fieldContextValue = useMemo(
    () => ({
      blocksFilterOptions: undefined,
      customComponents: undefined,
      disabled: false,
      errorMessage: undefined,
      errorPaths: [] as string[],
      filterOptions: undefined,
      formInitializing: false,
      formProcessing: false,
      formSubmitted: false,
      initialValue: initialValue ?? '',
      path,
      rows: undefined,
      selectFilterOptions: undefined,
      setValue: setFieldValue,
      showError: false,
      valid: true,
      value,
    }),
    [initialValue, path, setFieldValue, value],
  )

  // Build onChange handler for presentational Input components
  const onChange = useCallback(
    (e: unknown) => {
      setFieldValue(e)
    },
    [setFieldValue],
  )

  const fieldContent = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <FieldContext.Provider value={fieldContextValue as any}>
      <div className="render-fields">
        <Component
          path={path}
          field={fieldConfig}
          value={value}
          onChange={onChange}
          label={fieldConfig.label}
          {...componentProps}
        />
      </div>
    </FieldContext.Provider>
  )

  if (insideShell) {
    return fieldContent
  }

  return (
    <PayloadUIShell theme={theme} gutter={true}>
      {fieldContent}
    </PayloadUIShell>
  )
}
