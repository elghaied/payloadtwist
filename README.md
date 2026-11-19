<p align="center">
  <img src="assets/logo.svg" alt="payloadtwist logo" width="120" />
</p>

<h1 align="center">payloadtwist</h1>

<p align="center">
  A visual theme editor for the <a href="https://payloadcms.com">Payload</a> <strong>v4</strong> admin.<br/>
  Theme brand colors, surfaces, radius, density and fonts on a live admin — then export clean CSS.<br/><br/>
  Inspired by <a href="https://tweakcn.com">tweakcn</a> — the shadcn/ui theme editor.
</p>

<p align="center">
  <img src="assets/editor_screenshot.png" alt="payloadtwist editor with a live Payload v4 admin" width="900" />
</p>

> payloadtwist targets **Payload v4** (currently `4.0.0-beta.10`). Payload v4 replaced the v3
> `--theme-*` / `--color-base-*` variables and SCSS with `--ramp-*` palettes, semantic `--color-*`
> roles and plain, layered CSS. v3 is not supported.

## Features

- **A real Payload v4 admin as the preview** — dashboard, lists, edit views, drawers and a
  component gallery, with demo content. Or connect **your own** Payload v4 admin.
- **Seed colors** — brand, accent, neutral, success, warning and danger regenerate Payload's ramp
  families along its own lightness curve; fine-tune any ramp step
- **Presets** — neutral, color and character starting points (incl. Light Cream)
- **Surfaces** — the high-impact semantic roles with light and dark pickers and WCAG contrast
  checks that blend Payload's translucent roles like the browser does
- **Shape & density** — one roundness value for every radius, three densities, sidebar widths
- **Typography** — Google Fonts for body, headings and code, plus a type-scale multiplier
- **Advanced** — all 484 Payload v4 tokens, searchable, per mode
- **Light, dark and enhanced contrast** preview, desktop/tablet/mobile widths, undo/redo
- **Export** — `custom.css` (no `!important`: Payload's styles are layered), a
  [`payload-admin-ui-themes`](https://github.com/zubricks/payload-admin-ui-themes) theme package
  (one-click `.zip` with CSS, provider, manifest and install README), or JSON
- **Proven export** — the demo admin runs payloadtwist's own presets as exported packages: open
  `/preview` → account → Settings → Admin theme
- **Accounts & gallery** — save presets, share them publicly, rate others, preview them live

## Quick start

Requirements: Node 24.22+, pnpm 10, PostgreSQL (for accounts).

```bash
git clone https://github.com/elghaied/payloadtwist.git
cd payloadtwist
pnpm install
cp apps/web/.env.example apps/web/.env   # set AUTH_DATABASE_URL and BETTER_AUTH_SECRET
pnpm dev
```

Open [http://localhost:3000/editor](http://localhost:3000/editor). The demo admin lives at
[`/preview`](http://localhost:3000/preview).

## How it works

```
apps/web/src/
├── payload-theme/         theme model, ramp generator, CSS output — all pure, unit-tested
│   ├── payload-theme-schema.json   ← generated from @payloadcms/ui (pnpm extract-payload-theme)
│   ├── theme.ts           ThemeConfig + reducers + parseTheme (validation at every boundary)
│   ├── ramps.ts           seed color → Payload ramp families
│   └── css.ts             custom.css / theme package builder
├── payload/               the embedded demo Payload v4 (in-memory SQLite, read-only, seeded)
├── app/(payload)/         Payload's admin at /preview and REST at /preview-api
├── app/(frontend)/        landing, editor, presets, dashboard, auth
└── store/editor-store.ts  zustand store with undo/redo
```

The editor posts the generated CSS to the preview iframe; a small provider inside the admin
(`PreviewBridge`, or the `PayloadTwistBridge` users copy into their own project) writes it into a
`<style>` tag and drives Payload's own theme hooks for light/dark and contrast. Both directions
check origins.

## Development

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint
pnpm typecheck
pnpm --filter @payloadtwist/web test:int   # unit tests (vitest)
pnpm --filter @payloadtwist/web test:e2e   # end-to-end (playwright)
```

| Script (apps/web) | Description |
|---|---|
| `extract-payload-theme` | Regenerate the token schema from the installed `@payloadcms/ui`. Run after every Payload upgrade. |
| `generate:importmap` | Regenerate the demo admin's import map after adding admin components. |
| `payload migrate:create` | Regenerate the demo DB migration after changing demo collections (production builds the in-memory DB from it). |
| `generate:admin-themes` | Re-export the built-in presets into `src/admin-themes/` (a test fails if they drift). |
| `fetch-google-fonts` | Refresh the Google Fonts catalog. |
| `db:generate` / `db:migrate` | Auth database migrations (Drizzle). |

### Docker

```bash
docker compose up
```

App + PostgreSQL. The image runs on `node:24-trixie-slim` without npm/corepack.

## License

MIT
