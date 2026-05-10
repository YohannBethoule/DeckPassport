import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { playgroups, playgroupMembers } from '#server/database/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  const user = await requireAuth(event)
  const playgroupId = Number(getRouterParam(event, 'id'))
  const targetUserId = getRouterParam(event, 'userId')!

  if (!Number.isInteger(playgroupId) || playgroupId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid playgroup ID' })
  }

  const group = await db.query.playgroups.findFirst({
    where: eq(playgroups.id, playgroupId)
  })

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: 'Playgroup not found' })
  }

  const isOwner = group.ownerId === user.id
  const isSelf = targetUserId === user.id

  if (isOwner && isSelf) {
    throw createError({ statusCode: 400, statusMessage: 'The owner can\'t leave. Disband the playgroup instead.' })
  }

  if (!isOwner && !isSelf) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can remove other members' })
  }

  const [removed] = await db.delete(playgroupMembers)
    .where(and(eq(playgroupMembers.playgroupId, playgroupId), eq(playgroupMembers.userId, targetUserId)))
    .returning({ userId: playgroupMembers.userId })

  if (!removed) {
    throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  }

  return { success: true }
})
