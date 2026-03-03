import type { Block } from 'payload'

export const CallToAction: Block = {
  slug: 'cta',
  labels: { singular: 'Call to Action', plural: 'Calls to Action' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonLink', type: 'text', required: true },
    {
      name: 'style',
      type: 'radio',
      defaultValue: 'standard',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Highlight', value: 'highlight' },
        { label: 'Minimal', value: 'minimal' },
      ],
    },
  ],
}
