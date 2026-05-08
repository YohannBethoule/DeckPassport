import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { notifications } from '#server/database/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const notificationId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(notificationId) || notificationId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid notification ID' })
  }

  const currentUser = await requireAuth(event)

  const [updated] = await db.update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, currentUser.id)))
    .returning({ id: notifications.id })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Notification not found' })
  }

  return { success: true }
})
