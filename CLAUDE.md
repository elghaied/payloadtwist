# CLAUDE.md — payloadtwist

## What this project is

A visual CSS theme editor for the Payload CMS admin panel.
The user tweaks CSS variables and component styles in the editor UI.
The Payload admin dashboard (running at /admin in the same Next.js app)
reflects changes in real time via iframe CSS injection.
Output is a custom.scss snippet the user copies into their Payload project.

## Project structure (Turborepo monorepo)
```
payloadtwist/                        ← Workspace root
├── apps/
│   └── web/                         ← Main Next.js + Payload app
│       ├── src/
│       │   ├── app/
│       │   │   ├── (frontend)/      ← Editor/landing/auth UI
│       │   │   │   ├── page.tsx     ← Landing page
│       │   │   │   ├── layout.tsx   ← Frontend layout
│       │   │   │   ├── globals.css  ← Editor chrome styles
│       │   │   │   ├── editor/      ← Main editor UI (the product)
│       │   │   │   ├── dashboard/   ← User dashboard (preset management)
│       │   │   │   ├── presets/     ← Browse/view presets
│       │   │   │   ├── login/       ← Better Auth login
│       │   │   │   └── register/    ← Better Auth registration
│       │   │   ├── preview/         ← Sandbox preview routes (iframe targets)
│       │   │   │   ├── layout.tsx   ← Loads @payloadcms/ui/css
│       │   │   │   ├── admin/       ← Full admin panel mock
│       │   │   │   └── gallery/     ← Component gallery
│       │   │   └── (payload)/       ← Payload CMS — DO NOT TOUCH
│       │   │       ├── admin/       ← Admin panel at /admin
│       │   │       ├── cms-api/     ← Payload API routes (at /cms-api)
│       │   │       └── custom.scss  ← Payload's CSS entry point
│       │   ├── components/          ← All UI components
│       │   │   ├── editor/          ← Editor UI components
│       │   │   └── ui/              ← Shared UI (radix, resizable)
│       │   ├── lib/                 ← Auth, actions, utils
│       │   ├── payload-theme/       ← ALL theming logic — source of truth
│       │   ├── store/               ← Zustand store
│       │   ├── collections/         ← Payload collections
│       │   ├── seed/                ← Seed data for Payload
│       │   └── payload.config.ts    ← Payload configuration
│       ├── tests/                   ← Integration + e2e tests
│       ├── drizzle/                 ← Auth DB migrations
│       ├── public/
│       ├── next.config.mjs
│       ├── package.json             ← @payloadtwist/web
│       └── tsconfig.json
├── packages/
│   └── ui-sandbox/                  ← Payload UI component sandbox
│       ├── src/
│       │   ├── PayloadUIShell.tsx   ← 7-provider wrapper for Payload UI
│       │   ├── FieldPreview.tsx     ← Field component preview (FieldContext)
│       │   ├── ViewPreview.tsx      ← View component preview
│       │   ├── ThemeToggle.tsx      ← Light/dark toggle button
│       │   ├── ErrorBoundary.tsx    ← Render error catcher
│       │   ├── mock/               ← Mock configs for providers
│       │   └── styles/             ← Sandbox-specific CSS
│       ├── package.json             ← @payloadtwist/ui-sandbox
│       └── tsconfig.json
├── turbo.json                       ← Turborepo task config
├── pnpm-workspace.yaml              ← Workspace definition
├── package.json                     ← Root workspace (payloadtwist-monorepo)
├── docker-compose.yml
├── .prettierrc.json
├── .npmrc
└── CLAUDE.md
```

## Dev commands
```bash
# Workspace-level (from repo root)
pnpm dev                                    # Start all packages (turbo)
pnpm build                                  # Build all packages (turbo)
pnpm lint                                   # Lint all packages (turbo)
pnpm typecheck                              # Typecheck all packages (turbo)

# App-specific (filter to web app)
pnpm --filter @payloadtwist/web dev         # Start only the web app
pnpm --filter @payloadtwist/web build       # Build only the web app
pnpm --filter @payloadtwist/web seed        # Seed Payload with sample data
pnpm --filter @payloadtwist/web devsafe     # rm -rf .next && dev (clears cache)
pnpm --filter @payloadtwist/web extract-payload-theme  # Regen schema
```

