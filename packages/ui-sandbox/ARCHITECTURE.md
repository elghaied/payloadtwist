# Architecture

## Provider Tree

The shell sets up exactly 7 providers, nested in this order:

```
ShellThemeContext.Provider     <- custom, for external theme control
  +-- ConfigProvider            <- @payloadcms/ui -- app config (routes, collections, etc.)
      +-- TranslationProvider   <- @payloadcms/ui -- i18n (English translations from @payloadcms/translations)
          +-- ThemeProvider      <- @payloadcms/ui -- CSS theme (light/dark, syncs data-theme on <html>)
              +-- RouteTransitionProvider  <- @payloadcms/ui -- route transition context
                  +-- ServerFunctionsProvider  <- @payloadcms/ui -- handles form-state server calls (mocked)
                      +-- UploadHandlersProvider  <- @payloadcms/ui -- file upload context
                          +-- OperationProvider  <- @payloadcms/ui -- create/update mode for forms
```

### Why each provider is needed

| Provider | Required By | What Happens Without It |
|----------|------------|------------------------|
| ConfigProvider | ThemeProvider, TranslationProvider, most hooks | Crash: `useConfig` returns undefined |
| TranslationProvider | All labels, buttons, field descriptions | Crash: `useTranslation` returns undefined |
| ThemeProvider | CSS variable switching, dark mode | Crash: requires ConfigProvider parent |
| RouteTransitionProvider | ServerFunctionsProvider | Crash: missing context |
| ServerFunctionsProvider | Form component (fetches form-state) | Crash: Form can't initialize |
| UploadHandlersProvider | Form submission | Crash: missing upload context |
| OperationProvider | Form, field components | Crash: `useOperation` returns undefined |

### Deliberately omitted: AuthProvider

AuthProvider makes real API calls (`/api/users/me`) on mount. Without a running Payload server, this causes errors. The only side effect of omitting it is a non-fatal console error ~15 seconds after mount when Form's `refreshCookie()` fires.

## CSS

### What consumers must import

```tsx
import '@payloadcms/ui/css'  // 248KB compiled stylesheet -- all component styles
```

This single import provides:
- All component styles (Button, TextField, SelectField, etc.)
- CSS custom properties (`--theme-text`, `--theme-elevation-*`, etc.)
- `@layer payload-default` declarations
- Dark mode styles via `html[data-theme='dark']`

Optionally, for SCSS variable access:
```scss
@import '@payloadcms/ui/scss/app.scss';
```

### HTML structure requirements

The shell sets `data-theme="light"` (or `"dark"`) on `<html>`. Payload's CSS selectors rely on this attribute for theme switching.

Key CSS classes used:
- `.gutter--left`, `.gutter--right` -- horizontal padding
- `.render-fields` -- sets `--spacing-field` for proper field spacing
- `.field-type` -- wrapper for individual fields

## Adding Support for New Component Types

To support a new category of Payload component:

1. Check what providers it needs (read the component source or test empirically)
2. If it needs a provider not in the current tree, add it to `PayloadUIShell`
3. Create a new Preview wrapper (like `FieldPreview` or `ViewPreview`) if the component needs special context (e.g., Form wrapper for fields)
4. Export the new wrapper from `index.ts`
5. Update types.ts with the new props interface
