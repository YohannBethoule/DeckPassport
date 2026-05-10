import { requireAuth } from '#server/utils/auth'
import { NOTIFICATION_TYPE } from '#shared/schemas/notification'
import { db } from '#server/database'
import { playgroups, playgroupMembers } from '#server/database/schema'
import { eq } from 'drizzle-orm'
import { createPlaygroupNotifications } from '#server/utils/playgroupNotifications'

export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  const user = await requireAuth(event)
  const playgroupId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(playgroupId) || playgroupId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid playgroup ID' })
  }

  const group = await db.query.playgroups.findFirst({
    where: eq(playgroups.id, playgroupId)
  })

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: 'Playgroup not found' })
  }

  if (group.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can disband this playgroup' })
  }

  const members = await db.query.playgroupMembers.findMany({
    where: eq(playgroupMembers.playgroupId, playgroupId)
  })
  const toNotify = members.map(m => m.userId).filter(id => id !== user.id)

  await db.transaction(async (tx) => {
    await createPlaygroupNotifications(toNotify, NOTIFICATION_TYPE.PLAYGROUP_DISBANDED, playgroupId, user.id, null, tx, group.name)
    await tx.delete(playgroups).where(eq(playgroups.id, playgroupId))
  })

  return { success: true }
})
