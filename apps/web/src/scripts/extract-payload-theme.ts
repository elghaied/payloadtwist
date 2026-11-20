/**
 * Regenerates src/payload-theme/payload-theme-schema.json from the installed @payloadcms/ui.
 * Run after every Payload upgrade: pnpm extract-payload-theme
 */
import fs from 'node:fs'
import path from 'node:path'
import { extractTokens, extractUsage } from '../payload-theme/extract'

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

// Component CSS (everything outside dist/css) tells us which components use each token
const componentFiles: { css: string }[] = []
const walk = (dir: string) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    // token definition files hold no component rules; styles.css is the bundle of everything else
    else if (entry.name.endsWith('.css') && (!FILES.includes(entry.name) || entry.name === 'app.css') && entry.name !== 'tokens.css' && entry.name !== 'styles.css') {
      componentFiles.push({ css: fs.readFileSync(p, 'utf8') })
    }
  }
}
walk(path.join(uiRoot, 'dist'))
// Other Payload packages ship admin CSS too (rich text editor, Next adapter views)
for (const pkg of ['richtext-lexical', 'next']) {
  const dist = path.join(appRoot, 'node_modules/@payloadcms', pkg, 'dist')
  if (fs.existsSync(dist)) walk(dist)
}
const usage = extractUsage(componentFiles, schema.tokens)
for (const t of schema.tokens) if (usage[t.var]?.length) t.usedBy = usage[t.var]

const out = path.join(appRoot, 'src/payload-theme/payload-theme-schema.json')
fs.writeFileSync(out, JSON.stringify(schema, null, 2) + '\n')
console.log(
  `payload-theme-schema.json: ${schema.meta.tokenCount} tokens, ${schema.meta.rampCount} ramps, usage from ${componentFiles.length} component stylesheets (@payloadcms/ui ${version})`,
)
