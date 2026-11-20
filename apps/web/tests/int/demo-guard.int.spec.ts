import { describe, expect, it } from 'vitest'
import { guardDemoRequest, limitBody } from '@/payload/demo'

const req = (method: string, path: string, headers: Record<string, string> = {}, body?: string) =>
  new Request(`http://localhost${path}`, { method, headers, body })
const FORM = 'application/x-www-form-urlencoded'
const status = async (r: Request) => {
  const v = await guardDemoRequest(r)
  return v instanceof Response ? v.status : 'pass'
}

describe('demo REST guard', () => {
  it('refuses every write before reading it, uploads included', async () => {
    for (const [method, path] of [
      ['POST', '/preview-api/media'],
      ['PATCH', '/preview-api/posts/1'],
      ['DELETE', '/preview-api/posts/1'],
      ['POST', '/preview-api/users'],
      ['POST', '/preview-api/users/forgot-password'],
      ['POST', '/preview-api/users/reset-password'],
      ['POST', '/preview-api/globals/site-settings'],
      ['POST', '/preview-api/payload-preferences/nav'],
      ['PUT', '/preview-api/users/login'],
    ]) {
      expect(await status(req(method, path)), `${method} ${path}`).toBe(403)
    }
    expect(await status(req('POST', '/preview-api/%E0%A4%A'))).toBe(400)
  })

  it('only accepts the exact POST-as-GET form the admin sends', async () => {
    // Payload compares the header case-sensitively: anything else would be treated as a create
    expect(await status(req('POST', '/preview-api/payload-preferences/nav', { 'x-payload-http-method-override': 'get', 'content-type': FORM }))).toBe(403)
    expect(await status(req('POST', '/preview-api/categories', { 'x-payload-http-method-override': 'get', 'content-type': FORM }))).toBe(403)
    expect(await status(req('POST', '/preview-api/categories', { 'x-http-method-override': 'GET', 'content-type': FORM }))).toBe(403)
    expect(await status(req('POST', '/preview-api/categories', { 'x-payload-http-method-override': 'GET', 'content-type': 'application/json' }))).toBe(403)
    expect(await status(req('POST', '/preview-api/payload-preferences', { 'x-payload-http-method-override': 'GET', 'content-type': FORM }))).toBe(403)
    expect(await status(req('POST', '/preview-api/posts/1', { 'x-payload-http-method-override': 'GET', 'content-type': FORM }))).toBe(403)
  })

  it('turns admin searches into real GET requests', async () => {
    const v = await guardDemoRequest(
      req('POST', '/preview-api/categories', { 'x-payload-http-method-override': 'GET', 'content-type': FORM }, 'depth=0&limit=5'),
    )
    expect(v).toBeInstanceOf(Request)
    const r = v as Request
    expect(r.method).toBe('GET')
    expect(new URL(r.url).search).toBe('?depth=0&limit=5')
    expect(r.headers.get('x-payload-http-method-override')).toBeNull()
  })

  it('lets the shared session through', async () => {
    for (const path of ['/preview-api/users/login', '/preview-api/users/logout', '/preview-api/users/refresh-token']) {
      expect(await status(req('POST', path, { 'content-length': '80' }))).toBe('pass')
    }
    expect(await status(req('GET', '/preview-api/posts/1'))).toBe('pass')
  })

  it('caps allowed bodies, declared or streamed', async () => {
    expect(await status(req('POST', '/preview-api/users/login', { 'content-length': String(3 * 1024 * 1024) }))).toBe(413)
    const big = new Request('http://localhost/preview-api/users/login', { method: 'POST', body: new Uint8Array(3 * 1024 * 1024) })
    await expect(limitBody(big).arrayBuffer()).rejects.toThrow()
    const small = new Request('http://localhost/preview-api/users/login', { method: 'POST', body: '{"a":1}' })
    expect(await limitBody(small).text()).toBe('{"a":1}')
  })
})
