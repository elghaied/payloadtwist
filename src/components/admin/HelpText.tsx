'use client'

export default function HelpText() {
  return (
    <div style={{ padding: '12px 16px', background: 'var(--theme-elevation-50)', borderRadius: '4px', fontSize: '14px', lineHeight: '1.5' }}>
      <strong>Advanced Settings</strong>
      <p style={{ margin: '8px 0 0' }}>
        These fields are optional. Use specifications for structured product data,
        location for warehouse coordinates, and embed code for custom HTML widgets.
      </p>
    </div>
  )
}
