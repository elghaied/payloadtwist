import { notFound } from 'next/navigation'
import { pageMetadata } from '@/lib/seo'
import { getPresetById, getUserRating } from '@/lib/actions/presets'
import { PresetDetailClient } from './preset-detail-client'
import { AppNavbar } from '@/components/AppNavbar'
import '../../landing.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const preset = await getPresetById(id)
  if (!preset) return { title: 'Preset not found', robots: { index: false } }
  return {
    ...pageMetadata({
      title: preset.name,
      description: preset.description || `${preset.name}: a Payload v4 admin theme shared on payloadtwist.`,
      path: `/presets/${preset.id}`,
    }),
    // a private preset is only visible to its owner
    ...(preset.isPublic ? {} : { robots: { index: false } }),
  }
}

export default async function PresetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const preset = await getPresetById(id)

  if (!preset || !preset.isPublic) {
    notFound()
  }

  const userRating = await getUserRating(preset.id)

  return (
    <div className="landing min-h-screen">
      <AppNavbar />
      <div id="main-content" className="mx-auto max-w-4xl px-6 pt-24 pb-16">
        <PresetDetailClient preset={preset} userRating={userRating} />
      </div>
    </div>
  )
}
