/**
 * Regenerates src/payload-theme/payload-theme-schema.json from the installed @payloadcms/ui.
 * Run after every Payload upgrade: pnpm extract-payload-theme
 */
import fs from 'node:fs'
import path from 'node:path'
import { extractTokens } from '../payload-theme/extract'

const appRoot = path.resolve(import.meta.dirname, '../..')
const uiRoot = path.join(appRoot, 'node_modules/@payloadcms/ui')
const cssDir = path.join(uiRoot, 'dist/css')

// Token files only; app.css adds --font-body/--font-mono, preflight/forms hold no tokens.
const FILES = [
  'color-ramps.css',
  'colors.css',
  'theme.css',
  'radius.css',
  'spacing.css',
  'typography.css',
  'elevations.css',
  'z-index.css',
  'app.css',
]

const version = JSON.parse(fs.readFileSync(path.join(uiRoot, 'package.json'), 'utf8')).version
const schema = extractTokens(
  FILES.map((name) => ({ name, css: fs.readFileSync(path.join(cssDir, name), 'utf8') })),
  version,
)

const out = path.join(appRoot, 'src/payload-theme/payload-theme-schema.json')
fs.writeFileSync(out, JSON.stringify(schema, null, 2) + '\n')
console.log(
  `payload-theme-schema.json: ${schema.meta.tokenCount} tokens, ${schema.meta.rampCount} ramps (@payloadcms/ui ${version})`,
)
