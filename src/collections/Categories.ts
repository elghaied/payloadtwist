import type { CollectionConfig } from 'payload'

import { readOnlyAccess } from '@/access/readOnly'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title' },
  access: readOnlyAccess,
  endpoints: false,
  graphQL: false,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'color', type: 'text' },
    {
      name: 'icon',
      type: 'select',
      options: [
        { label: 'Star', value: 'star' },
        { label: 'Heart', value: 'heart' },
        { label: 'Bolt', value: 'bolt' },
        { label: 'Globe', value: 'globe' },
        { label: 'Book', value: 'book' },
      ],
    },
    {
      name: 'posts',
      type: 'join',
      collection: 'posts',
      on: 'categories',
    },
  ],
}
