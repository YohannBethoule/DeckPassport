import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { notifications } from '#server/database/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)

  await db.update(notifications)
    .set({ read: true })
    .where(and(
      eq(notifications.userId, currentUser.id),
      eq(notifications.read, false)))

  return { success: true }
})
