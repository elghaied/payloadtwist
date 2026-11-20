import { Banner, Button, Pill } from '@payloadcms/ui'
import type { WidgetServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

import './preview-admin.css'

const COPY = {
  en: { title: 'Editorial overview', week: 'This week', published: 'Published', drafts: 'Drafts', featured: 'Featured', banner: 'Two drafts are waiting for review before Friday’s newsletter.', review: 'Review posts', gallery: 'Component gallery' },
  fr: { title: 'Aperçu éditorial', week: 'Cette semaine', published: 'Publiés', drafts: 'Brouillons', featured: 'À la une', banner: 'Deux brouillons attendent une relecture avant la newsletter de vendredi.', review: 'Relire les articles', gallery: 'Galerie des composants' },
  ar: { title: 'نظرة تحريرية', week: 'هذا الأسبوع', published: 'منشورة', drafts: 'مسودات', featured: 'مميزة', banner: 'مسودتان بانتظار المراجعة قبل نشرة يوم الجمعة.', review: 'مراجعة المقالات', gallery: 'معرض المكوّنات' },
}

// Dashboard widget for the demo admin: real counts from the seeded content, rendered with
// native Payload components so brand, status and surface tokens all show on the dashboard.
export async function EditorialWidget({ req }: WidgetServerProps) {
  const { payload } = req
  const c = COPY[req.i18n.language as keyof typeof COPY] ?? COPY.en
  const [published, drafts, featured] = await Promise.all([
    payload.count({ collection: 'posts', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'posts', where: { featured: { equals: true } } }),
  ])
  const postsURL = formatAdminURL({
    adminRoute: payload.config.routes.admin,
    path: '/collections/posts',
  })
  const galleryURL = formatAdminURL({ adminRoute: payload.config.routes.admin, path: '/gallery' })

  return (
    <section className="pt-widget">
      <header className="pt-widget__header">
        <h2>{c.title}</h2>
        <Pill pillStyle="light" rounded>
          {c.week}
        </Pill>
      </header>
      <div className="pt-widget__stats">
        <div>
          <span className="pt-widget__value">{published.totalDocs}</span>
          <Pill pillStyle="success" rounded>
            {c.published}
          </Pill>
        </div>
        <div>
          <span className="pt-widget__value">{drafts.totalDocs}</span>
          <Pill pillStyle="warning" rounded>
            {c.drafts}
          </Pill>
        </div>
        <div>
          <span className="pt-widget__value">{featured.totalDocs}</span>
          <Pill pillStyle="dark" rounded>
            {c.featured}
          </Pill>
        </div>
      </div>
      <Banner type="brand">{c.banner}</Banner>
      <div className="pt-widget__actions">
        <Button el="link" margin={false} to={postsURL}>
          {c.review}
        </Button>
        <Button buttonStyle="secondary" el="link" margin={false} to={galleryURL}>
          {c.gallery}
        </Button>
      </div>
    </section>
  )
}
