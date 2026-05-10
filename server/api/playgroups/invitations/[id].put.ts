import { requireAuth } from '#server/utils/auth'
import { PLAYGROUP_INVITATION_STATUS, respondToPlaygroupInvitationSchema } from '#shared/schemas/playgroup'
import { NOTIFICATION_TYPE } from '#shared/schemas/notification'
import { db } from '#server/database'
import { playgroupInvitations, playgroupMembers } from '#server/database/schema'
import { and, eq } from 'drizzle-orm'
import { createPlaygroupNotifications } from '#server/utils/playgroupNotifications'

export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  const user = await requireAuth(event)
  const invitationId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(invitationId) || invitationId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invitation ID' })
  }

  const { status } = await readValidatedBody(event, body => respondToPlaygroupInvitationSchema.parseAsync(body))

  const invitation = await db.query.playgroupInvitations.findFirst({
    where: eq(playgroupInvitations.id, invitationId)
  })

  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found' })
  }

  if (invitation.receiverId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'You can\'t respond to this invitation' })
  }

  if (invitation.status !== PLAYGROUP_INVITATION_STATUS.PENDING) {
    throw createError({ statusCode: 409, statusMessage: 'Invitation has already been acted on' })
  }

  if (status === PLAYGROUP_INVITATION_STATUS.ACCEPTED) {
    await db.transaction(async (tx) => {
      const [updated] = await tx.update(playgroupInvitations)
        .set({ status: PLAYGROUP_INVITATION_STATUS.ACCEPTED, updatedAt: new Date() })
        .where(and(eq(playgroupInvitations.id, invitationId), eq(playgroupInvitations.status, PLAYGROUP_INVITATION_STATUS.PENDING)))
        .returning({ id: playgroupInvitations.id })

      if (!updated) {
        throw createError({ statusCode: 409, statusMessage: 'Invitation has already been acted on' })
      }

      await tx.insert(playgroupMembers)
        .values({ playgroupId: invitation.playgroupId, userId: user.id })
        .onConflictDoNothing()
    })

    const members = await db.query.playgroupMembers.findMany({
      where: eq(playgroupMembers.playgroupId, invitation.playgroupId)
    })
    const toNotify = members.map(m => m.userId).filter(id => id !== user.id)
    await createPlaygroupNotifications(
      toNotify,
      NOTIFICATION_TYPE.PLAYGROUP_MEMBER_JOINED,
      invitation.playgroupId,
      user.id
    )
  } else {
    const [updated] = await db.update(playgroupInvitations)
      .set({ status: PLAYGROUP_INVITATION_STATUS.REJECTED, updatedAt: new Date() })
      .where(and(eq(playgroupInvitations.id, invitationId), eq(playgroupInvitations.status, PLAYGROUP_INVITATION_STATUS.PENDING)))
      .returning({ id: playgroupInvitations.id })

    if (!updated) {
      throw createError({ statusCode: 409, statusMessage: 'Invitation has already been acted on' })
    }
  }

  return { success: true }
})
