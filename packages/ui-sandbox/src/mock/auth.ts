/**
 * Mock user object for preview contexts.
 * AuthProvider is deliberately NOT used in the shell (it makes API calls on mount).
 * This mock is available for consumers who need user data in their components.
 */
export const mockUser = {
  id: 'preview-user',
  email: 'preview@payloadtwist.com',
  collection: 'users',
}

/**
 * Mock auth context matching Payload's AuthContext shape.
 * All methods are no-ops. Use this if you need to manually provide auth context.
 */
export const mockAuthContext = {
  user: mockUser,
  token: 'mock-token',
  permissions: {},
  refreshCookie: () => {},
  refreshCookieAsync: async () => {},
  logOut: async () => {},
  refreshPermissions: async () => {},
  strategy: 'local' as const,
  tokenExpiration: Date.now() + 3600000,
}
