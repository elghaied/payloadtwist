'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, ArrowLeft, Copy, Palette } from 'lucide-react'
import { RatingStars } from '@/components/presets/RatingStars'
import { useSession } from '@/lib/auth-client'
import { ThemePreviewFrame } from '@/components/presets/ThemePreviewFrame'
import { ThemeSwatches } from '@/components/presets/ThemeSwatches'
import { buildThemeCss } from '@/payload-theme/css'
import { parseTheme, type ThemeConfig } from '@/payload-theme/theme'

interface PresetData {
  id: string
  name: string
  description: string | null
  themeData: ThemeConfig
  averageRating: number
  ratingCount: number
  isPublic: boolean
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
    const css = buildThemeCss(parseTheme(preset.themeData))
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
        <ThemeSwatches themeData={preset.themeData} size="lg" />
      </div>

      <div className="mb-6">
        <ThemePreviewFrame theme={parseTheme(preset.themeData)} />
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
