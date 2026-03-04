import { z } from 'zod/v4'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { decks } from '../../server/database/schema/deck'
import { insertCommanderSchema } from './commander'

export const insertDeckSchema = createInsertSchema(decks, {
  bracket: z.number().int().min(1, 'Bracket must be between 1 and 5').max(5, 'Bracket must be between 1 and 5'),
  winCondition: z.string().min(1, 'Win condition is required'),
  deckListUrl: z.string().url('Must be a valid URL').optional()
}).omit({
  id: true,
  commanderId: true,
  createdAt: true,
  updatedAt: true
})

export const selectDeckSchema = createSelectSchema(decks)

export const insertDeckWithCommanderSchema = insertCommanderSchema
  .extend(insertDeckSchema.shape)
  .transform(({ name, imageUrl, colors, ...deck }) => ({
    commander: { name, imageUrl, colors },
    deck
  }))

export const insertDeckWithCommanderFormSchema = insertCommanderSchema.extend(insertDeckSchema.shape)

export type InsertDeck = z.infer<typeof insertDeckSchema>
export type SelectDeck = z.infer<typeof selectDeckSchema>
export type InsertDeckWithCommander = z.input<typeof insertDeckWithCommanderSchema>
