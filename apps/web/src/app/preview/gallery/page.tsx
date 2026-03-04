'use client'

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  PayloadUIShell,
  ThemeToggle,
  ErrorBoundary,
} from '@payloadtwist/ui-sandbox'
import type { ShellTheme } from '@payloadtwist/ui-sandbox'
import {
  TextInput,
  TextareaInput,
  SelectInput,
  CheckboxInput,
  Button,
  Pill,
  Banner,
} from '@payloadcms/ui'

function SectionHeader({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--theme-elevation-500)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--theme-elevation-100)',
        marginBottom: '1rem',
      }}
    >
      {title}
    </h2>
  )
}

export default function GalleryPage() {
  const [theme, setTheme] = useState<ShellTheme>('light')

  // Field states
  const [text, setText] = useState('Sample text')
  const [textarea, setTextarea] = useState('Multi-line content goes here.\nThis is a second line.')
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('')
  const [select, setSelect] = useState<string | string[] | undefined>('option-1')
  const [multiSelect, setMultiSelect] = useState<string | string[] | undefined>(['option-1', 'option-3'])
  const [checkbox1, setCheckbox1] = useState(true)
  const [checkbox2, setCheckbox2] = useState(false)

  return (
    <PayloadUIShell theme={theme} gutter={true}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '2rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
          background: 'var(--theme-bg)',
          color: 'var(--theme-text)',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Component Gallery</h1>
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>

        {/* ── Banners ── */}
        <section>
          <SectionHeader title="Banners" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ErrorBoundary name="Banner (success)">
              <Banner type="success">This is a success banner</Banner>
            </ErrorBoundary>
            <ErrorBoundary name="Banner (warning)">
              <Banner type="warning">This is a warning banner</Banner>
            </ErrorBoundary>
            <ErrorBoundary name="Banner (error)">
              <Banner type="error">This is an error banner</Banner>
            </ErrorBoundary>
          </div>
        </section>

        {/* ── Buttons ── */}
        <section>
          <SectionHeader title="Buttons" />
          <ErrorBoundary name="Buttons">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button>Primary</Button>
              <Button buttonStyle="secondary">Secondary</Button>
              <Button size="small">Small</Button>
              <Button buttonStyle="secondary" size="small">Small Secondary</Button>
              <Button disabled>Disabled</Button>
            </div>
          </ErrorBoundary>
        </section>

        {/* ── Pills ── */}
        <section>
          <SectionHeader title="Pills & Status" />
          <ErrorBoundary name="Pills">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Pill>Default</Pill>
              <Pill pillStyle="light">Light</Pill>
              <Pill pillStyle="dark">Dark</Pill>
              <Pill pillStyle="success">Success</Pill>
              <Pill pillStyle="warning">Warning</Pill>
              <Pill pillStyle="error">Error</Pill>
            </div>
          </ErrorBoundary>
        </section>

        {/* ── Text Fields ── */}
        <section>
          <SectionHeader title="Text Fields" />
          <div className="render-fields" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ErrorBoundary name="TextInput">
              <TextInput
                path="text"
                label="Text Input"
                placeholder="Enter text..."
                required
                value={text}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
              />
            </ErrorBoundary>

            <ErrorBoundary name="TextInput (email)">
              <TextInput
                path="email"
                label="Email"
                placeholder="user@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </ErrorBoundary>

            <ErrorBoundary name="TextInput (password)">
              <TextInput
                path="password"
                label="Password"
                placeholder="Enter password..."
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </ErrorBoundary>

            <ErrorBoundary name="TextareaInput">
              <TextareaInput
                path="textarea"
                label="Textarea"
                placeholder="Write something..."
                rows={4}
                value={textarea}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTextarea(e.target.value)}
              />
            </ErrorBoundary>
          </div>
        </section>

        {/* ── Selection Fields ── */}
        <section>
          <SectionHeader title="Selection Fields" />
          <div className="render-fields" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ErrorBoundary name="SelectInput (single)">
              <SelectInput
                path="select"
                name="select"
                label="Single Select"
                options={[
                  { label: 'Option 1', value: 'option-1' },
                  { label: 'Option 2', value: 'option-2' },
                  { label: 'Option 3', value: 'option-3' },
                ]}
                value={select}
                onChange={(val) => setSelect(val?.value)}
                isClearable
              />
            </ErrorBoundary>

            <ErrorBoundary name="SelectInput (multi)">
              <SelectInput
                path="multiSelect"
                name="multiSelect"
                label="Multi Select"
                hasMany
                options={[
                  { label: 'Option 1', value: 'option-1' },
                  { label: 'Option 2', value: 'option-2' },
                  { label: 'Option 3', value: 'option-3' },
                  { label: 'Option 4', value: 'option-4' },
                ]}
                value={multiSelect}
                onChange={(val) => {
                  if (Array.isArray(val)) {
                    setMultiSelect(val.map((o: Record<string, unknown>) => String(o.value)))
                  } else if (val && typeof val === 'object' && 'value' in val) {
                    setMultiSelect([String(val.value)])
                  } else {
                    setMultiSelect(undefined)
                  }
                }}
              />
            </ErrorBoundary>

            <ErrorBoundary name="CheckboxInput (checked)">
              <CheckboxInput
                name="checkbox1"
                label="Enabled Feature"
                checked={checkbox1}
                onToggle={() => setCheckbox1((prev) => !prev)}
              />
            </ErrorBoundary>

            <ErrorBoundary name="CheckboxInput (unchecked)">
              <CheckboxInput
                name="checkbox2"
                label="Another Option"
                checked={checkbox2}
                onToggle={() => setCheckbox2((prev) => !prev)}
              />
            </ErrorBoundary>
          </div>
        </section>

        {/* ── Elevation Preview ── */}
        <section>
          <SectionHeader title="Elevation & Theme Colors" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map((level) => (
              <div
                key={level}
                style={{
                  background: `var(--theme-elevation-${level})`,
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: 'var(--style-radius-s, 4px)',
                  padding: '1rem 0.5rem',
                  textAlign: 'center',
                  fontSize: '11px',
                  color: level > 250 ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-900)',
                }}
              >
                {level}
              </div>
            ))}
          </div>
        </section>

        {/* ── Color Swatches ── */}
        <section>
          <SectionHeader title="Status Colors" />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['success', 'warning', 'error'].map((status) =>
              [100, 200, 300, 400, 500].map((level) => (
                <div
                  key={`${status}-${level}`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--style-radius-s, 4px)',
                    background: `var(--color-${status}-${level})`,
                    border: '1px solid var(--theme-elevation-150)',
                  }}
                  title={`--color-${status}-${level}`}
                />
              )),
            )}
          </div>
        </section>
      </div>
    </PayloadUIShell>
  )
}
