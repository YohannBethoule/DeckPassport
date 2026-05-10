import { requireAuth } from '#server/utils/auth'
import { updatePlaygroupSchema } from '#shared/schemas/playgroup'
import { db } from '#server/database'
import { playgroups } from '#server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  const user = await requireAuth(event)
  const playgroupId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(playgroupId) || playgroupId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid playgroup ID' })
  }

  const { name } = await readValidatedBody(event, body => updatePlaygroupSchema.parseAsync(body))

  const group = await db.query.playgroups.findFirst({
    where: eq(playgroups.id, playgroupId)
  })

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: 'Playgroup not found' })
  }

  if (group.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can edit this playgroup' })
  }

  await db.update(playgroups)
    .set({ name, updatedAt: new Date() })
    .where(eq(playgroups.id, playgroupId))

  return { success: true }
})
