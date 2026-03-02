import type { CollectionConfig } from 'payload'

import { readOnlyAccess } from '@/access/readOnly'

export const Media: CollectionConfig = {
  slug: 'media',
  access: readOnlyAccess,
  endpoints: false,
  graphQL: false,
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
