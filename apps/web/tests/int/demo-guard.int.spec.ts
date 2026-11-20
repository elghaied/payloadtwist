import { describe, expect, it } from 'vitest'
import { guardDemoRequest, limitBody } from '@/payload/demo'

const req = (method: string, path: string, headers: Record<string, string> = {}) =>
  new Request(`http://localhost${path}`, { method, headers })
const SEARCH = { 'x-payload-http-method-override': 'GET' }

describe('demo REST guard', () => {
  it('refuses every write before reading it, uploads included', () => {
    for (const [method, path] of [
      ['POST', '/preview-api/media'],
      ['PATCH', '/preview-api/posts/1'],
      ['DELETE', '/preview-api/posts/1'],
      ['POST', '/preview-api/users'],
      ['POST', '/preview-api/users/forgot-password'],
      ['POST', '/preview-api/users/reset-password'],
      ['POST', '/preview-api/globals/site-settings'],
      ['POST', '/preview-api/payload-preferences/nav'],
      ['POST', '/preview-api/payload%2Dpreferences/nav'],
      ['PUT', '/preview-api/users/login'],
    ]) {
      expect(guardDemoRequest(req(method, path))?.status, `${method} ${path}`).toBe(403)
    }
    expect(guardDemoRequest(req('POST', '/preview-api/%E0%A4%A'))?.status).toBe(400)
  })

  it('lets the shared session and POST-as-GET searches through', () => {
    for (const path of ['/preview-api/users/login', '/preview-api/users/logout', '/preview-api/users/refresh-token']) {
      expect(guardDemoRequest(req('POST', path, { 'content-length': '80' }))).toBeNull()
    }
    expect(guardDemoRequest(req('POST', '/preview-api/categories', SEARCH))).toBeNull()
    expect(guardDemoRequest(req('GET', '/preview-api/posts/1'))).toBeNull()
  })

  it('caps allowed bodies, declared or streamed', async () => {
    expect(guardDemoRequest(req('POST', '/preview-api/users/login', { 'content-length': String(3 * 1024 * 1024) }))?.status).toBe(413)
    const big = new Request('http://localhost/preview-api/users/login', { method: 'POST', body: new Uint8Array(3 * 1024 * 1024) })
    await expect(limitBody(big).arrayBuffer()).rejects.toThrow()
    const small = new Request('http://localhost/preview-api/users/login', { method: 'POST', body: '{"a":1}' })
    expect(await limitBody(small).text()).toBe('{"a":1}')
  })
})
