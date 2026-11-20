# CLAUDE.md — payloadtwist

## What this project is

A visual theme editor for the **Payload v4** admin (v3 is not supported). The user edits
Payload's design tokens; a real Payload v4 admin in an iframe reflects every change live; the
output is a `custom.css` (or a `payload-admin-ui-themes` theme package) the user pastes into
their project.

Stack: Next.js 16.4.6, React 19.3, TypeScript 6.0.3, Node ≥ 24.22, Payload `4.0.0-beta.10`
(pinned — v4 is beta), Turborepo + pnpm, Tailwind 4 (editor chrome only), zustand, Better Auth
(Postgres via Drizzle).

## Project structure

```
apps/web/src/
├── app/
│   ├── (frontend)/          own root layout: landing, /editor, /presets, /dashboard, auth pages
│   ├── (payload)/           Payload's root layout: admin at /preview, REST at /preview-api
│   ├── api/                 better-auth + /api/health
│   └── global-not-found.tsx (no app/layout.tsx — two root layouts)
├── admin-themes/            generated (pnpm generate:admin-themes): presets exported as
│                            payload-admin-ui-themes packages, registered by the demo admin
├── payload/                 the embedded demo Payload (see "Preview")
│   ├── payload.config.ts    collections, globals, dashboard widgets, gallery view, bridge
│   ├── seed.ts              demo content (runs onInit), DEMO_USER, MEDIA_DIR
│   ├── migrations/          generated — production builds the in-memory DB from these
│   ├── payload-types.ts     generated (pnpm payload generate:types)
│   └── components/          PreviewBridge, GalleryView/Client, EditorialWidget
├── payload-theme/           ALL theming logic — pure, unit-tested
│   ├── payload-theme-schema.json   generated — NEVER hand-edit
│   ├── extract.ts           CSS token parser used by scripts/extract-payload-theme.ts
│   ├── schema.ts            TOKENS, DEFAULT_RAMPS, resolveAll/resolveToken
│   ├── theme.ts             ThemeConfig, reducers, parseTheme, isSafeValue
│   ├── ramps.ts             seeds → ramp families
│   ├── controls.ts          roundness, density, type scale, fonts, surfaces, shadows, borders → tokens
│   ├── components.ts        component layer: typed props on v4 BEM classes (sidebar, buttons, cards…)
│   ├── css.ts               buildThemeCss, buildThemePackage, darkDeclarations
│   ├── presets.ts           built-in presets (expressed via the reducers)
│   ├── preview-protocol.ts  editor ⇄ preview postMessage types
│   └── bridge-source.ts     PayloadTwistBridge source users copy into their project
├── components/editor/       PreviewPanel, sections/*, ExportDialog, CustomPreviewSetup
├── store/editor-store.ts    zustand: theme + undo/redo + preview mode
├── lib/actions/presets.ts   server actions (client-callable — every one checks access)
├── lib/seo.ts               pageMetadata(): share card + canonical for every page (Next replaces openGraph per page)
└── proxy.ts                 route protection (Next 16 "proxy", formerly middleware)
```

## Payload v4 token model — READ FIRST

Payload v4 has no `--theme-*`, `--theme-elevation-*` or `--color-base-*`. Its CSS is plain CSS
inside `@layer payload-default`, so **unlayered rules win without `!important`**.

1. **Ramps** `--ramp-{family}-{step}` (blue, purple, grey, green, red, yellow, pink, pale-*, dark-red,
   black/white alpha). Declared only on `:root`. Seeds regenerate these.
2. **Semantic roles** `--color-*`, `--field-color-*`, `--special-*`: explicit light values on
   `:root, [data-theme='light']` and dark values on `[data-theme='dark']`. No auto-inversion.
   Payload **re-declares them on every element with `[data-theme]`** (portaled menus/popups).
3. **Shape/type/spacing**: `--radius-*`, `--button-height`, `--field-*`, `--text-*`, `--spacer-*`,
   `--nav-width`… mode-independent.
4. Enhanced contrast: `html[data-enhanced-contrast]` blocks (captured in the schema, read-only).

### CSS output rules (css.ts — keep these invariants)

- Light block: `html, html [data-theme='light']` (nested selector reaches portaled UI).
- Dark block: `html[data-theme='dark'], html [data-theme='dark']`.
- An unlayered `html` override also wins in dark mode, so for any token Payload gives a separate
  dark value, `darkDeclarations()` restates Payload's dark value unless the user set one.
- Only values that differ from Payload's defaults are emitted. Google Fonts via `@import`.
- `ThemeConfig` = `{ version: 4, seeds, controls, ramps, light, dark, components, customCss }`. Output is
  built from ramps/light/dark/components/customCss; seeds/controls remember how the editor produced them.
- Derived values re-apply when seeds change: surface tint/depth (from the neutral or brand seed),
  glow shadows (brand), and white-or-near-black labels on brand/accent (WCAG).

### Component layer (components.ts)

