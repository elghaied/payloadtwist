'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { presets, ratings } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { PayloadThemeConfig } from '@/payload-theme/types'

async function getSessionOrThrow() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function createPreset(data: {
  name: string
  description?: string
  themeData: PayloadThemeConfig
  isPublic?: boolean
}) {
  const session = await getSessionOrThrow()

  const name = data.name?.trim()
  if (!name || name.length > 100) throw new Error('Name is required and must be under 100 characters')
  if (data.description && data.description.length > 1000) throw new Error('Description must be under 1000 characters')
  if (!data.themeData || typeof data.themeData !== 'object') throw new Error('Invalid theme data')

  const [preset] = await db
    .insert(presets)
    .values({
      userId: session.user.id,
      name,
      description: data.description?.trim() || '',
      themeData: data.themeData,
      isPublic: data.isPublic ?? false,
    })
    .returning()

  revalidatePath('/dashboard')
  revalidatePath('/presets')
  return preset
}

export async function updatePreset(
  id: string,
  data: {
    name?: string
    description?: string
    themeData?: PayloadThemeConfig
    isPublic?: boolean
  },
) {
  const session = await getSessionOrThrow()

  const [existing] = await db.select().from(presets).where(eq(presets.id, id)).limit(1)
  if (!existing || existing.userId !== session.user.id) {
    throw new Error('Not found or unauthorized')
  }

  if (data.name !== undefined) {
    const name = data.name.trim()
    if (!name || name.length > 100) throw new Error('Name is required and must be under 100 characters')
  }
  if (data.description !== undefined && data.description.length > 1000) {
    throw new Error('Description must be under 1000 characters')
  }

  const [updated] = await db
    .update(presets)
    .set({
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.themeData !== undefined && { themeData: data.themeData }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      updatedAt: new Date(),
    })
    .where(eq(presets.id, id))
    .returning()

  revalidatePath('/dashboard')
  revalidatePath('/presets')
  revalidatePath(`/presets/${id}`)
  return updated
}

export async function deletePreset(id: string) {
  const session = await getSessionOrThrow()

  const [existing] = await db.select().from(presets).where(eq(presets.id, id)).limit(1)
  if (!existing || existing.userId !== session.user.id) {
    throw new Error('Not found or unauthorized')
  }

  await db.delete(presets).where(eq(presets.id, id))

  revalidatePath('/dashboard')
  revalidatePath('/presets')
}

export async function ratePreset(presetId: string, score: number) {
  if (!presetId || typeof presetId !== 'string') throw new Error('Invalid preset ID')
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error('Score must be integer 1-5')

  const session = await getSessionOrThrow()

  // Upsert the rating
  await db
    .insert(ratings)
    .values({
      userId: session.user.id,
      presetId,
      score,
    })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.presetId],
      set: { score },
    })

  // Recalculate denormalized average
  const [stats] = await db
    .select({
      avg: sql<number>`avg(${ratings.score})::real`,
      count: sql<number>`count(*)::int`,
    })
    .from(ratings)
    .where(eq(ratings.presetId, presetId))

  await db
    .update(presets)
    .set({
      averageRating: stats.avg || 0,
      ratingCount: stats.count || 0,
    })
    .where(eq(presets.id, presetId))

  revalidatePath('/presets')
  revalidatePath(`/presets/${presetId}`)
}

export async function getMyPresets() {
  const session = await getSessionOrThrow()

  return db
    .select()
    .from(presets)
    .where(eq(presets.userId, session.user.id))
    .orderBy(desc(presets.updatedAt))
}

export async function getPublicPresets(opts?: { limit?: number; offset?: number }) {
  const limit = opts?.limit ?? 24
  const offset = opts?.offset ?? 0

  return db
    .select()
    .from(presets)
    .where(eq(presets.isPublic, true))
    .orderBy(desc(presets.averageRating), desc(presets.updatedAt))
    .limit(limit)
    .offset(offset)
}

export async function getPresetById(id: string) {
  const [preset] = await db.select().from(presets).where(eq(presets.id, id)).limit(1)
  return preset || null
}

export async function getUserRating(presetId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const [rating] = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.userId, session.user.id), eq(ratings.presetId, presetId)))
    .limit(1)

  return rating?.score ?? null
}
