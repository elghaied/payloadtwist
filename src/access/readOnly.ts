import type { Access } from 'payload'

/**
 * Read-only access: allows reading, denies all mutations.
 * Used across all collections and globals since this Payload instance
 * is a display-only preview for the theme editor.
 */
export const readOnlyAccess = {
  read: (() => true) satisfies Access,
  create: (() => false) satisfies Access,
  update: (() => false) satisfies Access,
  delete: (() => false) satisfies Access,
  unlock: (() => false) satisfies Access,
}

/**
 * Read-only access for globals (no create/delete, just read/update).
 */
export const readOnlyGlobalAccess = {
  read: (() => true) satisfies Access,
  update: (() => false) satisfies Access,
}
