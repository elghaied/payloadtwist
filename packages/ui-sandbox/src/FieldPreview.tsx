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
 * - Presentational *Input components receive type-appropriate props:
 *   - text/textarea: value (string) + onChange (DOM event handler)
 *   - select: value (string) + onChange (handles Option→string extraction) + options + name
 *   - checkbox: checked (boolean) + onToggle (toggle handler)
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
  const defaultValue = fieldConfig.type === 'checkbox' ? false : ''
  const [value, setValue] = useState<unknown>(initialValue ?? defaultValue)
  const path = fieldConfig.name

  // --- Stable change handlers (don't read `value`, so no stale closures) ---

  /** TextInput/TextareaInput: receives DOM ChangeEvent, extracts target.value */
  const handleTextChange = useCallback((e: unknown) => {
    if (
      e &&
      typeof e === 'object' &&
      typeof (e as Record<string, unknown>).preventDefault === 'function'
    ) {
      setValue((e as React.ChangeEvent<HTMLInputElement>).target.value)
    } else {
      setValue(e)
    }
  }, [])

  /** SelectInput: receives Option object { label, value }, extracts .value */
  const handleSelectChange = useCallback((option: unknown) => {
    if (Array.isArray(option)) {
      // hasMany: Option[] → string[]
      setValue(option.map((o: Record<string, unknown>) => o.value))
    } else if (option && typeof option === 'object' && 'value' in option) {
      // Single select: Option → string
      setValue((option as Record<string, unknown>).value)
    } else {
      // null (cleared) or primitive
      setValue(option)
    }
  }, [])

  /** CheckboxInput: toggles boolean. Uses functional update — never stale. */
  const handleCheckboxToggle = useCallback(() => {
    setValue((prev: unknown) => !prev)
  }, [])

  // --- FieldContext for components using useField() -----------------------

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
      initialValue: initialValue ?? defaultValue,
      path,
      rows: undefined,
      selectFilterOptions: undefined,
      setValue,
      showError: false,
      valid: true,
      value,
    }),
    [initialValue, defaultValue, path, value],
  )

  // --- Type-specific props for presentational *Input components -----------

  const typeProps = useMemo(() => {
    const type = fieldConfig.type

    if (type === 'checkbox') {
      return {
        name: fieldConfig.name,
        checked: Boolean(value),
        onToggle: handleCheckboxToggle,
        label: fieldConfig.label,
      }
    }

    if (type === 'select') {
      return {
        name: fieldConfig.name,
        value: value as string | string[],
        options: fieldConfig.options ?? [],
        onChange: handleSelectChange,
        label: fieldConfig.label,
      }
    }

    // Default: text, textarea, email, number, etc.
    return {
      value: (value ?? '') as string,
      onChange: handleTextChange,
      label: fieldConfig.label,
    }
  }, [fieldConfig, value, handleCheckboxToggle, handleSelectChange, handleTextChange])

  const inner = (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    <FieldContext.Provider value={fieldContextValue as any}>
      <div className="render-fields">
        <Component path={path} field={fieldConfig} {...typeProps} {...componentProps} />
      </div>
    </FieldContext.Provider>
  )

  if (insideShell) {
    return inner
  }

  return (
    <PayloadUIShell theme={theme} gutter={true}>
      {inner}
    </PayloadUIShell>
  )
}
