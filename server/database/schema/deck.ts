import { relations } from 'drizzle-orm'
import { integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { archetypes } from './archetype'
import { user } from './auth'
import { backgrounds } from './background'
import { brackets } from './bracket'
import { commanders } from './commander'

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  commanderId: integer('commander_id').notNull().references(() => commanders.id),
  partnerCommanderId: integer('partner_commander_id').references(() => commanders.id),
  backgroundId: integer('background_id').references(() => backgrounds.id),
  title: text('title').notNull(),
  bracketId: integer('bracket_id').notNull().references(() => brackets.id),
  description: text('description').notNull(),
  winCondition: text('win_condition').notNull(),
  coreCards: jsonb('core_cards').$type<{ name: string, imageUrl: string }[]>(),
  deckListUrl: text('deck_list_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const decksToArchetypes = pgTable('decks_to_archetypes', {
  deckId: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  archetypeId: integer('archetype_id').notNull().references(() => archetypes.id),
  order: integer('order').notNull()
})

export const decksToCommanderPrints = pgTable('decks_to_commander_prints', {
  deckId: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  commanderId: integer('commander_id').notNull().references(() => commanders.id),
  commanderPrintUri: text('commander_print_uri').notNull()
}, table => [
  primaryKey({ columns: [table.deckId, table.commanderId] })
])

export const decksToCommanderPrintsRelations = relations(decksToCommanderPrints, ({ one }) => ({
  deck: one(decks, { fields: [decksToCommanderPrints.deckId], references: [decks.id] }),
  commander: one(commanders, { fields: [decksToCommanderPrints.commanderId], references: [commanders.id] })
}))

export const decksToBackgroundPrints = pgTable('decks_to_background_prints', {
  deckId: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  backgroundId: integer('background_id').notNull().references(() => backgrounds.id),
  backgroundPrintUri: text('background_print_uri').notNull()
}, table => [
  primaryKey({ columns: [table.deckId, table.backgroundId] })
])

export const decksToBackgroundPrintsRelations = relations(decksToBackgroundPrints, ({ one }) => ({
  deck: one(decks, { fields: [decksToBackgroundPrints.deckId], references: [decks.id] }),
  background: one(backgrounds, { fields: [decksToBackgroundPrints.backgroundId], references: [backgrounds.id] })
}))

export const decksRelations = relations(decks, ({ one, many }) => ({
  archetypes: many(decksToArchetypes),
  commanderPrints: many(decksToCommanderPrints),
  backgroundPrints: many(decksToBackgroundPrints),
  bracket: one(brackets, { fields: [decks.bracketId], references: [brackets.id] }),
  commander: one(commanders, { fields: [decks.commanderId], references: [commanders.id], relationName: 'commander' }),
  partnerCommander: one(commanders, { fields: [decks.partnerCommanderId], references: [commanders.id], relationName: 'partnerCommander' }),
  background: one(backgrounds, { fields: [decks.backgroundId], references: [backgrounds.id] }),
  user: one(user, { fields: [decks.userId], references: [user.id] })
}))

export const decksToArchetypesRelations = relations(decksToArchetypes, ({ one }) => ({
  deck: one(decks, { fields: [decksToArchetypes.deckId], references: [decks.id] }),
  archetype: one(archetypes, { fields: [decksToArchetypes.archetypeId], references: [archetypes.id] })
}))
