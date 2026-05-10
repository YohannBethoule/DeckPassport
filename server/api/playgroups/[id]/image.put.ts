import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { playgroups } from '#server/database/schema'
import { eq } from 'drizzle-orm'
import { uploadToR2, deleteFromR2 } from '#server/utils/r2'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const EXT_MAP: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export default defineEventHandler(async (event): Promise<{ imageUrl: string }> => {
  const user = await requireAuth(event)
  const playgroupId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(playgroupId) || playgroupId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid playgroup ID' })
  }

  const group = await db.query.playgroups.findFirst({ where: eq(playgroups.id, playgroupId) })
  if (!group) throw createError({ statusCode: 404, statusMessage: 'Playgroup not found' })
  if (group.ownerId !== user.id) throw createError({ statusCode: 403, statusMessage: 'Only the owner can update this playgroup' })

  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'image')

  if (!file?.data) throw createError({ statusCode: 400, statusMessage: 'No image provided' })
  if (!ALLOWED_TYPES.includes(file.type ?? '')) throw createError({ statusCode: 400, statusMessage: 'Invalid file type. Use JPEG, PNG, or WebP.' })
  if (file.data.length > MAX_SIZE) throw createError({ statusCode: 400, statusMessage: 'Image must be under 5MB' })

  if (group.imageUrl) {
    try {
      await deleteFromR2(group.imageUrl)
    } catch { /* empty */ }
  }

  const ext = EXT_MAP[file.type!]
  const key = `playgroups/${playgroupId}/${Date.now()}.${ext}`
  const imageUrl = await uploadToR2(key, file.data, file.type!)

  await db.update(playgroups)
    .set({ imageUrl, updatedAt: new Date() })
    .where(eq(playgroups.id, playgroupId))

  return { imageUrl }
})
