/**
 * Writes the built-in presets as payload-admin-ui-themes packages into src/admin-themes/ using
 * the exact exporter users get (buildThemePackage). The demo admin registers them, which proves
 * the export end to end. Run after changing presets or the exporter: pnpm generate:admin-themes
 */
import fs from 'node:fs'
import path from 'node:path'
import { adminThemeFiles } from '../payload-theme/admin-themes'

const dir = path.resolve(import.meta.dirname, '../admin-themes')
fs.rmSync(dir, { recursive: true, force: true })
const files = adminThemeFiles()
for (const [file, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
  fs.writeFileSync(path.join(dir, file), content)
}
console.log(`admin-themes: wrote ${Object.keys(files).length} files`)
