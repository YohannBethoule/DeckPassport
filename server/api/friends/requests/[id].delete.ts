import { requireAuth } from '#server/utils/auth'
import type { DbTransaction } from '#server/database'
import { db } from '#server/database'
import { friendRequests } from '#server/database/schema'
import { eq } from 'drizzle-orm'
import { FRIEND_REQUEST_STATUS } from '#shared/schemas/social'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid friend request ID' })
  }

  const user = await requireAuth(event)
  await cancelFriendRequest(db, id, user.id)

  return { success: true }
})

async function cancelFriendRequest(tx: typeof db | DbTransaction, requestId: number, userId: string) {
  const [existing] = await tx.select({ senderId: friendRequests.senderId, status: friendRequests.status })
    .from(friendRequests)
    .where(eq(friendRequests.id, requestId))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Friend request not found' })
  }

  if (existing.senderId !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'You can only cancel your own requests' })
  }

  if (existing.status !== FRIEND_REQUEST_STATUS.PENDING) {
    throw createError({ statusCode: 409, statusMessage: 'You can only cancel pending requests' })
  }

  await tx.update(friendRequests).set({
    status: FRIEND_REQUEST_STATUS.CANCELLED,
    updatedAt: new Date()
  }).where(eq(friendRequests.id, requestId))
}
