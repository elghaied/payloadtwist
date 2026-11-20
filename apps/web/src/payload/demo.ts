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


// Second line of defense, in the REST route, before Payload reads the request: nobody may change the
// shared demo, so every write is refused at the door (uploads never get read). Only the shared
// account's session calls and Payload's POST-as-GET searches (relationship/upload pickers) pass.
// Payload's own server-side writes (preferences while rendering) use the Local API, not this route.
const MAX_BODY_BYTES = 2 * 1024 * 1024
const SESSION_CALLS = new Set(['users/login', 'users/logout', 'users/refresh-token'])

const reject = (status: number, message: string) => Response.json({ errors: [{ message }] }, { status })

/** Guard for the demo's REST API: a Response to short-circuit with, or null to continue. */
export function guardDemoRequest(request: Request): Response | null {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') return null
  let path: string
  try {
    // Decoded, like the router sees it: `users%2Flogin` tricks must not change the outcome
    path = new URL(request.url).pathname.split('/').filter(Boolean).slice(1, 3).map(decodeURIComponent).join('/')
  } catch {
    return reject(400, 'Bad request.')
  }
  const searchAsPost = request.headers.get('x-payload-http-method-override')?.toUpperCase() === 'GET'
  if (request.method !== 'POST' || !(SESSION_CALLS.has(path) || searchAsPost)) {
    return reject(403, 'This is a read-only preview. Changes are not saved.')
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return reject(413, 'Request too large.')
  return null
}

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
