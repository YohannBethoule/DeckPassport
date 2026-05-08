import { requireAuth } from '#server/utils/auth'
import { FRIEND_REQUEST_STATUS, respondToFriendRequestSchema } from '#shared/schemas/social'
import { NOTIFICATION_TYPE } from '#shared/schemas/notification'
import { db } from '#server/database'
import { friendRequests, friendships } from '#server/database/schema'
import type { InferSelectModel } from 'drizzle-orm'
import { and, eq } from 'drizzle-orm'
import { createFriendRequestNotification } from '#server/utils/social'

type FriendRequest = InferSelectModel<typeof friendRequests>

export default defineEventHandler(async (event) => {
  const requestId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(requestId) || requestId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request ID' })
  }

  const { status } = await readValidatedBody(event, body => respondToFriendRequestSchema.parseAsync(body))

  const user = await requireAuth(event)

  const request = await db.query.friendRequests.findFirst({
    where: eq(friendRequests.id, requestId)
  })
  await validateFriendRequest(request, user.id)

  switch (status) {
    case FRIEND_REQUEST_STATUS.ACCEPTED:
      await acceptFriendRequest(requestId, request!.senderId, user.id)
      break
    case FRIEND_REQUEST_STATUS.REJECTED:
      await declineFriendRequest(requestId)
      break
  }

  return { success: true }
})

async function validateFriendRequest(request: FriendRequest | undefined, userId: string) {
  if (!request) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Friend request not found'
    })
  }

  if (request.status !== FRIEND_REQUEST_STATUS.PENDING) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Friend request has already been acted on'
    })
  }

  if (request.receiverId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can\'t update this request'
    })
  }
}

async function acceptFriendRequest(id: number, senderId: string, receiverId: string) {
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(friendRequests)
      .set({ status: FRIEND_REQUEST_STATUS.ACCEPTED, updatedAt: new Date() })
      .where(and(eq(friendRequests.id, id), eq(friendRequests.status, FRIEND_REQUEST_STATUS.PENDING)))
      .returning({ id: friendRequests.id })

    if (!updated) {
      throw createError({ statusCode: 409, statusMessage: 'Friend request has already been acted on' })
    }

    // onConflictDoNothing handles the case where both users sent each other a request simultaneously
    // and the friendship was already created when the other request was accepted
    await tx.insert(friendships)
      .values([{ userId: senderId, friendId: receiverId }, { userId: receiverId, friendId: senderId }])
      .onConflictDoNothing()
  })

  createFriendRequestNotification(senderId, receiverId, NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED, id).catch(console.error)
}

async function declineFriendRequest(id: number) {
  const [updated] = await db.update(friendRequests)
    .set({ status: FRIEND_REQUEST_STATUS.REJECTED, updatedAt: new Date() })
    .where(and(eq(friendRequests.id, id), eq(friendRequests.status, FRIEND_REQUEST_STATUS.PENDING)))
    .returning({ id: friendRequests.id })

  if (!updated) {
    throw createError({ statusCode: 409, statusMessage: 'Friend request has already been acted on' })
  }
}
