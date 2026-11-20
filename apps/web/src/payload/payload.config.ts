import path from 'path'
import { fileURLToPath } from 'url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { APIError, buildConfig, createFolderField } from 'payload'
import type { Field, GlobalConfig } from 'payload'
import { payloadAdminUIThemes } from 'payload-admin-ui-themes'
import { stockTheme } from 'payload-admin-ui-themes/themes/stock'
import { payloadtwistAdminThemes } from '../admin-themes'
import { demo } from './demo'
import { L } from './labels'
import { fullEditor } from './lexical'
import { FieldShowcase } from './field-showcase'
import { migrations } from './migrations'
import { DEMO_USER, MEDIA_DIR, seed } from './seed'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const Users = demo({
  slug: 'users',
  labels: L.collections.users,
  // Everyone shares the auto-login account, so failed logins must never lock it.
  auth: { maxLoginAttempts: 0, useAPIKey: true },
  admin: { useAsTitle: 'name', group: L.groups.settings, defaultColumns: ['name', 'email', 'role'] },
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
  labels: L.collections.media,
  admin: { group: L.groups.content },
  upload: {
    staticDir: MEDIA_DIR,
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
  labels: L.collections.categories,
  admin: { useAsTitle: 'title', group: L.groups.content },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'posts', type: 'join', collection: 'posts', on: 'categories' },
  ],
})

const Folders = demo({
  slug: 'folders',
  labels: L.collections.folders,
  folders: true,
  admin: { useAsTitle: 'name', group: L.groups.content },
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
  labels: L.collections.posts,
  admin: {
    useAsTitle: 'title',
    group: L.groups.content,
    defaultColumns: ['title', 'author', 'categories', '_status', 'publishedAt'],
  },
  versions: { drafts: true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: L.tabs.content,
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'excerpt', type: 'textarea', localized: true },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'content', type: 'richText' },
          ],
        },
        {
          label: L.tabs.details,
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
              label: L.tabs.seo,
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
  labels: L.collections.pages,
  admin: { useAsTitle: 'title', group: L.groups.content, defaultColumns: ['title', 'slug', '_status'] },
  versions: { drafts: { autosave: true } },
  fields: [
    { name: 'title', type: 'text', required: true },
    layoutBlocks,
    slugField,
    createFolderField({ relationTo: 'folders' }),
  ],
})

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: L.siteSettings,
  admin: { group: L.groups.settings },
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
    components: {
      providers: ['@/payload/components/PreviewBridge#PreviewBridge'],
      views: {
        gallery: {
          Component: '@/payload/components/GalleryView#GalleryView',
          path: '/gallery',
          meta: { title: 'Component gallery' },
        },
      },
    },
    dashboard: {
      defaultLayout: [
        { widgetSlug: 'welcome', width: 'full' },
        { widgetSlug: 'editorial', width: 'medium' },
        { widgetSlug: 'activity', width: 'medium' },
        { widgetSlug: 'collections', width: 'full' },
      ],
      widgets: [
        {
          slug: 'editorial',
          label: L.editorialWidget,
          Component: '@/payload/components/EditorialWidget#EditorialWidget',
          minWidth: 'small',
          maxWidth: 'full',
        },
      ],
    },
  },
  routes: { admin: '/preview', api: '/preview-api' },
  collections: [Posts, Pages, FieldShowcase, Media, Categories, Folders, Users],
  globals: [SiteSettings],
  editor: fullEditor,
  // Admin interface languages (the user menu's language switch). Arabic turns the whole admin
  // right-to-left, which is how themes get checked in RTL; content locales are configured below.
  i18n: { supportedLanguages: { en, fr, ar }, fallbackLanguage: 'en' },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Français', code: 'fr' },
      { label: 'العربية', code: 'ar', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
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
  // Every rejected demo write throws an APIError; keep visitors' Save clicks out of production logs
  loggingLevels: { APIError: 'debug' },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    // The built-in presets, exported by payloadtwist's own theme-package exporter (src/admin-themes)
    payloadAdminUIThemes({
      themes: [stockTheme, ...payloadtwistAdminThemes],
      defaultTheme: 'stock',
      // The editor drives sizes through tokens; the plugin's density would override them
      density: false,
    }),
  ],
  onInit: seed,
})
