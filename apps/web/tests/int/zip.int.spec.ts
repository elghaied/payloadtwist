import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { crc32, zipFiles } from '@/lib/zip'
import { buildThemePackage } from '@/payload-theme/css'
import { presetTheme, THEME_PRESETS } from '@/payload-theme/presets'

const hasUnzip = (() => {
  try {
    execFileSync('unzip', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
})()

describe('zip', () => {
  it('computes the standard CRC-32 check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
  })

  it('writes the expected structure', () => {
    const zip = zipFiles({ 'a/b.txt': 'hello', 'c.txt': 'é' })
    const view = new DataView(zip.buffer)
    expect(view.getUint32(0, true)).toBe(0x04034b50)
    expect(view.getUint32(zip.length - 22, true)).toBe(0x06054b50)
    expect(view.getUint16(zip.length - 22 + 10, true)).toBe(2)
  })

  it.runIf(hasUnzip)('round-trips a real theme package through unzip', () => {
    const preset = THEME_PRESETS.find((p) => p.id === 'midnight')!
    const files = buildThemePackage(presetTheme(preset), { id: 'midnight', label: 'Midnight' })
    const prefixed = Object.fromEntries(Object.entries(files).map(([f, c]) => [`midnight/${f}`, c]))
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pt-zip-'))
    const file = path.join(dir, 'theme.zip')
    fs.writeFileSync(file, zipFiles(prefixed))
    execFileSync('unzip', ['-tq', file]) // throws on CRC/structure errors
    execFileSync('unzip', ['-q', file, '-d', dir])
    for (const [name, content] of Object.entries(prefixed)) {
      expect(fs.readFileSync(path.join(dir, name), 'utf8')).toBe(content)
    }
  })
})
