#!/usr/bin/env tsx
/**
 * analyze-scale-impact.ts
 *
 * Reads payload-theme-schema.json and scans global Payload SCSS
 * to map each --color-base-N step to the components that use it
 * (via the --theme-elevation-N alias chain).
 *
 * Output: src/payload-theme/scale-impact-map.json
 *
 * Run: pnpm analyze-scale-impact
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StyleUsage {
  selector: string
  property: string
  value: string
  referencedVar?: string
  valueType: string
}

interface ComponentData {
  sourceFile: string
  bemBlock: string
  category: string
  cssVarCount: number
  styleUsages: StyleUsage[]
}

interface Schema {
  components: Record<string, Record<string, ComponentData>>
}

interface ImpactEntry {
  component: string
  category: string
  count: number
  properties: string[]
  selectors: string[]
}

interface ScaleImpactMap {
  meta: {
    generatedAt: string
    schemaSource: string
  }
  steps: Record<number, ImpactEntry[]>
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT = process.cwd()
const SCHEMA_PATH = path.join(ROOT, 'src', 'payload-theme', 'payload-theme-schema.json')
const OUTPUT_PATH = path.join(ROOT, 'src', 'payload-theme', 'scale-impact-map.json')

const GLOBAL_SCSS_NAMES: Record<string, string> = {
  'vars.scss': 'Global: Inputs & Forms',
  'toasts.scss': 'Global: Toasts',
  'styles.scss': 'Global: Base Styles',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findPayloadUiScssDir(): string | null {
  // Try hoisted location first
  const hoisted = path.join(ROOT, 'node_modules', '@payloadcms', 'ui', 'dist', 'scss')
  if (fs.existsSync(hoisted)) return hoisted

  // Try pnpm virtual store
  const pnpmDir = path.join(ROOT, 'node_modules', '.pnpm')
  if (fs.existsSync(pnpmDir)) {
    const entries = fs.readdirSync(pnpmDir)
    const payloadUi = entries.find((e) => e.startsWith('@payloadcms+ui@'))
    if (payloadUi) {
      const scssDir = path.join(
        pnpmDir,
        payloadUi,
        'node_modules',
        '@payloadcms',
        'ui',
        'dist',
        'scss',
      )
      if (fs.existsSync(scssDir)) return scssDir
    }
  }

  return null
}

function extractElevationStep(varName: string): number | null {
  const m = varName.match(/^--theme-elevation-(\d+)$/)
  return m ? parseInt(m[1], 10) : null
}

function extractBaseStep(varName: string): number | null {
  const m = varName.match(/^--color-base-(\d+)$/)
  return m ? parseInt(m[1], 10) : null
}

// ─── Component analysis ───────────────────────────────────────────────────────

function analyzeComponents(schema: Schema): Record<number, Map<string, ImpactEntry>> {
  const stepMap: Record<number, Map<string, ImpactEntry>> = {}

  for (const [category, components] of Object.entries(schema.components)) {
    for (const [name, comp] of Object.entries(components)) {
      if (!comp.styleUsages) continue

      for (const usage of comp.styleUsages) {
        if (!usage.referencedVar) continue

        let step: number | null = extractElevationStep(usage.referencedVar)
        if (step === null) {
          step = extractBaseStep(usage.referencedVar)
        }
        if (step === null) continue

        if (!stepMap[step]) stepMap[step] = new Map()

        const existing = stepMap[step].get(name)
        if (existing) {
          existing.count++
          if (!existing.properties.includes(usage.property)) {
            existing.properties.push(usage.property)
          }
          if (!existing.selectors.includes(usage.selector)) {
            existing.selectors.push(usage.selector)
          }
        } else {
          stepMap[step].set(name, {
            component: name,
            category,
            count: 1,
            properties: [usage.property],
            selectors: [usage.selector],
          })
        }
      }
    }
  }

  return stepMap
}

// ─── Global SCSS scan ─────────────────────────────────────────────────────────

function scanGlobalScss(scssDir: string): Record<number, Map<string, ImpactEntry>> {
  const stepMap: Record<number, Map<string, ImpactEntry>> = {}
  const elevRegex = /var\(--theme-elevation-(\d+)\)/g

  for (const [filename, label] of Object.entries(GLOBAL_SCSS_NAMES)) {
    const filepath = path.join(scssDir, filename)
    if (!fs.existsSync(filepath)) continue

    const content = fs.readFileSync(filepath, 'utf-8')
    let match: RegExpExecArray | null
    while ((match = elevRegex.exec(content)) !== null) {
      const step = parseInt(match[1], 10)
      if (!stepMap[step]) stepMap[step] = new Map()

      const existing = stepMap[step].get(label)
      if (existing) {
        existing.count++
      } else {
        stepMap[step].set(label, {
          component: label,
          category: 'global',
          count: 1,
          properties: [],
          selectors: [],
        })
      }
    }
  }

  return stepMap
}

// ─── Merge ────────────────────────────────────────────────────────────────────

function mergeImpactMaps(
  ...maps: Record<number, Map<string, ImpactEntry>>[]
): Record<number, ImpactEntry[]> {
  const merged: Record<number, Map<string, ImpactEntry>> = {}

  for (const map of maps) {
    for (const [stepStr, entries] of Object.entries(map)) {
      const step = Number(stepStr)
      if (!merged[step]) merged[step] = new Map()
      for (const [key, entry] of entries) {
        const existing = merged[step].get(key)
        if (existing) {
          existing.count += entry.count
          // Merge properties and selectors too
          for (const prop of entry.properties) {
            if (!existing.properties.includes(prop)) existing.properties.push(prop)
          }
          for (const sel of entry.selectors) {
            if (!existing.selectors.includes(sel)) existing.selectors.push(sel)
          }
        } else {
          merged[step].set(key, { ...entry })
        }
      }
    }
  }

  const result: Record<number, ImpactEntry[]> = {}
  for (const [step, map] of Object.entries(merged)) {
    result[Number(step)] = [...map.values()].sort((a, b) => b.count - a.count)
  }
  return result
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('Loading schema from', SCHEMA_PATH)

  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error('Schema file not found. Run: pnpm extract-payload-theme')
    process.exit(1)
  }

  const schema: Schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'))

  console.log('Analyzing component styleUsages...')
  const componentImpact = analyzeComponents(schema)

  const scssDir = findPayloadUiScssDir()
  let globalImpact: Record<number, Map<string, ImpactEntry>> = {}
  if (scssDir) {
    console.log('Scanning global SCSS from', scssDir)
    globalImpact = scanGlobalScss(scssDir)
  } else {
    console.warn('Could not find @payloadcms/ui SCSS directory — skipping global scan')
  }

  const merged = mergeImpactMaps(componentImpact, globalImpact)

  const output: ScaleImpactMap = {
    meta: {
      generatedAt: new Date().toISOString(),
      schemaSource: 'payload-theme-schema.json',
    },
    steps: merged,
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log('\nWritten to', OUTPUT_PATH)

  // Print summary table
  const allSteps = [
    0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900,
    950, 1000,
  ]
  console.log('\n--- Scale Impact Summary ---\n')

  let totalComponents = 0
  for (const step of allSteps) {
    const entries = merged[step] ?? []
    totalComponents += entries.length
    const top3 = entries
      .slice(0, 3)
      .map((e) => e.component)
      .join(', ')
    console.log(
      `  Step ${String(step).padStart(4)}: ${String(entries.length).padStart(3)} components${top3 ? ' — ' + top3 : ''}`,
    )
  }

  console.log(`\n  Total: ${totalComponents} component-step references`)
}

main()
