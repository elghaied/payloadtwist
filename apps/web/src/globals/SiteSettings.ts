import type { GlobalConfig } from 'payload'

import { readOnlyGlobalAccess } from '@/access/readOnly'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: readOnlyGlobalAccess,
  endpoints: false,
  graphQL: false,
  fields: [
    { name: 'siteName', type: 'text', required: true },
    { name: 'siteDescription', type: 'textarea' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    { name: 'contactEmail', type: 'email' },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Twitter', value: 'twitter' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'GitHub', value: 'github' },
          ],
        },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'trackingId', type: 'text' },
      ],
    },
    {
      name: 'maintenanceMode',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'message', type: 'textarea' },
      ],
    },
  ],
}
