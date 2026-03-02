import type { CollectionConfig } from 'payload'

import { readOnlyAccess } from '@/access/readOnly'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: readOnlyAccess,
  endpoints: false,
  graphQL: false,
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
