'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, ArrowLeft, Copy, Palette } from 'lucide-react'
import { RatingStars } from '@/components/presets/RatingStars'
import { useSession } from '@/lib/auth-client'
import { generateExportCSS } from '@/payload-theme/generator'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface PresetData {
  id: string
  name: string
  description: string | null
  themeData: PayloadThemeConfig
  averageRating: number
  ratingCount: number
  isPublic: boolean
}

function ColorPalette({ themeData }: { themeData: PayloadThemeConfig }) {
  const scaleVars = [
    '--color-base-0',
    '--color-base-50',
    '--color-base-100',
    '--color-base-150',
    '--color-base-200',
    '--color-base-250',
    '--color-base-300',
    '--color-base-350',
    '--color-base-400',
    '--color-base-500',
    '--color-base-600',
    '--color-base-650',
    '--color-base-700',
    '--color-base-800',
    '--color-base-850',
    '--color-base-1000',
  ]
  const colors = scaleVars.map((v) => themeData.light[v]).filter(Boolean)

  return (
    <div className="flex rounded-lg overflow-hidden">
      {colors.map((color, i) => (
        <div key={i} className="h-10 flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
  )
}

export function PresetDetailClient({
  preset,
  userRating,
}: {
  preset: PresetData
  userRating: number | null
}) {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)

  const handleCopyCSS = async () => {
    const css = generateExportCSS(preset.themeData)
    try {
      await navigator.clipboard.writeText(css)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: open in new window
      const w = window.open('', '_blank')
      if (w) {
        w.document.body.style.margin = '0'
        w.document.body.style.padding = '1rem'
        w.document.body.style.fontFamily = 'monospace'
        w.document.body.style.whiteSpace = 'pre'
        w.document.body.textContent = css
      }
    }
  }

  return (
    <>
      <Link
        href="/presets"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-text)] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to gallery
      </Link>

      <h1
        className="text-2xl font-bold text-[var(--lp-text)] mb-2"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {preset.name}
      </h1>

      {preset.description && (
        <p className="text-sm text-[var(--lp-text-muted)] mb-6">{preset.description}</p>
      )}

      <div className="mb-6">
        <ColorPalette themeData={preset.themeData} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star
              size={16}
              className={
                preset.averageRating > 0
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-[var(--lp-text-faint)]'
              }
            />
            <span className="text-sm text-[var(--lp-text-muted)]">
              {preset.averageRating > 0 ? preset.averageRating.toFixed(1) : 'No ratings'}
              {preset.ratingCount > 0 && ` (${preset.ratingCount})`}
            </span>
          </div>
        </div>
      </div>

      {session && (
        <div className="mb-6 p-4 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)]">
          <p className="text-xs text-[var(--lp-text-muted)] mb-2">Your rating</p>
          <RatingStars presetId={preset.id} currentRating={userRating} />
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href={`/editor?preset=${preset.id}`}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white px-5 py-2.5 text-sm font-medium transition-all"
        >
          <Palette size={14} />
          Load into Editor
        </Link>
        <button
          onClick={handleCopyCSS}
          className="flex items-center gap-2 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] px-5 py-2.5 text-sm font-medium text-[var(--lp-text)] hover:bg-[var(--lp-surface-2)] transition-colors"
        >
          <Copy size={14} />
          {copied ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>
    </>
  )
}
