'use client'

import { useField, FieldLabel, FieldDescription } from '@payloadcms/ui'

/**
 * Custom color picker field for Payload CMS.
 *
 * Uses useField() for state — works in both the real admin panel (via Form)
 * and in the ui-sandbox (via FieldContext).
 *
 * Renders: color swatch (opens native picker) + hex text input.
 * Stores value as a hex string (e.g. "#3498db").
 */
export default function ColorPicker({
  path: pathFromProps,
  field,
}: {
  path: string
  field: { name: string; label?: string; admin?: { description?: string } }
}) {
  const { value, setValue, showError } = useField<string>({
    path: pathFromProps,
  })

  const color = value || '#000000'

  return (
    <div className="field-type" style={{ marginBottom: 'var(--spacing-field, 24px)' }}>
      <FieldLabel label={field?.label || field?.name} path={pathFromProps} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '6px',
        }}
      >
        {/* Color swatch — clicking opens native color picker */}
        <label
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--style-radius-s, 4px)',
            backgroundColor: color,
            border: '1px solid var(--theme-elevation-150, #ddd)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => setValue(e.target.value)}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
            }}
          />
        </label>

        {/* Hex text input */}
        <input
          type="text"
          value={color}
          onChange={(e) => {
            const v = e.target.value
            setValue(v.startsWith('#') ? v : `#${v}`)
          }}
          placeholder="#000000"
          maxLength={7}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '14px',
            fontFamily: 'monospace',
            borderRadius: 'var(--style-radius-s, 4px)',
            border: `1px solid ${showError ? 'var(--color-error-500, red)' : 'var(--theme-elevation-150, #ddd)'}`,
            background: 'var(--theme-input, transparent)',
            color: 'var(--theme-text, #333)',
            outline: 'none',
          }}
        />
      </div>

      {field?.admin?.description && (
        <FieldDescription description={field.admin.description} path={pathFromProps} />
      )}
    </div>
  )
}
