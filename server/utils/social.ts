import { db } from '#server/database'
import { friendRequests, friendRequestNotifications, notifications } from '#server/database/schema'
import { and, eq, or } from 'drizzle-orm'
import type { FriendRequestStatus } from '#shared/schemas/social'
import type { NotificationType } from '#shared/schemas/notification'

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

export async function createFriendRequestNotification(
  userId: string,
  actorId: string,
  type: NotificationType,
  requestId: number
): Promise<void> {
  await db.transaction(async (tx) => {
    const [inserted] = await tx.insert(notifications).values({ userId, type }).returning({ id: notifications.id })
    await tx.insert(friendRequestNotifications).values({ notificationId: inserted!.id, actorId, requestId })
  })
}
