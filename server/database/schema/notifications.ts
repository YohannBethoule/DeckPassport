import { relations } from 'drizzle-orm'
import { boolean, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { friendRequests } from './social'
import { NOTIFICATION_TYPES } from '../../../shared/schemas/notification'

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type', { enum: NOTIFICATION_TYPES }).notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  index('notifications_user_id_idx').on(table.userId),
  index('notifications_user_id_read_idx').on(table.userId, table.read)
])

export const friendRequestNotifications = pgTable('friend_request_notifications', {
  notificationId: integer('notification_id').primaryKey().references(() => notifications.id, { onDelete: 'cascade' }),
  actorId: text('actor_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  requestId: integer('request_id').references(() => friendRequests.id, { onDelete: 'set null' })
})

export const systemNotifications = pgTable('system_notifications', {
  notificationId: integer('notification_id').primaryKey().references(() => notifications.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  link: text('link')
})

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, { fields: [notifications.userId], references: [user.id] }),
  friendRequestNotification: one(friendRequestNotifications, {
    fields: [notifications.id],
    references: [friendRequestNotifications.notificationId]
  }),
  systemNotification: one(systemNotifications, {
    fields: [notifications.id],
    references: [systemNotifications.notificationId]
  })
}))

export const friendRequestNotificationsRelations = relations(friendRequestNotifications, ({ one }) => ({
  notification: one(notifications, {
    fields: [friendRequestNotifications.notificationId],
    references: [notifications.id]
  }),
  actor: one(user, { fields: [friendRequestNotifications.actorId], references: [user.id] }),
  request: one(friendRequests, { fields: [friendRequestNotifications.requestId], references: [friendRequests.id] })
}))

export const systemNotificationsRelations = relations(systemNotifications, ({ one }) => ({
  notification: one(notifications, {
    fields: [systemNotifications.notificationId],
    references: [notifications.id]
  })
}))
