import type { CollectionConfig } from 'payload'

import { readOnlyAccess } from '@/access/readOnly'
import { Hero } from '../blocks/Hero'
import { Content } from '../blocks/Content'
import { Gallery } from '../blocks/Gallery'
import { CallToAction } from '../blocks/CallToAction'
import { Quote } from '../blocks/Quote'
import { Stats } from '../blocks/Stats'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  access: readOnlyAccess,
  endpoints: false,
  graphQL: false,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    { name: 'content', type: 'richText' },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [Hero, Content, Gallery, CallToAction, Quote, Stats],
    },
    {
      type: 'collapsible',
      label: 'SEO & Metadata',
      fields: [
        {
          name: 'meta',
          type: 'group',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
            { name: 'metaImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
