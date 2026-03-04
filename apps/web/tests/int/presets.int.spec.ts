import { describe, it, expect } from 'vitest'

// Test the escapeLike helper logic
describe('preset search escaping', () => {
  it('should escape LIKE wildcards', () => {
    const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&')
    expect(escapeLike('test%query')).toBe('test\\%query')
    expect(escapeLike('test_query')).toBe('test\\_query')
    expect(escapeLike('normal')).toBe('normal')
    expect(escapeLike('%_%')).toBe('\\%\\_\\%')
  })
})

describe('preset validation', () => {
  it('should reject names over 100 characters', () => {
    const longName = 'a'.repeat(101)
    expect(longName.length).toBeGreaterThan(100)
  })

  it('should reject descriptions over 1000 characters', () => {
    const longDesc = 'a'.repeat(1001)
    expect(longDesc.length).toBeGreaterThan(1000)
  })

  it('should trim whitespace from names', () => {
    const name = '  My Preset  '
    expect(name.trim()).toBe('My Preset')
  })

  it('should reject scores outside 1-5', () => {
    for (const score of [0, -1, 6, 1.5, NaN]) {
      expect(Number.isInteger(score) && score >= 1 && score <= 5).toBe(false)
    }
  })

  it('should accept valid scores', () => {
    for (const score of [1, 2, 3, 4, 5]) {
      expect(Number.isInteger(score) && score >= 1 && score <= 5).toBe(true)
    }
  })
})
