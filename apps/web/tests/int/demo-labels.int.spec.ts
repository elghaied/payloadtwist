import { describe, expect, it } from 'vitest'
import { untranslated } from '@/payload/translate'

describe('demo admin labels', () => {
  it('has French and Arabic for every field label, option, block and description', async () => {
    await import('@/payload/payload.config')
    expect([...untranslated]).toEqual([])
  })
})
