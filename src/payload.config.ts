import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { TeamMembers } from './collections/TeamMembers'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { MainMenu } from './globals/MainMenu'
import { seed } from './seed/seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    autoLogin:
      process.env.NODE_ENV !== 'production'
        ? { email: 'dev@payloadcms.com', password: 'test', prefillOnly: false }
        : false,
    components: {
      views: {
        showcase: {
          Component: '@/components/admin/ShowcaseView',
          path: '/showcase',
        },
      },
    },
  },
  collections: [Users, Media, Categories, TeamMembers, Posts, Products, Pages],
  globals: [SiteSettings, MainMenu],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
    // push:true only runs schema sync when NODE_ENV !== 'production'
    // In Docker production, the build-time database (with schema) is copied
    // to the data volume. See Dockerfile for details.
    push: true,
  }),
  sharp,
  onInit: async (payload) => {
    await seed(payload)
  },
  plugins: [],
})
