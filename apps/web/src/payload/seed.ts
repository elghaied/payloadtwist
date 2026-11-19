import { randomUUID } from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import type { Payload, PayloadRequest } from 'payload'
import type { Post, User } from './payload-types'

/** Upload dir for the in-memory demo; wiped on seed so files never pile up across restarts. */
export const MEDIA_DIR = path.join(os.tmpdir(), 'payloadtwist-preview-media')

export const DEMO_USER = {
  name: 'Alex Morgan',
  email: 'demo@payloadtwist.com',
  // Public on purpose: autoLogin into a read-only, in-memory demo.
  password: 'payloadtwist-preview',
}

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
})

const heading = (text: string, tag: 'h2' | 'h3' = 'h2') => ({
  ...paragraph(text),
  type: 'heading',
  tag,
})

// Lexical's node union is generated per-config; the JSON here is validated by Payload on create.
const richText = (...nodes: ReturnType<typeof paragraph>[]) =>
  ({
    root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: nodes },
  }) as unknown as NonNullable<Post['content']>

const gradientSvg = (from: string, to: string, label: string) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <circle cx="930" cy="210" r="170" fill="#fff" fill-opacity=".14"/>
  <circle cx="260" cy="640" r="260" fill="#000" fill-opacity=".08"/>
  <text x="80" y="720" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#fff" fill-opacity=".9">${label}</text>
