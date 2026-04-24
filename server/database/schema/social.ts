import { relations } from 'drizzle-orm'
import { index, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { FRIEND_REQUEST_STATUS, FRIEND_REQUEST_STATUSES } from '../../../shared/schemas/social'

export const friendRequests = pgTable('friend_requests', {
  id: serial('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status', { enum: FRIEND_REQUEST_STATUSES }).notNull().default(FRIEND_REQUEST_STATUS.PENDING),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, table => [
  uniqueIndex('friend_requests_sender_receiver_idx').on(table.senderId, table.receiverId),
  index('friend_requests_receiver_id_idx').on(table.receiverId)
])

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
  sender: one(user, { fields: [friendRequests.senderId], references: [user.id], relationName: 'sentRequests' }),
  receiver: one(user, { fields: [friendRequests.receiverId], references: [user.id], relationName: 'receivedRequests' })
}))

export const friendships = pgTable('friendships', {
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  friendId: text('friend_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  primaryKey({ columns: [table.userId, table.friendId] }),
  index('friendships_user_id_idx').on(table.userId)
])

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  userRelation: one(user, { fields: [friendships.userId], references: [user.id], relationName: 'friendships' }),
  friendRelation: one(user, { fields: [friendships.friendId], references: [user.id], relationName: 'friendOf' })
}))
