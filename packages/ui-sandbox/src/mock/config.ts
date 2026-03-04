import type { MockConfigOptions } from '../types'

/**
 * Default mock config — satisfies ConfigProvider's minimum requirements.
 * Extracted from the proven working sandbox tests.
 *
 * Cast is necessary because Payload's ConfigProvider expects ClientConfig,
 * but we intentionally provide a minimal subset for preview contexts.
 */
export const defaultMockConfig: Record<string, unknown> = {
  admin: {
    autoLogin: false,
    avatar: undefined,
    components: {},
    custom: {},
    dateFormat: 'MMMM do yyyy, h:mm a',
    livePreview: undefined,
    meta: { icons: [], openGraph: {} },
    routes: {
      account: '/account',
      createFirstUser: '/create-first-user',
      forgot: '/forgot',
      inactivity: '/logout-inactivity',
      login: '/login',
      logout: '/logout',
      reset: '/reset',
      unauthorized: '/unauthorized',
    },
    theme: 'all',
    user: 'users',
  },
  collections: [],
  cookiePrefix: 'payload',
  globals: [],
  routes: { admin: '/admin', api: '/api' },
  serverURL: '',
}

/**
 * Create a custom mock config by merging overrides onto the default.
 */
export function createMockConfig(options: MockConfigOptions = {}): Record<string, unknown> {
  return {
    ...defaultMockConfig,
    collections: options.collections ?? defaultMockConfig.collections,
    globals: options.globals ?? defaultMockConfig.globals,
    cookiePrefix: options.cookiePrefix ?? defaultMockConfig.cookiePrefix,
    serverURL: options.serverURL ?? defaultMockConfig.serverURL,
    routes: {
      admin: options.adminRoute ?? '/admin',
      api: '/api',
    },
  }
}

/**
 * Default mock server function — handles form-state requests.
 * Returns `{ state: {} }` for form-state calls, `{}` for everything else.
 */
export const defaultMockServerFunction = async (args: { name?: string }): Promise<Record<string, unknown>> => {
  if (args?.name === 'form-state') {
    return { state: {} }
  }
  return {}
}
