import { describe, expect, it } from 'vitest'
import { guardDemoRequest, limitBody } from '@/payload/demo'

const req = (method: string, path: string, headers: Record<string, string> = {}) =>
  new Request(`http://localhost${path}`, { method, headers })

describe('demo REST guard', () => {
  it('blocks writes to Payload internal collections', () => {
    expect(guardDemoRequest(req('POST', '/preview-api/payload-preferences/nav'))?.status).toBe(403)
    expect(guardDemoRequest(req('DELETE', '/preview-api/payload-preferences/1'))?.status).toBe(403)
    expect(guardDemoRequest(req('POST', '/preview-api/payload-locked-documents'))?.status).toBe(403)
    // encoded, case-varied and unknown slugs are denied too
    expect(guardDemoRequest(req('POST', '/preview-api/payload%2Dpreferences/nav'))?.status).toBe(403)
    expect(guardDemoRequest(req('POST', '/preview-api/Payload-Preferences/nav'))?.status).toBe(403)
    expect(guardDemoRequest(req('POST', '/preview-api/%E0%A4%A'))?.status).toBe(400)
  })

  it('caps bodies that have no Content-Length', async () => {
    const big = new Request('http://localhost/preview-api/posts/1', { method: 'PATCH', body: new Uint8Array(3 * 1024 * 1024) })
    await expect(limitBody(big).arrayBuffer()).rejects.toThrow()
    const small = new Request('http://localhost/preview-api/posts/1', { method: 'PATCH', body: '{"a":1}' })
    expect(await limitBody(small).text()).toBe('{"a":1}')
  })

  it('rejects oversized bodies before parsing', () => {
    expect(guardDemoRequest(req('POST', '/preview-api/users/login', { 'content-length': String(3 * 1024 * 1024) }))?.status).toBe(413)
  })

  it('leaves reads, login and normal (hook-guarded) writes to Payload', () => {
    expect(guardDemoRequest(req('GET', '/preview-api/payload-preferences/nav'))).toBeNull()
    expect(guardDemoRequest(req('POST', '/preview-api/users/login', { 'content-length': '80' }))).toBeNull()
    expect(guardDemoRequest(req('PATCH', '/preview-api/posts/1'))).toBeNull()
  })
})
