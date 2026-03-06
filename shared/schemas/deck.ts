import { z } from 'zod/v4'
import { insertCommanderSchema } from './commander'

export const DESCRIPTION_MAX_LENGTH = 200

export const insertDeckSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bracket: z.number().int().min(1, 'Bracket must be between 1 and 5').max(5, 'Bracket must be between 1 and 5'),
  description: z.string().min(1, 'Description is required').max(DESCRIPTION_MAX_LENGTH, 'Description must not exceed 200 characters'),
  winCondition: z.string().min(1, 'Win condition is required').max(DESCRIPTION_MAX_LENGTH, 'Win conditions must not exceed 200 characters'),
  coreCards: z.string().optional(),
  deckListUrl: z.union([z.url('Must be a valid URL'), z.literal('')]).optional()
})

export const selectDeckSchema = z.object({
  id: z.number().int(),
  commanderId: z.number().int(),
  title: z.string(),
  bracket: z.number().int(),
  description: z.string(),
  winCondition: z.string(),
  coreCards: z.string().nullable(),
  deckListUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

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
