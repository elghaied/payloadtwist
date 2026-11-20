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


// Payload's internal collections (payload-preferences, payload-locked-documents, …) skip the hook
// above, and the demo account is shared: writes over HTTP would leak between visitors and could fill
// the in-memory DB. So REST writes may only target the demo's own collections (whose hook rejects
// them, except login/logout/refresh). Payload's own server-side preference writes use the Local API.
const MAX_BODY_BYTES = 2 * 1024 * 1024
const WRITABLE = new Set(['users', 'posts', 'pages', 'field-showcase', 'media', 'categories', 'folders', 'globals'])

const reject = (status: number, message: string) => Response.json({ errors: [{ message }] }, { status })

/** Guard for the demo's REST API: a Response to short-circuit with, or null to continue. */
export function guardDemoRequest(request: Request): Response | null {
  if (request.method === 'GET' || request.method === 'OPTIONS') return null
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return reject(413, 'Request too large.')
  let slug: string
  try {
    // Decoded, like the router sees it: `payload%2Dpreferences` must not slip past
    slug = decodeURIComponent(new URL(request.url).pathname.split('/').filter(Boolean)[1] ?? '')
  } catch {
    return reject(400, 'Bad request.')
  }
  if (!WRITABLE.has(slug)) return reject(403, 'This is a read-only preview. Changes are not saved.')
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
