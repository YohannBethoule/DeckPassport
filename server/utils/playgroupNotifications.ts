import { db } from '#server/database'
import type { DbTransaction } from '#server/database'
import { notifications, playgroupNotifications } from '#server/database/schema'
import type { NotificationType } from '#shared/schemas/notification'

export async function createPlaygroupNotifications(
  userIds: string[],
  type: NotificationType,
  playgroupId: number | null,
  actorId: string | null,
  invitationId: number | null = null,
  dbOrTx: typeof db | DbTransaction = db,
  playgroupName: string | null = null
): Promise<void> {
  if (userIds.length === 0) return

  const inserted = await dbOrTx
    .insert(notifications)
    .values(userIds.map(userId => ({ userId, type })))
    .returning({ id: notifications.id })

  await dbOrTx.insert(playgroupNotifications).values(
    inserted.map(n => ({
      notificationId: n.id,
      playgroupId,
      playgroupName,
      actorId,
      invitationId
    }))
  )
}
