import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: { useAsTitle: 'title' },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'team-members',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'content', type: 'richText' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    {
      name: 'publishDate',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'readTime',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
