import type { MetadataRoute } from 'next'
import { getPublicPresets } from '@/lib/actions/presets'
import { SITE_URL } from '@/lib/seo'

// Rebuilt hourly at runtime: the build has no database, so shared themes appear after the first revalidation
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/editor`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/presets`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ]
  try {
    const shared = await getPublicPresets({ limit: 1000 })
    return [
      ...pages,
      ...shared.map((p) => ({ url: `${SITE_URL}/presets/${p.id}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ]
  } catch {
    return pages
  }
}
