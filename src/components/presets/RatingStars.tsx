'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { ratePreset } from '@/lib/actions/presets'

interface RatingStarsProps {
  presetId: string
  currentRating: number | null
  readOnly?: boolean
}

export function RatingStars({ presetId, currentRating, readOnly }: RatingStarsProps) {
  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(currentRating ?? 0)
  const [submitting, setSubmitting] = useState(false)

  const handleRate = async (score: number) => {
    if (readOnly || submitting) return
    setSubmitting(true)
    setRating(score)
    try {
      await ratePreset(presetId, score)
    } catch {
      setRating(currentRating ?? 0)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hover > 0 ? star <= hover : star <= rating
        return (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={readOnly || submitting}
            className={`p-0.5 transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} disabled:opacity-70`}
          >
            <Star
              size={16}
              className={filled ? 'text-yellow-500 fill-yellow-500' : 'text-[var(--lp-text-faint)]'}
            />
          </button>
        )
      })}
    </div>
  )
}
