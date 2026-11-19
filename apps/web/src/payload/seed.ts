import { randomUUID } from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import type { Payload } from 'payload'
import type { FieldShowcase, Post, User } from './payload-types'
import { articleDocument, everythingDocument, p as para, root } from './seed-richtext'

// Lexical's node union is generated per-config; Payload validates the JSON against the editor on create
const asRichText = (doc: unknown) => doc as NonNullable<Post['content']>

/** Upload dir for the in-memory demo; wiped on seed so files never pile up across restarts. */
export const MEDIA_DIR = path.join(os.tmpdir(), 'payloadtwist-preview-media')

export const DEMO_USER = {
  name: 'Alex Morgan',
  email: 'demo@payloadtwist.com',
  // Public on purpose: autoLogin into a read-only, in-memory demo.
  password: 'payloadtwist-preview',
}

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

  // Only a context (no shared req): Payload builds a fresh request per call, so a locale set on
  // one call can't leak into the next
  const ctx = { context: { seeding: true } }

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
        content: asRichText(articleDocument(p.excerpt, { media: media[i % media.length].id })),
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

  // Translations so the locale switcher (incl. RTL Arabic) shows real content
  const firstPost = (await payload.find({ collection: 'posts', sort: 'createdAt', limit: 1, ...ctx })).docs[0]
  if (firstPost) {
    await payload.update({
      collection: 'posts',
      id: firstPost.id,
      locale: 'fr',
      data: { title: 'Concevoir un thème d’administration par jetons', excerpt: 'Les rôles sémantiques gardent les modes clair et sombre synchronisés.' },
      ...ctx,
    })
    await payload.update({
      collection: 'posts',
      id: firstPost.id,
      locale: 'ar',
      data: { title: 'تصميم سمة إدارة قائمة على الرموز', excerpt: 'الأدوار الدلالية تبقي الوضعين الفاتح والداكن متزامنين.' },
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
            body: asRichText(root([para('Composable blocks keep layouts flexible.')])),
          },
          { blockType: 'callToAction', label: 'Get started', url: '/editor', style: 'primary' },
        ],
      },
      ...ctx,
    })
  }

  const showcase = await payload.create({
    collection: 'field-showcase',
    data: {
      title: 'Spring campaign launch',
      summary: 'Everything editors touch in a real project — every field type, in one document.',
      contactEmail: 'campaigns@northwind.example',
      priority: 2,
      rating: 4.5,
      keywords: ['launch', 'spring', 'newsletter'],
      scores: [72, 88, 95],
      internalId: 'CMP-2026-014',
      reviewNotes: 'Hero copy needs a final legal check.',
      status: 'review',
      channels: ['web', 'email', 'social'],
      audience: 'members',
      tone: 'friendly',
      featured: true,
      allowComments: true,
      publishAt: new Date(Date.now() + 5 * day).toISOString(),
      deadline: new Date(Date.now() + 3 * day).toISOString(),
      reminderTime: new Date().toISOString(),
      campaignMonth: new Date().toISOString(),
      location: [-0.1276, 51.5072],
      snippet: "export const launch = async () => {\n  await notify({ channel: 'email', audience: 'members' })\n}\n",
      styles: '.hero {\n  background: var(--color-bg-brand);\n  border-radius: var(--radius-large);\n}\n',
      metadata: { campaign: 'spring', budget: 12000, owners: ['priya', 'jonas'], live: false },
      owner: users[1].id,
      reviewer: users[0].id,
      dueDate: new Date(Date.now() + 2 * day).toISOString(),
      relatedPosts: [],
      cover: media[1].id,
      attachments: [media[2].id, media[3].id, media[4].id],
      sections: [
        { blockType: 'quote', quote: 'Shipping the theme took an afternoon, not a sprint.', attribution: 'Priya, Editor' },
        { blockType: 'stats', items: [{ value: 42, label: 'Articles' }, { value: 7, label: 'Authors' }, { value: 3, label: 'Locales' }] },
        { blockType: 'gallery', images: [media[0].id, media[5].id], layout: 'grid' },
      ],
      structure: {
        checklist: [
          { task: 'Write hero copy', done: true },
          { task: 'Legal review', done: false },
          { task: 'Schedule newsletter', done: false },
        ],
        seo: { title: 'Spring campaign — Northwind', description: 'Our biggest launch of the year.', noIndex: false },
        internalNote: 'Coordinate with the brand team.',
        cacheSeconds: 600,
        experimental: true,
      },
      _status: 'draft',
    },
    draft: true,
    ...ctx,
  })
  const posts = await payload.find({ collection: 'posts', limit: 2, ...ctx })
  const pages = await payload.find({ collection: 'pages', limit: 1, ...ctx })
  const everything = everythingDocument({
    media: media.map((m) => m.id),
    post: posts.docs[0].id,
    page: pages.docs[0].id,
    user: users[1].id,
  })
  const everythingPortable = everythingDocument(
    { media: media.map((m) => m.id), post: posts.docs[0].id, page: pages.docs[0].id, user: users[1].id },
    { portable: true },
  )
  await payload.update({
    collection: 'field-showcase',
    id: showcase.id,
    draft: true,
    data: {
      body: asRichText(everything) as FieldShowcase['body'],
      debugBody: asRichText(everythingPortable) as FieldShowcase['debugBody'],
      relatedPosts: posts.docs.map((d) => d.id),
      linkedContent: [
        ...posts.docs.slice(0, 1).map((d) => ({ relationTo: 'posts' as const, value: d.id })),
        ...pages.docs.map((d) => ({ relationTo: 'pages' as const, value: d.id })),
      ],
    },
    ...ctx,
  })

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