</svg>`,
  )

const MEDIA = [
  { alt: 'Aurora gradient', from: '#7c3aed', to: '#06b6d4' },
  { alt: 'Sunset gradient', from: '#f97316', to: '#db2777' },
  { alt: 'Forest gradient', from: '#065f46', to: '#84cc16' },
  { alt: 'Ocean gradient', from: '#1e3a8a', to: '#38bdf8' },
  { alt: 'Ember gradient', from: '#7f1d1d', to: '#f59e0b' },
  { alt: 'Slate gradient', from: '#0f172a', to: '#64748b' },
]

const POSTS = [
  {
    title: 'Designing a token-first admin theme',
    excerpt: 'How semantic color roles keep light and dark mode in sync.',
    status: 'published',
    category: 0,
    difficulty: 'intermediate',
    featured: true,
  },
  {
    title: 'Shipping Payload 4 to production',
    excerpt: 'A checklist for upgrading a real project from v3.',
    status: 'published',
    category: 1,
    difficulty: 'advanced',
    featured: true,
  },
  {
    title: 'Why we moved our editorial team to folders',
    excerpt: 'Hierarchies changed how our editors find content.',
    status: 'published',
    category: 2,
    difficulty: 'beginner',
  },
  {
    title: 'Accessible contrast in dark interfaces',
    excerpt: 'Picking surface and text pairs that pass WCAG 2.2.',
    status: 'draft',
    category: 0,
    difficulty: 'intermediate',
  },
  {
    title: 'A week with the new dashboard widgets',
    excerpt: 'Resizable widgets for every role on the team.',
    status: 'published',
    category: 2,
    difficulty: 'beginner',
  },
  {
    title: 'Rich text blocks that editors actually like',
    excerpt: 'Lexical features we enable — and the ones we turn off.',
    status: 'draft',
    category: 1,
    difficulty: 'intermediate',
  },
  {
    title: 'Our brand refresh, behind the scenes',
    excerpt: 'From moodboard to tokens in three weeks.',
    status: 'published',
    category: 3,
    difficulty: 'beginner',
  },
  {
    title: 'Localization without the headaches',
    excerpt: 'Fallbacks, field-level locales and translation workflows.',
    status: 'published',
    category: 1,
    difficulty: 'advanced',
  },
  {
    title: 'Hiring: Senior Product Designer',
    excerpt: 'Join us to shape the editing experience.',
    status: 'draft',
    category: 3,
    difficulty: 'beginner',
  },
  {
    title: 'Measuring editor happiness',
    excerpt: 'The metrics we track after every admin release.',
    status: 'published',
    category: 2,
    difficulty: 'intermediate',
  },
  {
    title: 'Image workflows at scale',
    excerpt: 'Focal points, sizes and CDN caching for 40k assets.',
    status: 'published',
    category: 1,
    difficulty: 'advanced',
  },
  {
    title: 'Quarterly product update',
    excerpt: 'Everything we shipped this quarter.',
    status: 'draft',
    category: 3,
    difficulty: 'beginner',
  },
] as const

export async function seed(payload: Payload): Promise<void> {
  const existing = await payload.count({ collection: 'users' })
  if (existing.totalDocs > 0) return
  fs.rmSync(MEDIA_DIR, { recursive: true, force: true })

  const req = { context: { seeding: true } } as unknown as PayloadRequest
  const ctx = { context: { seeding: true }, req }

  const users = []
  const people: (Pick<User, 'name' | 'email' | 'role'> & { password?: string })[] = [
    { ...DEMO_USER, role: 'admin' },
    { name: 'Priya Shah', email: 'priya@example.com', role: 'editor' },
    { name: 'Jonas Weber', email: 'jonas@example.com', role: 'author' },
    { name: 'Maya Chen', email: 'maya@example.com', role: 'author' },
  ]
  for (const u of people) {
    users.push(
      await payload.create({
        collection: 'users',
        data: { ...u, password: u.password ?? randomUUID() },
        ...ctx,
      }),
    )
  }

  const folderNames = ['Blog', 'Landing pages', 'Brand assets']
  const folders = []
  for (const name of folderNames) {
    folders.push(await payload.create({ collection: 'folders', data: { name }, ...ctx }))
  }

  const categories = []
  for (const [title, description] of [
    ['Design', 'Visual design, theming and accessibility.'],
    ['Engineering', 'Infrastructure, performance and tooling.'],
    ['Product', 'Releases, research and roadmap.'],
    ['Company', 'News, hiring and culture.'],
  ]) {
    categories.push(
      await payload.create({ collection: 'categories', data: { title, description }, ...ctx }),
    )
  }

  const media = []
  for (const [i, m] of MEDIA.entries()) {
    const data = gradientSvg(m.from, m.to, m.alt.replace(' gradient', ''))
    media.push(
      await payload.create({
        collection: 'media',
        data: { alt: m.alt, _h_folders: folders[2].id },
        file: { data, mimetype: 'image/svg+xml', name: `cover-${i + 1}.svg`, size: data.length },
        ...ctx,
      }),
    )
  }

  const day = 24 * 60 * 60 * 1000
  for (const [i, p] of POSTS.entries()) {
    const published = p.status === 'published'
    await payload.create({
      collection: 'posts',
      draft: !published,
      data: {
        title: p.title,
        excerpt: p.excerpt,
        slug: p.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        heroImage: media[i % media.length].id,
        content: richText(
          paragraph(p.excerpt),
          heading('What changed'),
          paragraph(
            'Payload 4 ships a new design system built on semantic tokens, so a single variable can restyle a whole family of components in both color modes.',
          ),
          heading('Next steps', 'h3'),
          paragraph('Try the editor, export the CSS, and paste it into your project.'),
        ),
        readingTime: 3 + (i % 7),
        difficulty: p.difficulty,
        resources: [
          { label: 'Payload docs', url: 'https://payloadcms.com/docs' },
          { label: 'Migration guide', url: 'https://payloadcms.com/docs/migration-guide' },
        ],
        metaTitle: p.title,
        metaDescription: p.excerpt,
        publishedAt: published ? new Date(Date.now() - i * 3 * day).toISOString() : undefined,
        author: users[i % users.length].id,
        categories: [
          categories[p.category].id,
          ...(i % 3 === 0 ? [categories[(p.category + 1) % 4].id] : []),
        ],
        featured: 'featured' in p ? p.featured : false,
        _h_folders: folders[0].id,
        _status: published ? 'published' : 'draft',
      },
      ...ctx,
    })
  }

  for (const [i, title] of ['Home', 'Pricing', 'About us', 'Contact'].entries()) {
    await payload.create({
      collection: 'pages',
      draft: i === 3,
      data: {
        title,
        slug: i === 0 ? 'home' : title.toLowerCase().replace(/\s+/g, '-'),
        _h_folders: folders[1].id,
        _status: i === 3 ? 'draft' : 'published',
        layout: [
          {
            blockType: 'hero',
            heading: `${title} — built with Payload`,
            subheading: 'A themed admin that matches your brand.',
            image: media[i].id,
          },
          {
            blockType: 'content',
            body: richText(paragraph('Composable blocks keep layouts flexible.')),
          },
          { blockType: 'callToAction', label: 'Get started', url: '/editor', style: 'primary' },
        ],
      },
      ...ctx,
    })
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Northwind Studio',
      tagline: 'Content that ships itself',
      social: [
        { platform: 'github', url: 'https://github.com/payloadcms/payload' },
        { platform: 'x', url: 'https://x.com/payloadcms' },
      ],
    },
    ...ctx,
  })

  payload.logger.info('payloadtwist preview: demo content seeded')
}
