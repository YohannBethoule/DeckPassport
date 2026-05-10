import { relations } from 'drizzle-orm'
import { index, integer, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { PLAYGROUP_INVITATION_STATUS, PLAYGROUP_INVITATION_STATUSES } from '../../../shared/schemas/playgroup'

export const playgroups = pgTable('playgroups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url'),
  ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const playgroupMembers = pgTable('playgroup_members', {
  playgroupId: integer('playgroup_id').notNull().references(() => playgroups.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull()
}, table => [
  primaryKey({ columns: [table.playgroupId, table.userId] }),
  index('playgroup_members_user_id_idx').on(table.userId)
])

export const playgroupInvitations = pgTable('playgroup_invitations', {
  id: serial('id').primaryKey(),
  playgroupId: integer('playgroup_id').notNull().references(() => playgroups.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status', { enum: PLAYGROUP_INVITATION_STATUSES }).notNull().default(PLAYGROUP_INVITATION_STATUS.PENDING),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, table => [
  uniqueIndex('playgroup_invitations_playgroup_receiver_idx').on(table.playgroupId, table.receiverId),
  index('playgroup_invitations_receiver_id_idx').on(table.receiverId)
])

export const playgroupsRelations = relations(playgroups, ({ one, many }) => ({
  owner: one(user, { fields: [playgroups.ownerId], references: [user.id], relationName: 'ownedPlaygroups' }),
  members: many(playgroupMembers),
  invitations: many(playgroupInvitations)
}))

export const playgroupMembersRelations = relations(playgroupMembers, ({ one }) => ({
  playgroup: one(playgroups, { fields: [playgroupMembers.playgroupId], references: [playgroups.id] }),
  userRelation: one(user, { fields: [playgroupMembers.userId], references: [user.id], relationName: 'playgroupMemberships' })
}))

export const playgroupInvitationsRelations = relations(playgroupInvitations, ({ one }) => ({
  playgroup: one(playgroups, { fields: [playgroupInvitations.playgroupId], references: [playgroups.id] }),
  sender: one(user, { fields: [playgroupInvitations.senderId], references: [user.id], relationName: 'sentPlaygroupInvitations' }),
  receiver: one(user, { fields: [playgroupInvitations.receiverId], references: [user.id], relationName: 'receivedPlaygroupInvitations' })
}))
