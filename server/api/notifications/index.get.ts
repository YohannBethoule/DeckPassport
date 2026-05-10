import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { friendRequestNotifications, notifications, playgroupNotifications, systemNotifications, user, playgroups } from '#server/database/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { NOTIFICATION_TYPE, type AppNotification } from '#shared/schemas/notification'

const PLAYGROUP_NOTIFICATION_TYPES = [
  NOTIFICATION_TYPE.PLAYGROUP_INVITATION_RECEIVED,
  NOTIFICATION_TYPE.PLAYGROUP_MEMBER_JOINED,
  NOTIFICATION_TYPE.PLAYGROUP_DISBANDED
] as const

export default defineEventHandler(async (event): Promise<AppNotification[]> => {
  const currentUser = await requireAuth(event)

  const pgActor = alias(user, 'pg_actor')

  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      createdAt: notifications.createdAt,
      // friend request fields
      actorId: friendRequestNotifications.actorId,
      actorName: user.name,
      actorImage: user.image,
      requestId: friendRequestNotifications.requestId,
      // system fields
      title: systemNotifications.title,
      body: systemNotifications.body,
      link: systemNotifications.link,
      // playgroup fields
      pgPlaygroupId: playgroupNotifications.playgroupId,
      pgPlaygroupName: sql<string | null>`COALESCE(${playgroupNotifications.playgroupName}, ${playgroups.name})`,
      pgActorId: playgroupNotifications.actorId,
      pgActorName: pgActor.name,
      pgActorImage: pgActor.image,
      pgInvitationId: playgroupNotifications.invitationId
    })
    .from(notifications)
    .leftJoin(friendRequestNotifications, eq(friendRequestNotifications.notificationId, notifications.id))
    .leftJoin(user, eq(user.id, friendRequestNotifications.actorId))
    .leftJoin(systemNotifications, eq(systemNotifications.notificationId, notifications.id))
    .leftJoin(playgroupNotifications, eq(playgroupNotifications.notificationId, notifications.id))
    .leftJoin(playgroups, eq(playgroups.id, playgroupNotifications.playgroupId))
    .leftJoin(pgActor, eq(pgActor.id, playgroupNotifications.actorId))
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
    if ((PLAYGROUP_NOTIFICATION_TYPES as readonly string[]).includes(row.type)) {
      return {
        id: row.id,
        type: row.type as typeof PLAYGROUP_NOTIFICATION_TYPES[number],
        createdAt: row.createdAt.toISOString(),
        playgroupId: row.pgPlaygroupId ?? null,
        playgroupName: row.pgPlaygroupName ?? null,
        actor: row.pgActorId ? { id: row.pgActorId, name: row.pgActorName!, image: row.pgActorImage ?? null } : null,
        invitationId: row.pgInvitationId ?? null
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
