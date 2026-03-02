'use client'

import { useRouter } from 'next/navigation'
import { PresetCard } from '@/components/presets/PresetCard'
import { PresetGrid } from '@/components/presets/PresetGrid'
import { deletePreset, updatePreset } from '@/lib/actions/presets'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface PresetRow {
  id: string
  name: string
  description: string | null
  themeData: PayloadThemeConfig
  isPublic: boolean
  averageRating: number
  ratingCount: number
}

export function DashboardClient({ presets }: { presets: PresetRow[] }) {
  const router = useRouter()

  if (presets.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--lp-text-muted)] mb-4">No presets yet</p>
        <a
          href="/editor"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Open the editor to create your first theme
        </a>
      </div>
    )
  }

  return (
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
          isPublic={preset.isPublic}
          isOwner
          onDelete={async () => {
            if (!confirm('Delete this preset?')) return
            await deletePreset(preset.id)
            router.refresh()
          }}
          onTogglePublic={async () => {
            await updatePreset(preset.id, { isPublic: !preset.isPublic })
            router.refresh()
          }}
        />
      ))}
    </PresetGrid>
  )
}
