import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { adminThemeFiles } from '@/payload-theme/admin-themes'

// The demo admin registers these generated packages; they must be exactly what the exporter
// produces today, or the demo would be proving an old export.
describe('generated admin-theme packages', () => {
  it('match the current exporter output (run pnpm generate:admin-themes)', () => {
    const dir = path.resolve(__dirname, '../../src/admin-themes')
    for (const [file, content] of Object.entries(adminThemeFiles())) {
      expect(fs.readFileSync(path.join(dir, file), 'utf8'), file).toBe(content)
    }
  })
})
