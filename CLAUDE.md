# CLAUDE.md — payloadtwist

## What this project is

A visual CSS theme editor for the Payload CMS admin panel.
The user tweaks CSS variables and component styles in the editor UI.
The Payload admin dashboard (running at /admin in the same Next.js app)
reflects changes in real time via iframe CSS injection.
Output is a custom.scss snippet the user copies into their Payload project.

## Project structure
```
src/
├── app/
│   ├── (frontend)/
│   │   ├── page.tsx             ← Landing page
│   │   ├── layout.tsx           ← Frontend layout
│   │   ├── globals.css          ← Editor chrome styles
│   │   ├── landing.css          ← Landing page styles
│   │   ├── editor/              ← Main editor UI (the product)
│   │   │   ├── page.tsx         ← Editor shell, tab state, layout
│   │   │   └── layout.tsx
│   │   ├── dashboard/           ← User dashboard (preset management)
│   │   ├── presets/             ← Browse/view presets
│   │   │   └── [id]/           ← Individual preset page
│   │   ├── login/              ← Better Auth login
│   │   └── register/           ← Better Auth registration
│   └── (payload)/               ← Payload CMS — DO NOT TOUCH
│       ├── admin/               ← Admin panel at /admin
│       ├── cms-api/             ← Payload API routes (at /cms-api)
│       └── custom.scss          ← Payload's CSS entry point
├── components/
│   ├── editor/                  ← All editor UI components
│   │   ├── ScaleEditor.tsx      ← Color scale generator
│   │   ├── ScaleWheel.tsx       ← Visual color wheel
│   │   ├── LightnessSlider.tsx  ← Lightness control
│   │   ├── PaletteSelector.tsx  ← Palette presets
│   │   ├── BemSection.tsx       ← Legacy raw CSS editor
│   │   ├── FontPicker.tsx       ← Font dropdown with live preview
│   │   ├── IframePanel.tsx      ← Right panel with /admin iframe
│   │   ├── LayoutSection.tsx    ← Spacing, radius, z-index controls
│   │   ├── ScrubberInput.tsx    ← Click-drag numeric input
│   │   ├── StatusColorsSection.tsx
│   │   ├── ThemeColorsSection.tsx
│   │   ├── TypographySection.tsx
│   │   └── tabs/               ← Tab panels for component editor
│   │       ├── GeneralTab.tsx
│   │       ├── UIElementsTab.tsx
│   │       ├── FieldsTab.tsx
│   │       ├── ViewsTab.tsx
│   │       ├── OverlaysTab.tsx
│   │       ├── DashboardTab.tsx
│   │       └── ComponentControlsSection.tsx
│   └── ui/
│       ├── popover.tsx          ← Radix popover
│       └── resizable.tsx        ← Resizable panels
├── lib/
│   ├── auth.ts                  ← Better Auth server config (drizzle + PostgreSQL)
│   ├── auth-client.ts           ← Client-side auth hooks
│   ├── actions/presets.ts       ← Server actions for preset CRUD
│   ├── validate-redirect.ts     ← Redirect URL validation
│   └── utils.ts
├── middleware.ts                ← Route protection (auth)
├── payload-theme/               ← ALL theming logic — source of truth
│   ├── payload-theme-schema.json  ← BUILD ARTIFACT — never hand-edit
│   ├── payload-theme-schema.md    ← Human-readable reference
│   ├── types.ts                 ← TypeScript interfaces
│   ├── config.ts                ← Schema loader, getDefaultTheme(),
│   │                               getVariablesByCategory()
│   ├── generator.ts             ← CSS output + injectIntoIframe()
│   ├── scale-generator.ts       ← HSL interpolation for base scale
│   └── component-controls.ts   ← Visual region map, control descriptors
├── store/
│   └── editor-store.ts          ← Zustand store (PayloadThemeConfig)
├── scripts/
│   └── extract-payload-theme.ts ← Run: pnpm extract-payload-theme
├── collections/                 ← Payload collections
│   ├── Categories.ts
│   ├── Media.ts
│   ├── Pages.ts
│   ├── Posts.ts
│   ├── Products.ts
│   ├── TeamMembers.ts
│   └── Users.ts
├── seed/                        ← Seed data for Payload
└── payload.config.ts            ← Payload configuration
```

## Dev commands
```bash
pnpm dev                      # Start dev server
pnpm extract-payload-theme    # Regenerate schema from @payloadcms/ui
pnpm build                    # Build (uses --max-old-space-size=8000)
pnpm seed                     # Seed Payload with sample data
pnpm devsafe                  # rm -rf .next && dev (clears cache)
```

## Authentication

Uses Better Auth (not Payload's built-in auth) for user accounts:
- `src/lib/auth.ts` — server-side config (drizzle adapter, PostgreSQL)
- `src/lib/auth-client.ts` — client-side auth hooks
- `src/middleware.ts` — route protection
- `src/lib/actions/presets.ts` — server actions for preset CRUD

## Databases

Two databases — Payload and auth are separate:
- **Payload CMS**: SQLite via `@payloadcms/db-sqlite` (`file:./data/payloadtwist.db`)
- **Better Auth**: PostgreSQL via drizzle-orm (`AUTH_DATABASE_URL`)

## Infrastructure

- `Dockerfile` — standalone Next.js build, node:22-slim, copies node_modules for libsql native
- `docker-compose.yml` — app + postgres (auth DB), SQLite volume for Payload
- `next.config.mjs` — `output: 'standalone'`, `serverExternalPackages: ['libsql']`
- libsql native binaries require special handling: allowed in pnpm lifecycle scripts, externalized in webpack

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

Payload admin runs in an iframe:
```html
<iframe id="payload-preview" src="/admin" />
```

The store injects `<style id="tweakpayload-vars">` into the iframe's
`<head>` on every state change. Same-origin, no CORS issues.

Component overrides inject into `<style id="tweakpayload-components">`.
BEM raw CSS injects into `<style id="tweakpayload-bem">`.

All injection goes through `injectIntoIframe()` in generator.ts.
NEVER inject into the parent document's `:root`.
Must also be called on iframe `load` event (Payload navigates internally).

Dark mode toggle:
```ts
iframe.contentDocument?.documentElement
  .setAttribute('data-theme', isDark ? 'dark' : 'light')
```

## Schema — source of truth

`src/payload-theme/payload-theme-schema.json` is generated by the
extraction script. NEVER hand-edit this file.

Regenerate after Payload UI version updates:
```bash
pnpm extract-payload-theme
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

## What NOT to do

- Never hand-edit `payload-theme-schema.json`
- Never inject CSS into parent `:root` — only into the iframe
- Never use `.dark` selector — Payload uses `[data-theme="dark"]`
- Never override `--theme-elevation-*` — breaks dark mode inversion
- Never import Payload CSS into editor routes
- Never touch `src/app/(payload)/` — Payload manages these
- Never change `id="payload-preview"` on the iframe

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

Not started:
- Deployment to production