import { db } from '#server/database'
import { friendRequests } from '#server/database/schema'
import { and, eq, or } from 'drizzle-orm'
import type { FriendRequestStatus } from '#shared/schemas/social'

export async function findFriendRequestFromUsers(userAID: string, userBID: string, status: FriendRequestStatus) {
  return db.query.friendRequests.findFirst({
    where: or(
      and(
        eq(friendRequests.senderId, userAID),
        eq(friendRequests.receiverId, userBID),
        eq(friendRequests.status, status)
      ),
      and(
        eq(friendRequests.senderId, userBID),
        eq(friendRequests.receiverId, userAID),
        eq(friendRequests.status, status)
      )
    )
  })
}
