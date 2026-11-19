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

