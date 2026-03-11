import { relations } from 'drizzle-orm'
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { archetypes } from './archetype'
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

export const decksToArchetypes = pgTable('decks_to_archetypes', {
  deckId: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  archetypeId: integer('archetype_id').notNull().references(() => archetypes.id),
  order: integer('order').notNull()
})

export const decksRelations = relations(decks, ({ one, many }) => ({
  archetypes: many(decksToArchetypes),
  bracket: one(brackets, { fields: [decks.bracketId], references: [brackets.id] }),
  commander: one(commanders, { fields: [decks.commanderId], references: [commanders.id], relationName: 'commander' }),
  partnerCommander: one(commanders, { fields: [decks.partnerCommanderId], references: [commanders.id], relationName: 'partnerCommander' }),
  background: one(backgrounds, { fields: [decks.backgroundId], references: [backgrounds.id] })
}))

export const decksToArchetypesRelations = relations(decksToArchetypes, ({ one }) => ({
  deck: one(decks, { fields: [decksToArchetypes.deckId], references: [decks.id] }),
  archetype: one(archetypes, { fields: [decksToArchetypes.archetypeId], references: [archetypes.id] })
}))
