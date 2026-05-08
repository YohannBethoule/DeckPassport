import { requireAuth } from '#server/utils/auth'
import { findFriendRequestFromUsers } from '#server/utils/social'
import type { FriendshipStatusResponse } from '#shared/schemas/social'
import { FRIEND_REQUEST_STATUS, FRIENDSHIP_STATUS } from '#shared/schemas/social'
import { db } from '#server/database'
import { friendships } from '#server/database/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event): Promise<FriendshipStatusResponse> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })
  }

  const user = await requireAuth(event)

  const friendship = await db.query.friendships.findFirst({
    where: and(
      eq(friendships.userId, user.id),
      eq(friendships.friendId, id)
    )
  })

  if (friendship) {
    return { status: FRIENDSHIP_STATUS.FRIENDS }
  }

  const friendRequest = await findFriendRequestFromUsers(user.id, id, FRIEND_REQUEST_STATUS.PENDING)
  if (!friendRequest) {
    return { status: FRIENDSHIP_STATUS.NONE }
  }
  return {
    status: friendRequest.senderId === user.id ? FRIENDSHIP_STATUS.REQUEST_SENT : FRIENDSHIP_STATUS.REQUEST_RECEIVED,
    requestId: friendRequest.id
  }
})
