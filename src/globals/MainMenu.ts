import type { GlobalConfig } from 'payload'

export const MainMenu: GlobalConfig = {
  slug: 'main-menu',
  access: { read: () => true },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'link',
          options: [
            { label: 'Custom Link', value: 'link' },
            { label: 'Page', value: 'page' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'link',
          },
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'page',
          },
        },
        { name: 'newTab', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
