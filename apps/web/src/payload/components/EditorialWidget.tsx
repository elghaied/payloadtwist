import { Banner, Button, Pill } from '@payloadcms/ui'
import type { WidgetServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

import './preview-admin.css'

// Dashboard widget for the demo admin: real counts from the seeded content, rendered with
// native Payload components so brand, status and surface tokens all show on the dashboard.
export async function EditorialWidget({ req }: WidgetServerProps) {
  const { payload } = req
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
        <h2>Editorial overview</h2>
        <Pill pillStyle="light" rounded>
          This week
        </Pill>
      </header>
      <div className="pt-widget__stats">
        <div>
          <span className="pt-widget__value">{published.totalDocs}</span>
          <Pill pillStyle="success" rounded>
            Published
          </Pill>
        </div>
        <div>
          <span className="pt-widget__value">{drafts.totalDocs}</span>
          <Pill pillStyle="warning" rounded>
            Drafts
          </Pill>
        </div>
        <div>
          <span className="pt-widget__value">{featured.totalDocs}</span>
          <Pill pillStyle="dark" rounded>
            Featured
          </Pill>
        </div>
      </div>
      <Banner type="brand">Two drafts are waiting for review before Friday’s newsletter.</Banner>
      <div className="pt-widget__actions">
        <Button el="link" margin={false} to={postsURL}>
          Review posts
        </Button>
        <Button buttonStyle="secondary" el="link" margin={false} to={galleryURL}>
          Component gallery
        </Button>
      </div>
    </section>
  )
}
