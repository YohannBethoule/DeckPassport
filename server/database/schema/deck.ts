import { relations } from 'drizzle-orm'
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { backgrounds } from './background'
import { brackets } from './bracket'
import { commanders } from './commander'

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  commanderId: integer('commander_id').notNull().references(() => commanders.id),
  partnerCommanderId: integer('partner_commander_id').references(() => commanders.id),
  backgroundId: integer('background_id').references(() => backgrounds.id),
  title: text('title').notNull(),
  bracketId: integer('bracket_id').notNull().references(() => brackets.id),
  description: text('description').notNull(),
  winCondition: text('win_condition').notNull(),
  coreCards: text('core_cards'),
  deckListUrl: text('deck_list_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const decksRelations = relations(decks, ({ one }) => ({
  bracket: one(brackets, { fields: [decks.bracketId], references: [brackets.id] }),
  commander: one(commanders, { fields: [decks.commanderId], references: [commanders.id], relationName: 'commander' }),
  partnerCommander: one(commanders, { fields: [decks.partnerCommanderId], references: [commanders.id], relationName: 'partnerCommander' }),
  background: one(backgrounds, { fields: [decks.backgroundId], references: [backgrounds.id] })
}))
