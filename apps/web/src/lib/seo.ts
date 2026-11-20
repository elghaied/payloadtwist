import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://payloadtwist.com'

export const SITE_DESCRIPTION =
  'A visual theme editor for the Payload v4 admin. Start from a look, change colors, shape, spacing, fonts or a single component on a live admin, and export custom.css or an installable theme.'

// ?v= busts social platforms' cache of the previous image
const OG_IMAGE = {
  url: '/og.png?v=3',
  width: 1200,
  height: 630,
  alt: 'payloadtwist: your brand, all the way into the admin. A Payload v4 admin wearing two payloadtwist themes.',
}

/**
 * Page metadata with share cards and a canonical URL. Next replaces (not merges) `openGraph` and
 * `twitter` per page, so every page goes through this to keep the image and site name.
 */
export function pageMetadata({ title, description, path }: { title?: string; description?: string; path: string }): Metadata {
  const shareTitle = title ? `${title} | payloadtwist` : 'payloadtwist — Visual Theme Editor for Payload CMS'
  const shareDescription = description ?? SITE_DESCRIPTION
  return {
    ...(title ? { title } : {}),
    description: shareDescription,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'payloadtwist',
      title: shareTitle,
      description: shareDescription,
      url: path,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description: shareDescription, images: [OG_IMAGE.url] },
  }
}
