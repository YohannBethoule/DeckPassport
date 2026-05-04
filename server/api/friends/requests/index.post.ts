import { requireAuth } from '#server/utils/auth'
import { FRIEND_REQUEST_STATUS, sendFriendRequestSchema } from '#shared/schemas/social'
import { db } from '#server/database'
import { friendRequests, friendships } from '#server/database/schema'
import { PG_ERROR } from 'pg-error-codes-ts/lib'
import { and, eq } from 'drizzle-orm'
import { findFriendRequestFromFriendship } from '#server/utils/social'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = await sendFriendRequestSchema.parseAsync(body)
  const { receiverId } = result

  const user = await requireAuth(event)
  const userId = user.id

  if (userId === receiverId) {
    throw createError({
      status: 400,
      statusText: 'You can\'t send a friend request to yourself'
    })
  }

  const [friendshipExist, friendRequest] = await Promise.all([
    doesFriendshipExist(userId, receiverId),
    findFriendRequestFromFriendship(userId, receiverId, FRIEND_REQUEST_STATUS.PENDING)
  ])
  if (friendshipExist) {
    throw createError({ statusCode: 409, statusText: 'You are already social with this user' })
  }
  if (friendRequest) {
    throw createError({ statusCode: 409, statusText: 'Friend request already exists' })
  }

  try {
    const [created] = await db.insert(friendRequests).values({
      senderId: userId,
      receiverId
    }).onConflictDoUpdate({
      target: [friendRequests.senderId, friendRequests.receiverId],
      set: { status: FRIEND_REQUEST_STATUS.PENDING, updatedAt: new Date() }
    }).returning({ id: friendRequests.id })
    return created!.id
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === PG_ERROR.FOREIGN_KEY_VIOLATION) {
      throw createError({ statusCode: 404, statusText: 'User not found' })
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
