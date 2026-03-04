'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  AdminPreview,
  ErrorBoundary,
} from '@payloadtwist/ui-sandbox'
import type { ShellTheme, NavGroupConfig } from '@payloadtwist/ui-sandbox'
import {
  TextInput,
  TextareaInput,
  SelectInput,
  CheckboxInput,
  Button,
  Pill,
  Banner,
} from '@payloadcms/ui'

const NAV_GROUPS: NavGroupConfig[] = [
  {
    label: 'Collections',
    items: [
      { label: 'Posts', slug: 'posts', active: true },
      { label: 'Pages', slug: 'pages' },
      { label: 'Products', slug: 'products' },
      { label: 'Categories', slug: 'categories' },
      { label: 'Users', slug: 'users' },
      { label: 'Media', slug: 'media' },
    ],
  },
  {
    label: 'Globals',
    items: [
      { label: 'Site Settings', slug: 'site-settings' },
      { label: 'Navigation', slug: 'navigation' },
    ],
  },
]

export default function AdminMockPage() {
  const [theme, setTheme] = useState<ShellTheme>('light')

  // Field state
  const [title, setTitle] = useState('Getting Started with Payload CMS')
  const [slug, setSlug] = useState('getting-started-with-payload-cms')
  const [content, setContent] = useState(
    'Payload is a headless CMS and application framework built with TypeScript, designed to give developers a great experience while also providing a powerful admin panel for content editors.',
  )
  const [status, setStatus] = useState<string | string[] | undefined>('published')
  const [category, setCategory] = useState<string | string[] | undefined>('tutorials')
  const [featured, setFeatured] = useState(true)
  const [authorEmail, setAuthorEmail] = useState('admin@example.com')

  return (
    <AdminPreview
      theme={theme}
      collectionName="Posts"
      navGroups={NAV_GROUPS}
      onThemeChange={setTheme}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Status banner */}
        <ErrorBoundary name="Banner">
          <Banner type="success">
            This document has been published.
          </Banner>
        </ErrorBoundary>

        {/* Title field */}
        <ErrorBoundary name="TextInput (title)">
          <TextInput
            path="title"
            label="Title"
            required
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          />
        </ErrorBoundary>

        {/* Slug field */}
        <ErrorBoundary name="TextInput (slug)">
          <TextInput
            path="slug"
            label="Slug"
            value={slug}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
          />
        </ErrorBoundary>

        {/* Content textarea */}
        <ErrorBoundary name="TextareaInput">
          <TextareaInput
            path="content"
            label="Content"
            rows={6}
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          />
        </ErrorBoundary>

        {/* Status select */}
        <ErrorBoundary name="SelectInput (status)">
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
            onChange={(val) => setStatus(!val || Array.isArray(val) ? '' : String(val.value))}
          />
        </ErrorBoundary>

        {/* Category select */}
        <ErrorBoundary name="SelectInput (category)">
          <SelectInput
            path="category"
            name="category"
            label="Category"
            options={[
              { label: 'Tutorials', value: 'tutorials' },
              { label: 'News', value: 'news' },
              { label: 'Guides', value: 'guides' },
              { label: 'Case Studies', value: 'case-studies' },
            ]}
            value={category}
            onChange={(val) => setCategory(!val || Array.isArray(val) ? '' : String(val.value))}
            isClearable
          />
        </ErrorBoundary>

        {/* Featured checkbox */}
        <ErrorBoundary name="CheckboxInput">
          <CheckboxInput
            name="featured"
            label="Featured Post"
            checked={featured}
            onToggle={() => setFeatured((prev) => !prev)}
          />
        </ErrorBoundary>

        {/* Author email */}
        <ErrorBoundary name="TextInput (email)">
          <TextInput
            path="authorEmail"
            label="Author Email"
            value={authorEmail}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAuthorEmail(e.target.value)}
          />
        </ErrorBoundary>

        {/* Action buttons row */}
        <ErrorBoundary name="Buttons">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '0.5rem' }}>
            <Button>Save Draft</Button>
            <Button buttonStyle="secondary">Preview</Button>
            <Pill>Published</Pill>
          </div>
        </ErrorBoundary>
      </div>
    </AdminPreview>
  )
}
