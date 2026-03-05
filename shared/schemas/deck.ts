import { z } from 'zod/v4'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { decks } from '#server/database/schema'
import { insertCommanderSchema } from './commander'

export const insertDeckSchema = createInsertSchema(decks, {
  bracket: z.number().int().min(1, 'Bracket must be between 1 and 5').max(5, 'Bracket must be between 1 and 5'),
  winCondition: z.string().min(1, 'Win condition is required'),
  deckListUrl: z.union([z.url('Must be a valid URL'), z.literal('')]).optional()
}).omit({
  id: true,
  commanderId: true,
  createdAt: true,
  updatedAt: true
})

export const selectDeckSchema = createSelectSchema(decks)

const commanderFieldsRenamed = insertCommanderSchema
  .omit({ name: true })
  .extend({ commanderName: insertCommanderSchema.shape.name })

export const insertDeckWithCommanderSchema = commanderFieldsRenamed
  .extend(insertDeckSchema.shape)
  .transform(({ commanderName, imageUrl, colors, ...deck }) => ({
    commander: { name: commanderName, imageUrl, colors },
    deck
  }))

export const insertDeckWithCommanderFormSchema = commanderFieldsRenamed.extend(insertDeckSchema.shape)

export type InsertDeck = z.infer<typeof insertDeckSchema>
export type SelectDeck = z.infer<typeof selectDeckSchema>
export type InsertDeckWithCommander = z.input<typeof insertDeckWithCommanderSchema>
