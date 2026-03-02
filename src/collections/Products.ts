import type { CollectionConfig } from 'payload'

import { readOnlyAccess } from '@/access/readOnly'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
  access: readOnlyAccess,
  endpoints: false,
  graphQL: false,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'sku', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'price', type: 'number', required: true, min: 0 },
                { name: 'compareAtPrice', type: 'number', min: 0 },
              ],
            },
            { name: 'description', type: 'richText' },
            { name: 'inStock', type: 'checkbox', defaultValue: true },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Variants',
          fields: [
            {
              name: 'variants',
              type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'color', type: 'text' },
                {
                  name: 'size',
                  type: 'select',
                  options: [
                    { label: 'XS', value: 'xs' },
                    { label: 'S', value: 's' },
                    { label: 'M', value: 'm' },
                    { label: 'L', value: 'l' },
                    { label: 'XL', value: 'xl' },
                  ],
                },
                { name: 'price', type: 'number', min: 0 },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: [
            { name: 'specifications', type: 'json' },
            { name: 'location', type: 'point' },
            {
              name: 'rating',
              type: 'radio',
              options: [
                { label: '1 Star', value: '1' },
                { label: '2 Stars', value: '2' },
                { label: '3 Stars', value: '3' },
                { label: '4 Stars', value: '4' },
                { label: '5 Stars', value: '5' },
              ],
            },
            {
              name: 'embedCode',
              type: 'code',
              admin: { language: 'html' },
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
            },
            {
              name: 'helpText',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/HelpText',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
