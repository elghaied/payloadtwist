import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // the demo admin and its API, auth endpoints, and signed-in pages
        disallow: ['/preview/', '/preview-api/', '/api/', '/dashboard/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
