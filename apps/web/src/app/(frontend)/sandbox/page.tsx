'use client'

import { useState } from 'react'
import {
  PayloadUIShell,
  FieldPreview,
  ThemeToggle,
  ErrorBoundary,
} from '@payloadtwist/ui-sandbox'
import type { ShellTheme } from '@payloadtwist/ui-sandbox'
import '@payloadtwist/ui-sandbox/css'

// Payload field Input components — these are the "pure" presentational inputs.
// They accept direct props (path, label, value, onChange, etc.) rather than
// needing the full Payload field client config object.
import { TextInput } from '@payloadcms/ui'
import { SelectInput } from '@payloadcms/ui'
import { TextareaInput } from '@payloadcms/ui'
import { CheckboxInput } from '@payloadcms/ui'

export default function SandboxPage() {
  const [theme, setTheme] = useState<ShellTheme>('light')

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          UI Sandbox — Component Preview
        </h1>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* --- TextInput via FieldPreview --- */}
        <ErrorBoundary name="TextInput (via FieldPreview)">
          <FieldPreview
            component={TextInput}
            fieldConfig={{
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'Enter a title...',
              },
            }}
            initialValue="Hello Sandbox"
            theme={theme}
            componentProps={{
              label: 'Title',
              placeholder: 'Enter a title...',
              required: true,
            }}
          />
        </ErrorBoundary>

        {/* --- TextareaInput via FieldPreview --- */}
        <ErrorBoundary name="TextareaInput (via FieldPreview)">
          <FieldPreview
            component={TextareaInput}
            fieldConfig={{
              name: 'description',
              label: 'Description',
              type: 'textarea',
              admin: {
                placeholder: 'Write a description...',
              },
            }}
            initialValue="A multi-line text area rendered via Payload UI."
            theme={theme}
            componentProps={{
              label: 'Description',
              placeholder: 'Write a description...',
              rows: 4,
            }}
          />
        </ErrorBoundary>

        {/* --- SelectInput via FieldPreview --- */}
        <ErrorBoundary name="SelectInput (via FieldPreview)">
          <FieldPreview
            component={SelectInput}
            fieldConfig={{
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ],
            }}
            initialValue="draft"
            theme={theme}
            componentProps={{
              label: 'Status',
              name: 'status',
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ],
              isClearable: true,
            }}
          />
        </ErrorBoundary>

        {/* --- CheckboxInput via FieldPreview --- */}
        <ErrorBoundary name="CheckboxInput (via FieldPreview)">
          <FieldPreview
            component={CheckboxInput}
            fieldConfig={{
              name: 'featured',
              label: 'Featured',
              type: 'checkbox',
            }}
            theme={theme}
            componentProps={{
              label: 'Mark as Featured',
              name: 'featured',
              onToggle: () => {
                /* handled by form state */
              },
            }}
          />
        </ErrorBoundary>

        {/* --- PayloadUIShell standalone --- */}
        <ErrorBoundary name="PayloadUIShell (standalone)">
          <PayloadUIShell theme={theme} gutter>
            <div style={{ padding: '1rem' }}>
              <p>
                Raw content inside PayloadUIShell. Payload CSS variables are
                active here. This demonstrates that the provider stack
                (ConfigProvider, TranslationProvider, ThemeProvider, etc.) is
                working correctly without any field component rendering.
              </p>
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'var(--theme-elevation-50)',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: 'var(--style-radius-s, 4px)',
                  color: 'var(--theme-text)',
                }}
              >
                This box uses Payload CSS variables for background, border, and
                text color.
              </div>
            </div>
          </PayloadUIShell>
        </ErrorBoundary>
      </div>
    </div>
  )
}
