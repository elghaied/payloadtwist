import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true, required: true },
    {
      name: 'columns',
      type: 'number',
      min: 1,
      max: 4,
      defaultValue: 3,
    },
  ],
}
