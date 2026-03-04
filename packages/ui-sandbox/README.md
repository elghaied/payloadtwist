# @payloadtwist/ui-sandbox

Render Payload CMS UI components outside the admin panel. This package provides a lightweight shell that sets up the minimal provider context needed for `@payloadcms/ui` components to render correctly — no Payload server, database, or config file required.

## Install

```bash
pnpm add @payloadtwist/ui-sandbox @payloadcms/ui @payloadcms/translations
```

## CSS Setup

Your app must import Payload's CSS. In a Next.js layout:

```tsx
// app/layout.tsx
import '@payloadcms/ui/css'
```

## Usage

### Basic Shell

Wrap any Payload UI components in `PayloadUIShell`:

```tsx
import { PayloadUIShell } from '@payloadtwist/ui-sandbox'
import { Button } from '@payloadcms/ui'

export function MyPage() {
  return (
    <PayloadUIShell theme="light">
      <Button>I look like a real Payload button</Button>
    </PayloadUIShell>
  )
}
```

### Field Preview

Preview a custom field component with full form state:

```tsx
import { FieldPreview } from '@payloadtwist/ui-sandbox'
import { MyColorField } from './MyColorField'

export function FieldDemo() {
  return (
    <FieldPreview
      component={MyColorField}
      fieldConfig={{
        name: 'color',
        label: 'Brand Color',
        type: 'text',
        admin: { description: 'Pick your brand color' },
      }}
      initialValue="#3498db"
      theme="light"
    />
  )
}
```

### View Preview

Preview a custom view/widget component:

```tsx
import { ViewPreview } from '@payloadtwist/ui-sandbox'
import { MyDashboardWidget } from './MyDashboardWidget'

export function WidgetDemo() {
  return (
    <ViewPreview
      component={MyDashboardWidget}
      viewType="dashboard"
      theme="dark"
    />
  )
}
```

### Theme Control

Use `useShellTheme()` inside the shell for interactive theme switching:

```tsx
import { PayloadUIShell, useShellTheme } from '@payloadtwist/ui-sandbox'

function ThemeButton() {
  const { theme, toggleTheme } = useShellTheme()
  return <button onClick={toggleTheme}>{theme}</button>
}

export function App() {
  return (
    <PayloadUIShell>
      <ThemeButton />
    </PayloadUIShell>
  )
}
```

### Mock Utilities

Build form state and field configs for testing:

```tsx
import { buildFormState, buildMultiFieldState, buildFieldConfig } from '@payloadtwist/ui-sandbox'

// Single field
const state = buildFormState('title', 'Hello World')

// Multiple fields
const multiState = buildMultiFieldState({
  title: 'My Doc',
  category: 'blog',
  published: true,
})

// Field config
const field = buildFieldConfig({ name: 'title', label: 'Title', type: 'text' })
```

## Component Tiers

| Tier | Examples | What You Need |
|------|----------|---------------|
| Inputs | TextInput, SelectInput, CheckboxInput | TranslationProvider only (or none) |
| Fields | TextField, SelectField, CheckboxField | PayloadUIShell + Form wrapper |
| Full Form | Form + validation + submission | PayloadUIShell |

## Peer Dependencies

- `@payloadcms/ui` >= 3.0.0
- `@payloadcms/translations` >= 3.0.0
- `react` >= 19.0.0
- `react-dom` >= 19.0.0

## Known Limitations

- **refreshCookie error**: ~15s after mount, Form's internal `refreshCookie()` call produces a non-fatal console error (AuthProvider is deliberately omitted to prevent API calls)
- **SSR**: Components use browser APIs (`document.cookie`, `document.documentElement`). In Next.js, load with `next/dynamic` + `ssr: false`
- **No real auth**: Auth context is mocked. Components that make API calls won't work.
