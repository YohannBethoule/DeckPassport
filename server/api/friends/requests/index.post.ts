import { requireAuth } from '#server/utils/auth'
import { FRIEND_REQUEST_STATUS, sendFriendRequestSchema } from '#shared/schemas/social'
import { NOTIFICATION_TYPE } from '#shared/schemas/notification'
import { db } from '#server/database'
import { friendRequests, friendships } from '#server/database/schema'
import { PG_ERROR } from 'pg-error-codes-ts/lib/index.js'
import { and, eq } from 'drizzle-orm'
import { findFriendRequestFromUsers, createFriendRequestNotification } from '#server/utils/social'

export default defineEventHandler(async (event) => {
  const { receiverId } = await readValidatedBody(event, body => sendFriendRequestSchema.parseAsync(body))

  const user = await requireAuth(event)
  const userId = user.id

  if (userId === receiverId) {
    throw createError({
      status: 400,
      statusMessage: 'You can\'t send a friend request to yourself'
    })
  }

  const [friendshipExist, friendRequest] = await Promise.all([
    doesFriendshipExist(userId, receiverId),
    findFriendRequestFromUsers(userId, receiverId, FRIEND_REQUEST_STATUS.PENDING)
  ])
  if (friendshipExist) {
    throw createError({ statusCode: 409, statusMessage: 'You are already friends with this user' })
  }
  if (friendRequest) {
    throw createError({ statusCode: 409, statusMessage: 'Friend request already exists' })
  }

  try {
    const [created] = await db.insert(friendRequests).values({
      senderId: userId,
      receiverId
    }).onConflictDoUpdate({
      target: [friendRequests.senderId, friendRequests.receiverId],
      set: { status: FRIEND_REQUEST_STATUS.PENDING, updatedAt: new Date() }
    }).returning({ id: friendRequests.id })

    createFriendRequestNotification(receiverId, userId, NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED, created!.id).catch(console.error)

    return created!.id
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === PG_ERROR.FOREIGN_KEY_VIOLATION) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }
    throw err
  }
})

async function doesFriendshipExist(senderId: string, receiverId: string): Promise<boolean> {
  const friendship = await db.query.friendships.findFirst({
    where: and(eq(friendships.userId, senderId), eq(friendships.friendId, receiverId))
  })

  return !!friendship
}
