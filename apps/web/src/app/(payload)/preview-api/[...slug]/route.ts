import config from '@payload-config'
import '@payloadcms/next/css'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'
import { guardDemoRequest } from '@/payload/demo'

export const GET = REST_GET(config)

/** Every write passes the demo guard before Payload reads the body; searches continue as real GETs. */
type Handler = typeof GET

const guarded =
  (handler: Handler): Handler =>
  async (request, args) => {
    const verdict = await guardDemoRequest(request)
    if (verdict instanceof Response) return verdict
    return verdict.method === 'GET' ? GET(verdict, args) : handler(verdict, args)
  }

export const POST = guarded(REST_POST(config))
export const DELETE = guarded(REST_DELETE(config))
export const PATCH = guarded(REST_PATCH(config))
export const PUT = guarded(REST_PUT(config))
export const OPTIONS = REST_OPTIONS(config)
