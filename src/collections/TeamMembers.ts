import type { CollectionConfig } from 'payload'

import { readOnlyAccess } from '@/access/readOnly'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: { useAsTitle: 'firstName' },
  access: readOnlyAccess,
  endpoints: false,
  graphQL: false,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
      ],
    },
    { name: 'email', type: 'email', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Author', value: 'author' },
        { label: 'Editor', value: 'editor' },
        { label: 'Admin', value: 'admin' },
        { label: 'Contributor', value: 'contributor' },
      ],
    },
    { name: 'bio', type: 'textarea' },
    {
      name: 'department',
      type: 'radio',
      options: [
        { label: 'Engineering', value: 'engineering' },
        { label: 'Design', value: 'design' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Product', value: 'product' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Twitter', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'GitHub', value: 'github' },
            { label: 'Website', value: 'website' },
          ],
        },
        { name: 'url', type: 'text' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'startDate', type: 'date' },
  ],
}