Tokens can't express a branded sidebar, card shadows or uppercase headers, so `components` holds
typed properties per component, emitted after the token blocks on Payload's BEM classes
(`.nav`, `.nav__link--selected` + its `::before`, `.app-header`, `.btn--style-primary`, `.card`,
`.widget-card`, `.table thead th`, `.form-input`, `.rs__control`, `.pill`, …).
- Colors are per mode (light-only colors are scoped to `:not([data-theme='dark'])`), everything else
  is shared. `text` also re-declares text/icon tokens locally so nested labels follow.
- `sidebar.scheme: 'dark'` re-declares Payload's dark color tokens inside `.nav` so every nested
  control (user menu, tabs, toggles) turns dark on a dark sidebar in light mode.
- Verify selectors in the real admin (`/preview`, `/preview/gallery`) when Payload updates.
- Presets (presets.ts) are built only through reducers; tests hold every preset to WCAG AA.

## Preview

`/preview` is a **real Payload v4 admin** (not mocks): `src/payload/payload.config.ts` with
`@payloadcms/db-sqlite` on `:memory:`, re-seeded on every boot, `admin.autoLogin` as `DEMO_USER`.

- Public & shared → **write-protected**: a `beforeOperation` allowlist (`find*`, `read`, `count*`,
  `validate`, `login`, `refresh`); globals reject in `beforeChange`. Payload's internal collections
  (`payload-preferences`, …) skip that hook, so `guardDemoRequest` in the REST route refuses every write
  before the body is read (uploads included); only `users/login|logout|refresh-token` and Payload's
  POST-as-GET searches (`X-Payload-HTTP-Method-Override: GET`) pass, capped at 2MB by `limitBody`. Access functions return true
  so fields look editable. `auth.maxLoginAttempts: 0` (shared account must not lock).
- Dev pushes the schema; production has no push → after changing demo collections run
  `pnpm payload migrate:create` (prodMigrations), `pnpm generate:importmap`, `payload generate:types`.
- Uploads go to `MEDIA_DIR` (os.tmpdir), wiped on seed. `next.config.mjs` force-traces `strtok3`.
- `/preview/gallery` is a custom admin view with every component family and token.
- `field-showcase` has every field type; `lexical.ts` enables every Lexical feature (seed builders in
  `seed-richtext.ts` cover every node type). The JSX debug panel only has default converters, so its
  field gets a "portable" copy without custom blocks/internal links.
- `payload-admin-ui-themes` (installed under that alias — its client path is hard-coded) registers
  `src/admin-themes`; `density: false` because its density overrides editor tokens. While the editor
  drives the preview, the bridge resets `data-admin-theme` to `stock`.

### Editor ⇄ preview

One postMessage protocol (`preview-protocol.ts`) for both the demo admin (`PreviewBridge`,
same-origin only) and users' own admins (`PayloadTwistBridge`, generated with the editor origin
baked in). Messages: `css`, `theme`, `contrast`, `navigate` → preview; `ready`, `route` ← preview.
The editor re-sends everything on every `ready`. **Always check `event.origin` and `event.source`.**
The iframe keeps `id="payload-preview"`.

## Landing

`/` is an editorial lookbook: each spread wears its preset's colors and heading font. Images in
`public/lookbook/` are real captures of `/preview` with the plugin theme applied (`localStorage
payload-admin-ui-theme:1`) — re-capture after preset changes. `public/og.png` is a static 1200×630 render.

## Security rules

- `parseTheme()` at every trust boundary (presets from DB, imports, localStorage, server actions):
  only real token keys, `isSafeValue()` rejects `url(`, `@import`, escapes, `;{}<>`.
- Someone else's preset never auto-applies its `customCss` (it would run in a connected admin).
- Server actions are public endpoints: `getPresetById` returns only public or own presets;
  `ratePreset` only public presets.
- Docker runner has no npm/corepack/yarn; `HOSTNAME=0.0.0.0` for healthchecks.

## Commands

```bash
pnpm dev | build | lint | typecheck                      # workspace (turbo)
pnpm --filter @payloadtwist/web test:int                 # vitest — payload-theme + store
pnpm --filter @payloadtwist/web test:e2e                 # playwright (E2E_BASE_URL to reuse a server)
pnpm --filter @payloadtwist/web extract-payload-theme    # after every @payloadcms/ui upgrade
pnpm --filter @payloadtwist/web generate:importmap
pnpm --filter @payloadtwist/web payload migrate:create   # after demo collection changes
pnpm --filter @payloadtwist/web generate:admin-themes    # after preset or exporter changes
```

## What NOT to do

- Never hand-edit `payload-theme-schema.json`, `payload-types.ts`, `migrations/`, `importMap.js`,
  `src/admin-themes/`.
- Never use `!important` in generated CSS or `.dark` selectors (Payload uses `[data-theme]`).
- Never bring back v3 variables or SCSS.
- Never inject CSS into the editor's own document — only into the preview iframe via the bridge.
- Never accept preview messages without origin + source checks.
- Never allow writes on the demo admin beyond the allowlist.
