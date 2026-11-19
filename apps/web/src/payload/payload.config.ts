import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { APIError, buildConfig, createFolderField } from 'payload'
import type {
  CollectionBeforeOperationHook,
  CollectionConfig,
  Field,
  GlobalConfig,
} from 'payload'
import { migrations } from './migrations'
import { DEMO_USER, seed } from './seed'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// The preview is a shared, public demo: reads, auth and admin UI state are allowed,
// every other operation is rejected so visitors can't change what others see.
const ALLOWED_OPERATIONS = new Set<string>([
  'find',
  'findByID',
  'findDistinct',
  'findVersions',
  'findVersionByID',
  'read',
  'readDistinct',
  'count',
  'countVersions',
  'validate',
  'login',
  'refresh',
])

const readOnly: CollectionBeforeOperationHook = ({ operation, req }) => {
  if (req.context?.seeding || ALLOWED_OPERATIONS.has(operation)) return
  throw new APIError('This is a read-only preview. Changes are not saved.', 403, null, true)
}

const demo = (config: CollectionConfig): CollectionConfig => ({
  ...config,
  access: { create: () => true, read: () => true, update: () => true, delete: () => true },
  hooks: { ...config.hooks, beforeOperation: [readOnly] },
})

const Users = demo({
  slug: 'users',
  // Everyone shares the auto-login account, so failed logins must never lock it.
  auth: { maxLoginAttempts: 0 },
  admin: { useAsTitle: 'name', group: 'Settings', defaultColumns: ['name', 'email', 'role'] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
      ],
    },
  ],
})

const Media = demo({
  slug: 'media',
  admin: { group: 'Content' },
  upload: {
    staticDir: path.join(os.tmpdir(), 'payloadtwist-preview-media'),
    mimeTypes: ['image/*'],
    focalPoint: false,
    crop: false,
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    createFolderField({ relationTo: 'folders' }),
  ],
})

const Categories = demo({
  slug: 'categories',
  admin: { useAsTitle: 'title', group: 'Content' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
  ],
})

const Folders = demo({
  slug: 'folders',
  folders: true,
  admin: { useAsTitle: 'name', group: 'Content' },
  fields: [{ name: 'name', type: 'text', required: true }],
})

const slugField: Field = {
  name: 'slug',
  type: 'text',
  index: true,
  admin: { position: 'sidebar' },
}

const layoutBlocks: Field = {
  name: 'layout',
  type: 'blocks',
  blocks: [
    {
      slug: 'hero',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'subheading', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      slug: 'content',
      fields: [{ name: 'body', type: 'richText' }],
    },
    {
      slug: 'callToAction',
      labels: { singular: 'Call to action', plural: 'Calls to action' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text' },
        {
          name: 'style',
          type: 'radio',
          defaultValue: 'primary',
          options: ['primary', 'secondary'],
        },
      ],
    },
  ],
}

const Posts = demo({
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', 'categories', '_status', 'publishedAt'],
  },
  versions: { drafts: true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'excerpt', type: 'textarea' },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'content', type: 'richText' },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'readingTime', type: 'number', min: 1, admin: { width: '50%' } },
                {
                  name: 'difficulty',
                  type: 'select',
                  options: ['beginner', 'intermediate', 'advanced'],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'resources',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text' },
              ],
            },
            {
              type: 'collapsible',
              label: 'SEO',
              fields: [
                { name: 'metaTitle', type: 'text' },
                { name: 'metaDescription', type: 'textarea' },
              ],
            },
          ],
        },
      ],
    },
    slugField,
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    { name: 'featured', type: 'checkbox', admin: { position: 'sidebar' } },
    createFolderField({ relationTo: 'folders' }),
  ],
})

const Pages = demo({
  slug: 'pages',
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'slug', '_status'] },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    layoutBlocks,
    slugField,
    createFolderField({ relationTo: 'folders' }),
  ],
})

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Settings' },
  access: { read: () => true, update: () => true },
  hooks: {
    beforeChange: [
      ({ req }) => {
        if (!req.context?.seeding) {
          throw new APIError('This is a read-only preview. Changes are not saved.', 403, null, true)
        }
      },
    ],
  },
  fields: [
    { name: 'siteName', type: 'text', required: true },
    { name: 'tagline', type: 'text' },
    { name: 'maintenanceMode', type: 'checkbox' },
    {
      name: 'social',
      type: 'array',
      fields: [
        { name: 'platform', type: 'select', options: ['x', 'github', 'linkedin', 'youtube'] },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}

export default buildConfig({
  admin: {
    user: 'users',
    autoLogin: { email: DEMO_USER.email, password: DEMO_USER.password, prefillOnly: false },
    meta: { titleSuffix: ' — payloadtwist preview' },
  },
  routes: { admin: '/preview', api: '/preview-api' },
  collections: [Posts, Pages, Media, Categories, Folders, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  // shortcut: in-memory DB re-seeded on every boot; if the preview ever needs persistence, use a file URL.
  db: sqliteAdapter({
    client: { url: ':memory:' },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Dev pushes the schema; production (no push) builds the fresh in-memory DB from migrations.
    // Regenerate with `pnpm payload migrate:create` after changing collections.
    prodMigrations: migrations,
  }),
  secret: process.env.PAYLOAD_SECRET || process.env.BETTER_AUTH_SECRET || '',
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  onInit: seed,
})
