import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { and, eq } from 'drizzle-orm'
import { friendRequests } from '#server/database/schema'
import type { FriendRequestType } from '#shared/schemas/social'
import { FRIEND_REQUEST_STATUS, FRIEND_REQUEST_TYPE, friendRequestsSchema } from '#shared/schemas/social'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, query => friendRequestsSchema.parse(query))

  const user = await requireAuth(event)

  return await findFriendRequests(user.id, query.type)
})

async function findFriendRequests(userId: string, type: FriendRequestType) {
  if (type === FRIEND_REQUEST_TYPE.SENT) {
    return db.query.friendRequests.findMany({
      where: and(
        eq(friendRequests.senderId, userId),
        eq(friendRequests.status, FRIEND_REQUEST_STATUS.PENDING)
      ),
      with: { receiver: { columns: { id: true, name: true, image: true } } }
    })
  }
  return db.query.friendRequests.findMany({
    where: and(
      eq(friendRequests.receiverId, userId),
      eq(friendRequests.status, FRIEND_REQUEST_STATUS.PENDING)
    ),
    with: { sender: { columns: { id: true, name: true, image: true } } }
  })
}
