import { requireAuth } from '#server/utils/auth'
import { inviteToPlaygroupSchema, PLAYGROUP_INVITATION_STATUS } from '#shared/schemas/playgroup'
import { NOTIFICATION_TYPE } from '#shared/schemas/notification'
import { db } from '#server/database'
import { playgroups, playgroupMembers, playgroupInvitations, friendships } from '#server/database/schema'
import { and, eq } from 'drizzle-orm'
import { PG_ERROR } from 'pg-error-codes-ts/lib/index.js'
import { createPlaygroupNotifications } from '#server/utils/playgroupNotifications'

export default defineEventHandler(async (event): Promise<number> => {
  const user = await requireAuth(event)
  const playgroupId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(playgroupId) || playgroupId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid playgroup ID' })
  }

  const { receiverId } = await readValidatedBody(event, body => inviteToPlaygroupSchema.parseAsync(body))

  if (receiverId === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'You can\'t invite yourself' })
  }

  const group = await db.query.playgroups.findFirst({
    where: eq(playgroups.id, playgroupId)
  })

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: 'Playgroup not found' })
  }

  if (group.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can invite members' })
  }

  const [friendship, existingMember] = await Promise.all([
    db.query.friendships.findFirst({
      where: and(eq(friendships.userId, user.id), eq(friendships.friendId, receiverId))
    }),
    db.query.playgroupMembers.findFirst({
      where: and(eq(playgroupMembers.playgroupId, playgroupId), eq(playgroupMembers.userId, receiverId))
    })
  ])

  if (!friendship) {
    throw createError({ statusCode: 403, statusMessage: 'You can only invite friends' })
  }

  if (existingMember) {
    throw createError({ statusCode: 409, statusMessage: 'This user is already a member' })
  }

  try {
    const [created] = await db.insert(playgroupInvitations)
      .values({ playgroupId, senderId: user.id, receiverId })
      .onConflictDoUpdate({
        target: [playgroupInvitations.playgroupId, playgroupInvitations.receiverId],
        set: { status: PLAYGROUP_INVITATION_STATUS.PENDING, senderId: user.id, updatedAt: new Date() }
      })
      .returning({ id: playgroupInvitations.id })

    await createPlaygroupNotifications(
      [receiverId],
      NOTIFICATION_TYPE.PLAYGROUP_INVITATION_RECEIVED,
      playgroupId,
      user.id,
      created!.id
    )

    return created!.id
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === PG_ERROR.FOREIGN_KEY_VIOLATION) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }
    throw err
  }
})
