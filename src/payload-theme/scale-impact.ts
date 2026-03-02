/**
 * scale-impact.ts
 *
 * Loads the generated scale-impact-map.json and provides
 * typed access to the step -> component impact data.
 */

import scaleImpactData from './scale-impact-map.json'

export interface ImpactEntry {
  component: string
  category: string
  count: number
  properties: string[]
  selectors: string[]
}

export interface ScaleImpactMap {
  meta: {
    generatedAt: string
    schemaSource: string
  }
  steps: Record<string, ImpactEntry[]>
}

const impactMap = scaleImpactData as ScaleImpactMap

export function getImpactForStep(step: number): ImpactEntry[] {
  return impactMap.steps[String(step)] ?? []
}

export function getTopImpactLabels(step: number, limit = 3): string[] {
  return getImpactForStep(step)
    .slice(0, limit)
    .map(e => e.component)
}

export function getImpactCount(step: number): number {
  return getImpactForStep(step).length
}

export function getAllStepSummaries(labelLimit = 2): Record<number, { labels: string[]; totalCount: number }> {
  const result: Record<number, { labels: string[]; totalCount: number }> = {}
  for (const [stepStr, entries] of Object.entries(impactMap.steps)) {
    const step = Number(stepStr)
    result[step] = {
      labels: entries.slice(0, labelLimit).map(e => e.component),
      totalCount: entries.length,
    }
  }
  return result
}
