import type { Block } from 'payload'

export const Quote: Block = {
  slug: 'quote',
  labels: { singular: 'Quote', plural: 'Quotes' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'author', type: 'text' },
    { name: 'role', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
