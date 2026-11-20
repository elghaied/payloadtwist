import { APIError } from 'payload'
import type { CollectionBeforeOperationHook, CollectionConfig } from 'payload'

// The preview is a shared, public demo: reads, auth and admin UI state are allowed,
// every other operation is rejected so visitors can't change what others see.
const ALLOWED_OPERATIONS = new Set<string>([
  'find',
  'findByID',
  'findDistinct',
  'findVersions',
  'findVersionByID',
  'read',
  'readDistinct',
  'count',
  'countVersions',
  'validate',
  'login',
  'refresh',
])

const readOnly: CollectionBeforeOperationHook = ({ operation, req }) => {
  if (req.context?.seeding || ALLOWED_OPERATIONS.has(operation)) return
  throw new APIError('This is a read-only preview. Changes are not saved.', 403, null, true)
}

export const demo = (config: CollectionConfig): CollectionConfig => ({
  ...config,
  access: { create: () => true, read: () => true, update: () => true, delete: () => true },
  hooks: { ...config.hooks, beforeOperation: [readOnly] },
})

/** Caps the bytes actually read, for bodies without (or lying about) Content-Length. */
export function limitBody(request: Request, max = MAX_BODY_BYTES): Request {
  if (!request.body) return request
  let seen = 0
  const body = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        seen += chunk.byteLength
        if (seen > max) controller.error(new Error('Request too large'))
        else controller.enqueue(chunk)
      },
    }),
  )
  // Rebuilt from parts: Next's request class can't be passed to the global Request constructor
  return new Request(request.url, { method: request.method, headers: request.headers, body, duplex: 'half' } as RequestInit)
}

// Second line of defense, in the REST route, before Payload reads the request: nobody may change the
// shared demo, so every write is refused at the door (uploads never get read). Only the shared
// account's session calls and the admin's POST searches (relationship/upload pickers) pass, and
// those searches are rebuilt as real GET requests so Payload can never treat them as writes.
// Payload's own server-side writes (preferences while rendering) use the Local API, not this route.
const MAX_BODY_BYTES = 2 * 1024 * 1024
const SESSION_CALLS = new Set(['users/login', 'users/logout', 'users/refresh-token'])

const reject = (status: number, message: string) => Response.json({ errors: [{ message }] }, { status })
const READ_ONLY = () => reject(403, 'This is a read-only preview. Changes are not saved.')

/**
 * Guard for the demo's REST API: a Response to short-circuit with, or the request to hand to Payload
 * (a GET for searches sent as POST).
 */
export async function guardDemoRequest(request: Request): Promise<Response | Request> {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') return request
  let segments: string[]
  try {
    // Decoded, like the router sees it
    segments = new URL(request.url).pathname.split('/').filter(Boolean).slice(1).map(decodeURIComponent)
  } catch {
    return reject(400, 'Bad request.')
  }
  if (request.method !== 'POST') return READ_ONLY()
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return reject(413, 'Request too large.')
  if (SESSION_CALLS.has(segments.slice(0, 2).join('/'))) return limitBody(request)

  // Payload's POST-as-GET: exactly the form the admin UI sends, never on internal collections
  const isSearch =
    request.headers.get('x-payload-http-method-override') === 'GET' &&
    request.headers.get('content-type') === 'application/x-www-form-urlencoded' &&
    segments.length === 1 &&
    !segments[0].startsWith('payload-')
  if (!isSearch) return READ_ONLY()
  let search: string
  try {
    search = await limitBody(request).text()
  } catch {
    return reject(413, 'Request too large.')
  }
  const url = new URL(request.url)
  for (const [k, v] of new URLSearchParams(search)) url.searchParams.append(k, v)
  const headers = new Headers(request.headers)
  for (const h of ['x-payload-http-method-override', 'x-http-method-override', 'content-type', 'content-length']) headers.delete(h)
  return new Request(url, { method: 'GET', headers })
}
