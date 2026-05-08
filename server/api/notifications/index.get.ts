import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { friendRequestNotifications, notifications, systemNotifications, user } from '#server/database/schema'
import { and, desc, eq } from 'drizzle-orm'
import { NOTIFICATION_TYPE, type AppNotification } from '#shared/schemas/notification'

export default defineEventHandler(async (event): Promise<AppNotification[]> => {
  const currentUser = await requireAuth(event)

  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      createdAt: notifications.createdAt,
      actorId: friendRequestNotifications.actorId,
      actorName: user.name,
      actorImage: user.image,
      requestId: friendRequestNotifications.requestId,
      title: systemNotifications.title,
      body: systemNotifications.body,
      link: systemNotifications.link
    })
    .from(notifications)
    .leftJoin(friendRequestNotifications, eq(friendRequestNotifications.notificationId, notifications.id))
    .leftJoin(user, eq(user.id, friendRequestNotifications.actorId))
    .leftJoin(systemNotifications, eq(systemNotifications.notificationId, notifications.id))
    .where(and(eq(notifications.userId, currentUser.id), eq(notifications.read, false)))
    .orderBy(desc(notifications.createdAt))
    .limit(20)

  return rows.map((row): AppNotification => {
    if (row.type === NOTIFICATION_TYPE.SYSTEM) {
      return {
        id: row.id,
        type: NOTIFICATION_TYPE.SYSTEM,
        createdAt: row.createdAt.toISOString(),
        title: row.title!,
        body: row.body!,
        link: row.link ?? null
      }
    }
    return {
      id: row.id,
      type: row.type as typeof NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED | typeof NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED,
      createdAt: row.createdAt.toISOString(),
      actor: row.actorId
        ? { id: row.actorId, name: row.actorName!, image: row.actorImage ?? null }
        : { id: '', name: 'Unknown', image: null },
      requestId: row.requestId ?? null
    }
  })
})
