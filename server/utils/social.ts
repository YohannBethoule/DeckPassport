import { db } from '#server/database'
import { friendRequests } from '#server/database/schema'
import { and, eq, or } from 'drizzle-orm'
import type { FriendRequestStatus } from '#shared/schemas/social'

export async function findFriendRequestFromFriendship(senderId: string, receiverId: string, status: FriendRequestStatus) {
  return db.query.friendRequests.findFirst({
    where: or(
      and(
        eq(friendRequests.senderId, senderId),
        eq(friendRequests.receiverId, receiverId),
        eq(friendRequests.status, status)
      ),
      and(
        eq(friendRequests.senderId, receiverId),
        eq(friendRequests.receiverId, senderId),
        eq(friendRequests.status, status)
      )
    )
  })
}
