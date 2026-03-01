import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaLink', type: 'text' },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'fullWidth',
      options: [
        { label: 'Full Width', value: 'fullWidth' },
        { label: 'Centered', value: 'centered' },
        { label: 'Split', value: 'split' },
      ],
    },
  ],
}
