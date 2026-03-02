import { notFound } from 'next/navigation'
import { getPresetById, getUserRating } from '@/lib/actions/presets'
import { PresetDetailClient } from './preset-detail-client'
import { AppNavbar } from '@/components/AppNavbar'
import '../../landing.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const preset = await getPresetById(id)
  if (!preset) return { title: 'Preset not found' }
  return {
    title: preset.name,
    description: preset.description || `${preset.name} — a Payload CMS theme preset on payloadtwist.`,
    openGraph: {
      title: `${preset.name} | payloadtwist`,
      description: preset.description || `${preset.name} — a Payload CMS theme preset.`,
    },
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
      <div className="mx-auto max-w-2xl px-6 pt-24 pb-16">
        <PresetDetailClient preset={preset} userRating={userRating} />
      </div>
    </div>
  )
}
