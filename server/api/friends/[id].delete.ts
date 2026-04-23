import { requireAuth } from '#server/utils/auth'
import type { DbTransaction } from '#server/database'
import { db } from '#server/database'
import { findFriendRequestFromFriendship } from '#server/utils/social'
import { friendRequests, friendships } from '#server/database/schema'
import { and, eq, or } from 'drizzle-orm'
import { FRIEND_REQUEST_STATUS } from '#shared/schemas/social'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid friend ID' })
  }

  const user = await requireAuth(event)

  const request = await findFriendRequestFromFriendship(user.id, id, FRIEND_REQUEST_STATUS.ACCEPTED)

  if (!request) {
    throw createError({ statusCode: 404, statusMessage: 'No friendship found with this user' })
  }

  await db.transaction(async (tx) => {
    await tx.delete(friendships).where(
      or(
        and(
          eq(friendships.userId, user.id),
          eq(friendships.friendId, id)
        ), and(
          eq(friendships.friendId, user.id),
          eq(friendships.userId, id)
        )
      )
    )
    await resetFriendRequest(tx, request.id)
  })

  return { success: true }
})

async function resetFriendRequest(tx: DbTransaction, requestId: number) {
  await tx.update(friendRequests)
    .set({ status: FRIEND_REQUEST_STATUS.CANCELLED, updatedAt: new Date() })
    .where(eq(friendRequests.id, requestId))
}