## Authentication

Uses Better Auth (not Payload's built-in auth) for user accounts:
- `apps/web/src/lib/auth.ts` — server-side config (drizzle adapter, PostgreSQL)
- `apps/web/src/lib/auth-client.ts` — client-side auth hooks
- `apps/web/src/middleware.ts` — route protection
- `apps/web/src/lib/actions/presets.ts` — server actions for preset CRUD

## Databases

Two databases — Payload and auth are separate:
- **Payload CMS**: SQLite via `@payloadcms/db-sqlite` (`file:./data/payloadtwist.db`)
- **Better Auth**: PostgreSQL via drizzle-orm (`AUTH_DATABASE_URL`)

## Infrastructure

- Turborepo monorepo with pnpm workspaces
- `apps/web/Dockerfile` — uses `turbo prune` for efficient Docker builds, standalone Next.js output
- `docker-compose.yml` — app + postgres (auth DB), SQLite volume for Payload
- `apps/web/next.config.mjs` — `output: 'standalone'`, `serverExternalPackages: ['libsql']`, wrapped by `withPayload()`
- libsql native binaries require special handling: `pnpm.onlyBuiltDependencies` at workspace root
- `.env` files live in `apps/web/` (Next.js loads from app working directory)

## Payload CSS variable system — READ THIS FIRST

Payload has THREE layers of CSS variables. This distinction is critical.

### Layer 1 — Raw color palette (what users override)
```css
--color-base-0 through --color-base-1000   (white → black, 16 steps)
--color-success-100 through --color-success-500
--color-warning-100 through --color-warning-500
--color-error-100 through --color-error-500
```
Changing these rethemes everything. This is the primary theming lever.

### Layer 2 — Elevation aliases (DO NOT expose in editor)
```css
--theme-elevation-0: var(--color-base-0)
--theme-elevation-50: var(--color-base-50)
...
```
Payload AUTO-INVERTS these in dark mode. Marked `overridable: false`.
Never override these directly — it breaks dark mode inversion.

### Layer 3 — Semantic theme vars (expose with light + dark pickers)
```css
--theme-bg, --theme-text, --theme-input-bg, --theme-overlay
```
Only vars that need explicit `[data-theme="dark"]` overrides.

## Dark mode — critical details

- Payload uses `[data-theme="dark"]` on `<html>` — NOT `.dark`
- Elevation and status vars are AUTO-INVERTED by Payload in dark mode
- Only Layer 3 vars need explicit dark overrides in output CSS
- Store's `config.dark` only contains Layer 3 vars

## Live preview — how it works

### Sandbox Preview (default)

The editor uses sandbox routes rendered in a same-origin iframe:
```html
<iframe id="payload-preview" src="/preview/admin" />
```

Two preview modes:
- **Admin** (`/preview/admin`) — Full admin panel mock using `@payloadtwist/ui-sandbox`
  AdminPreview component with realistic fields (text, select, checkbox, etc.)
- **Gallery** (`/preview/gallery`) — Component gallery showing all field types,
  buttons, pills, banners, elevation swatches, and status colors

Preview routes load `@payloadcms/ui/css` for authentic Payload styling.
No real Payload CMS instance needed — all components are rendered via
mock providers from `@payloadtwist/ui-sandbox`.

### Custom Preview (user's own Payload)

Users can connect their own Payload CMS instance via the Custom tab.
Requires adding `live-preview.js` script to their Payload project.
Uses `CrossOriginBridge` + `postMessage` protocol for CSS injection.

### CSS Injection

Same mechanism for both modes. The store injects `<style>` tags into the
iframe's `<head>` on every state change:
- `id="tweakpayload-vars"` — CSS variables + BEM CSS
- `id="tweakpayload-components"` — Component override CSS (!important)

All injection goes through `injectIntoIframe()` in generator.ts.
NEVER inject into the parent document's `:root`.
Must also be called on iframe `load` event.

Dark mode toggle:
```ts
iframe.contentDocument?.documentElement
  .setAttribute('data-theme', isDark ? 'dark' : 'light')
```

## Schema — source of truth

`apps/web/src/payload-theme/payload-theme-schema.json` is generated by the
extraction script. NEVER hand-edit this file.

Regenerate after Payload UI version updates:
```bash
pnpm --filter @payloadtwist/web extract-payload-theme
```

Schema structure:
```json
{
  "meta": { "payloadUiVersion": "...", "extractedAt": "..." },
  "cssVariables": {
    "base-scale": [],    ← --color-base-* (primary user control)
    "theme": [],         ← --theme-bg/text/etc (explicit dark support)
    "status": { "success": [], "warning": [], "error": [] },
    "typography": [],
    "layout": [],
    "breakpoints": [],   ← overridable: false
    "other": []
  },
  "bemBlocks": { ... },
  "components": {
    "elements": { "Button": { bemBlock, styleUsages, bemStructure } },
    "fields": { "Array": { ... } },
    "views": { ... },
    "widgets": { ... }
  }
}
```

Each CSS variable has:
- `var` — CSS custom property name
- `value` — light mode default
- `darkValue` — dark default (Layer 3 vars only)
- `darkMode` — `"auto-inverted"` | `"explicit"` | `"none"`
- `overridable` — `false` = hide from editor UI
- `resolvedType` — `"color"` | `"size"` | `"font"` | `"number"` | `"other"`

## Store API
```typescript
const {
  config,               // PayloadThemeConfig { light, dark, componentOverrides, bemOverrides }
  setVariable,          // (varName, value, mode: 'light'|'dark') => void
  setBaseScale,         // (vars: Record<string, string>) => void — single undo step
  setBaseRadius,        // (m: number) => void — derives s and l automatically
  setComponentOverride, // (selector, property, value) => void
  setBemOverride,       // (blockName, css) => void
  resetTheme,
  importTheme,
  undo, redo, canUndo, canRedo
} = useEditorStore()
```

`config.light` / `config.dark` — flat maps of var name → value
`config.componentOverrides` — `"selector||property"` → value
`config.bemOverrides` — block name → raw CSS string

## CSS output format
```scss
/* Generated by payloadtwist */
/* Paste into your Payload project's custom.scss */

:root {
  /* Base Color Scale */
  --color-base-0: #f8f9fa;

  /* Status Colors */
  --color-success-500: #00c853;

  /* Typography */
  --font-body: 'DM Sans', sans-serif;

  /* Layout */
  --nav-width: 300px;
}

/* Dark mode — explicit overrides only */
/* Elevation and status colors are auto-inverted by Payload */
[data-theme="dark"] {
  --theme-bg: #0d0d0d;
  --theme-text: #f3f3f3;
}

/* Component Overrides */
.btn--style-primary {
  background-color: #1a1a2e;
}

/* BEM Raw CSS */
.collection-list {
  /* user written CSS */
}
```

Only variables that differ from Payload defaults are included.

## UI Sandbox package (`@payloadtwist/ui-sandbox`)

### What it is and why it exists

PayloadTwist generates AI-powered Payload CMS custom components. Users need
to see these components rendered with real Payload admin styling. The problem:
Payload UI components (`@payloadcms/ui`) require ~20 providers, specific HTML
structure, and CSS to render. Outside the admin panel, they crash.

`@payloadtwist/ui-sandbox` solves this by providing wrapper components that
recreate the minimal Payload admin environment.

### Core components

- **PayloadUIShell** — sets up 7 Payload providers: ConfigProvider,
  TranslationProvider, ThemeProvider, RouteTransitionProvider,
  ServerFunctionsProvider, UploadHandlersProvider, OperationProvider.
  AuthProvider is deliberately omitted (it makes API calls on mount).

- **FieldPreview** — THE PRIMARY WAY to render field components. Wraps a
  component in PayloadUIShell + `FieldContext.Provider` so that `useField()`
  works. Manages field state with `useState`. Also passes `value`/`onChange`
  as props for presentational Input components.

- **ViewPreview** — same concept for view-level components (dashboards, etc.)

- **ThemeToggle** — simple light/dark toggle using Payload CSS vars

- **ErrorBoundary** — catches render errors, shows green/red border

### How FieldPreview works (critical architecture)

FieldPreview does NOT use Payload's `Form` component. Form requires Auth,
Locale, and DocumentInfo providers that are impractical to mock. Instead:

1. Uses `FieldContext` (exported from `@payloadcms/ui`, marked @experimental)
2. `useField()` checks for FieldContext first — if found with matching path,
   it returns the context value directly, bypassing `useFieldInForm` and all
   its provider requirements
3. For presentational `*Input` components, FieldPreview builds type-specific
   props based on `fieldConfig.type`:
   - text/textarea: `value` (string) + `onChange` (DOM event handler)
   - select: `value` (string) + `onChange` (handles Option→string) + `options` + `name`
   - checkbox: `checked` (boolean) + `onToggle` (toggle handler)

### Rules for ui-sandbox maintenance

- **FieldPreview is the primary way to render field components — do NOT
  bypass it** by using raw Input components with manual `useState`. If
  FieldPreview breaks, fix the package — don't remove the wrapper.
- **Mock providers** in `packages/ui-sandbox/src/mock/` must stay compatible
  with the installed `@payloadcms/ui` version (currently 3.78.0).
- When sandbox rendering breaks, **fix the package** (mock data, providers,
  FieldPreview internals) — never by removing the package's wrapper components.
- The `/sandbox` test route (at `apps/web/src/app/sandbox/`) imports
  `@payloadcms/ui/css` in its own layout to isolate Payload styles.

### Consumer usage pattern
```tsx
import { FieldPreview, ErrorBoundary } from '@payloadtwist/ui-sandbox'
import { TextInput, SelectInput, CheckboxInput } from '@payloadcms/ui'

// Text fields — FieldPreview handles value/onChange
<FieldPreview
  component={TextInput}
  fieldConfig={{ name: 'title', label: 'Title', type: 'text' }}
  initialValue="Hello"
  componentProps={{ placeholder: 'Enter title...' }}
/>

// Select fields — options in fieldConfig, FieldPreview handles Option→string
<FieldPreview
  component={SelectInput}
  fieldConfig={{
    name: 'status', label: 'Status', type: 'select',
    options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
  }}
  initialValue="draft"
/>

// Checkbox fields — FieldPreview handles checked/onToggle automatically
<FieldPreview
  component={CheckboxInput}
  fieldConfig={{ name: 'featured', label: 'Featured', type: 'checkbox' }}
  initialValue={false}
/>
```

## What NOT to do

- Never hand-edit `payload-theme-schema.json`
- Never inject CSS into parent `:root` — only into the iframe
- Never use `.dark` selector — Payload uses `[data-theme="dark"]`
- Never override `--theme-elevation-*` — breaks dark mode inversion
- Never import Payload CSS into editor routes
- Never touch `apps/web/src/app/(payload)/` — Payload manages these
- Never change `id="payload-preview"` on the iframe
- Never bypass FieldPreview by using raw Input components with manual useState
- Never use Payload's Form component in ui-sandbox (it needs Auth/Locale/DocumentInfo providers)

## Current status

Working:
- Payload embedded at /admin with SQLite, auto-login
- Public landing page at /
- Better Auth login/register flows
- User dashboard with preset management
- Presets browsing with per-preset pages
- Extraction script with full schema:
  - base-scale (--color-base-* vars, overridable)
  - elevation (--theme-elevation-*, overridable: false, hidden)
  - 149 component SCSS files extracted (elements, fields, views, widgets)
- Zustand store with PayloadThemeConfig
- iframe injection with correct [data-theme="dark"] targeting
- Full editor UI at /editor:
  - Color scale generator with color wheel + lightness slider
  - Palette presets selector
  - Tabbed component editor (General, UI Elements, Fields, Views, Overlays, Dashboard)
  - Theme colors with light/dark pickers
  - Status color controls
  - Font picker with Google Fonts
  - Scrubber inputs for numeric values
  - Single roundness control deriving s/m/l radius
  - BEM legacy raw CSS editor
- Docker build with standalone output
- UI sandbox package (`@payloadtwist/ui-sandbox`) with FieldPreview, PayloadUIShell
- Sandbox test route at /sandbox exercising ui-sandbox components

Not started:
- Deployment to production