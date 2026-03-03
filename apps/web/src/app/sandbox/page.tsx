'use client'

import { useState } from 'react'
import {
  FieldPreview,
  ThemeToggle,
  ErrorBoundary,
  PayloadUIShell,
} from '@payloadtwist/ui-sandbox'
import type { ShellTheme } from '@payloadtwist/ui-sandbox'

import { TextInput } from '@payloadcms/ui'
import { SelectInput } from '@payloadcms/ui'
import { TextareaInput } from '@payloadcms/ui'
import { CheckboxInput } from '@payloadcms/ui'

export default function SandboxPage() {
  const [theme, setTheme] = useState<ShellTheme>('light')

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
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
        {/* TextInput — FieldPreview handles value/onChange automatically */}
        <ErrorBoundary name="TextInput">
          <FieldPreview
            component={TextInput}
            fieldConfig={{
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            }}
            initialValue="Hello Sandbox"
            theme={theme}
            componentProps={{ placeholder: 'Enter a title...', required: true }}
          />
        </ErrorBoundary>

        {/* TextareaInput — same pattern as TextInput */}
        <ErrorBoundary name="TextareaInput">
          <FieldPreview
            component={TextareaInput}
            fieldConfig={{
              name: 'description',
              label: 'Description',
              type: 'textarea',
            }}
            theme={theme}
            componentProps={{ placeholder: 'Write a description...', rows: 4 }}
          />
        </ErrorBoundary>

        {/* SelectInput — options in fieldConfig, FieldPreview handles Option→string */}
        <ErrorBoundary name="SelectInput">
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
            componentProps={{ isClearable: true }}
          />
        </ErrorBoundary>

        {/* CheckboxInput — FieldPreview handles checked/onToggle automatically */}
        <ErrorBoundary name="CheckboxInput">
          <FieldPreview
            component={CheckboxInput}
            fieldConfig={{
              name: 'featured',
              label: 'Featured',
              type: 'checkbox',
            }}
            initialValue={false}
            theme={theme}
          />
        </ErrorBoundary>

        {/* PayloadUIShell standalone — Payload CSS variables demo */}
        <ErrorBoundary name="PayloadUIShell (CSS variables)">
          <PayloadUIShell theme={theme} gutter>
            <div
              style={{
                padding: '1rem',
                background: 'var(--theme-elevation-50)',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 'var(--style-radius-s, 4px)',
                color: 'var(--theme-text)',
              }}
            >
              This box uses Payload CSS variables for background, border, and
              text color. The provider stack is working correctly.
            </div>
          </PayloadUIShell>
        </ErrorBoundary>
      </div>
    </div>
  )
}
