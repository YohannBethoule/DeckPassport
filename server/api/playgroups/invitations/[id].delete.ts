import { requireAuth } from '#server/utils/auth'
import { PLAYGROUP_INVITATION_STATUS } from '#shared/schemas/playgroup'
import { db } from '#server/database'
import { notifications, playgroupInvitations, playgroupNotifications } from '#server/database/schema'
import { and, eq, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  const user = await requireAuth(event)
  const invitationId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(invitationId) || invitationId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invitation ID' })
  }

  const invitation = await db.query.playgroupInvitations.findFirst({
    where: eq(playgroupInvitations.id, invitationId)
  })

  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
  }

  if (invitation.senderId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the sender can cancel this invitation' })
  }

  if (invitation.status !== PLAYGROUP_INVITATION_STATUS.PENDING) {
    throw createError({ statusCode: 409, statusMessage: 'Invitation has already been acted on' })
  }

  await db.transaction(async (tx) => {
    const [updated] = await tx.update(playgroupInvitations)
      .set({ status: PLAYGROUP_INVITATION_STATUS.CANCELLED, updatedAt: new Date() })
      .where(and(eq(playgroupInvitations.id, invitationId), eq(playgroupInvitations.status, PLAYGROUP_INVITATION_STATUS.PENDING)))
      .returning({ id: playgroupInvitations.id })

    if (!updated) {
      throw createError({ statusCode: 409, statusMessage: 'Invitation has already been acted on' })
    }

    const linked = tx
      .select({ id: playgroupNotifications.notificationId })
      .from(playgroupNotifications)
      .where(eq(playgroupNotifications.invitationId, invitationId))

    await tx.delete(notifications)
      .where(and(eq(notifications.read, false), inArray(notifications.id, linked)))
  })

  return { success: true }
})
