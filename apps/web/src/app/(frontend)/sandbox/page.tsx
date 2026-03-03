'use client'

import { useState, type ChangeEvent } from 'react'
import {
  PayloadUIShell,
  ThemeToggle,
  ErrorBoundary,
} from '@payloadtwist/ui-sandbox'
import type { ShellTheme } from '@payloadtwist/ui-sandbox'
import '@payloadtwist/ui-sandbox/css'

import { TextInput } from '@payloadcms/ui'
import { SelectInput } from '@payloadcms/ui'
import { TextareaInput } from '@payloadcms/ui'
import { CheckboxInput } from '@payloadcms/ui'

export default function SandboxPage() {
  const [theme, setTheme] = useState<ShellTheme>('light')
  const [title, setTitle] = useState('Hello Sandbox')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<string | string[] | undefined>('draft')
  const [featured, setFeatured] = useState(false)

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

      <PayloadUIShell theme={theme}>
        <div className="render-fields" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ErrorBoundary name="TextInput">
            <TextInput
              path="title"
              label="Title"
              placeholder="Enter a title..."
              required
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
          </ErrorBoundary>

          <ErrorBoundary name="TextareaInput">
            <TextareaInput
              path="description"
              label="Description"
              placeholder="Write a description..."
              rows={4}
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            />
          </ErrorBoundary>

          <ErrorBoundary name="SelectInput">
            <SelectInput
              path="status"
              name="status"
              label="Status"
              options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ]}
              value={status}
              onChange={(val) => setStatus(val?.value)}
              isClearable
            />
          </ErrorBoundary>

          <ErrorBoundary name="CheckboxInput">
            <CheckboxInput
              name="featured"
              label="Mark as Featured"
              checked={featured}
              onToggle={() => setFeatured((prev) => !prev)}
            />
          </ErrorBoundary>

          <ErrorBoundary name="PayloadUIShell (CSS variables)">
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
          </ErrorBoundary>
        </div>
      </PayloadUIShell>
    </div>
  )
}
