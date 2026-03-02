import Link from 'next/link'
import { getPublicPresets } from '@/lib/actions/presets'
import { PresetCard } from '@/components/presets/PresetCard'
import { PresetGrid } from '@/components/presets/PresetGrid'
import '../landing.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Theme Gallery — payloadtwist',
}

export default async function PresetsGalleryPage() {
  const presets = await getPublicPresets()

  return (
    <div className="landing min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-[var(--lp-text)]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Theme Gallery
          </h1>
          <p className="text-sm text-[var(--lp-text-muted)] mt-1">
            Community-created Payload CMS themes
          </p>
        </div>

        {presets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--lp-text-muted)] mb-4">No public presets yet</p>
            <Link
              href="/editor"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Be the first to create and share a theme
            </Link>
          </div>
        ) : (
          <PresetGrid>
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                description={preset.description}
                themeData={preset.themeData}
                averageRating={preset.averageRating}
                ratingCount={preset.ratingCount}
                isPublic
              />
            ))}
          </PresetGrid>
        )}
      </div>
    </div>
  )
}
