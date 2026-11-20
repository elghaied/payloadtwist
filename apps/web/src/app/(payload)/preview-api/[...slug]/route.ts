import config from '@payload-config'
import '@payloadcms/next/css'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'
import { guardDemoRequest } from '@/payload/demo'

/** Every write passes the demo guard before Payload parses the body. */
const guarded =
  <A extends unknown[]>(handler: (request: Request, ...args: A) => Promise<Response>) =>
  (request: Request, ...args: A) =>
    guardDemoRequest(request) ?? handler(request, ...args)

export const GET = REST_GET(config)
export const POST = guarded(REST_POST(config))
export const DELETE = guarded(REST_DELETE(config))
export const PATCH = guarded(REST_PATCH(config))
export const PUT = guarded(REST_PUT(config))
export const OPTIONS = REST_OPTIONS(config)
