import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { commanders } from './commander'

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  commanderId: integer('commander_id').notNull().references(() => commanders.id),
  partnerCommanderId: integer('partner_commander_id').references(() => commanders.id),
  title: text('title').notNull(),
  bracket: integer('bracket').notNull(),
  description: text('description').notNull(),
  winCondition: text('win_condition').notNull(),
  coreCards: text('core_cards'),
  deckListUrl: text('deck_list_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})
