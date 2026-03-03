'use client'

import { useState } from 'react'
import { AdminPreview, FieldPreview, ErrorBoundary } from '@payloadtwist/ui-sandbox'
import type { ShellTheme } from '@payloadtwist/ui-sandbox'
import '@payloadtwist/ui-sandbox/css'

import { TextInput } from '@payloadcms/ui'
import { SelectInput } from '@payloadcms/ui'
import { TextareaInput } from '@payloadcms/ui'
import { CheckboxInput } from '@payloadcms/ui'

export default function SandboxPage() {
  const [theme, setTheme] = useState<ShellTheme>('light')

  return (
    <AdminPreview
      theme={theme}
      onThemeChange={setTheme}
      collectionName="Posts"
      navGroups={[
        {
          label: 'Collections',
          items: [
            { label: 'Posts', slug: 'posts', active: true },
            { label: 'Users', slug: 'users' },
            { label: 'Media', slug: 'media' },
          ],
        },
        {
          label: 'Globals',
          items: [
            { label: 'Site Settings', slug: 'site-settings' },
          ],
        },
      ]}
    >
      <ErrorBoundary name="TextInput">
        <FieldPreview
          component={TextInput}
          fieldConfig={{
            name: 'title',
            label: 'Title',
            type: 'text',
            required: true,
            admin: { placeholder: 'Enter a title...' },
          }}
          initialValue="Hello Sandbox"
          theme={theme}
          componentProps={{
            placeholder: 'Enter a title...',
            required: true,
          }}
        />
      </ErrorBoundary>

      <ErrorBoundary name="TextareaInput">
        <FieldPreview
          component={TextareaInput}
          fieldConfig={{
            name: 'description',
            label: 'Description',
            type: 'textarea',
            admin: { placeholder: 'Write a description...' },
          }}
          theme={theme}
          componentProps={{
            placeholder: 'Write a description...',
            rows: 4,
          }}
        />
      </ErrorBoundary>

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
          componentProps={{
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

      <ErrorBoundary name="CheckboxInput">
        <FieldPreview
          component={CheckboxInput}
          fieldConfig={{
            name: 'featured',
            label: 'Featured',
            type: 'checkbox',
          }}
          theme={theme}
          componentProps={{
            onToggle: () => {},
          }}
        />
      </ErrorBoundary>
    </AdminPreview>
  )
}
