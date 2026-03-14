import { z } from 'zod/v4'
import { insertCommanderSchema, MANA_COLORS } from './commander'

export const DESCRIPTION_MAX_LENGTH = 200
export const MAX_CORE_CARDS = 3

export const coreCardSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.url()
})

export const insertDeckSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bracket: z.number().int().min(1, 'Bracket must be between 1 and 5').max(5, 'Bracket must be between 1 and 5'),
  archetypes: z.array(z.number().int()).max(2, 'You can select up to 2 archetypes').optional(),
  description: z.string().min(1, 'Description is required').max(DESCRIPTION_MAX_LENGTH, 'Description must not exceed 200 characters'),
  winCondition: z.string().min(1, 'Win condition is required').max(DESCRIPTION_MAX_LENGTH, 'Win conditions must not exceed 200 characters'),
  coreCards: z.array(coreCardSchema).max(MAX_CORE_CARDS, `You can select up to ${MAX_CORE_CARDS} core cards`).optional(),
  deckListUrl: z.union([z.url('Must be a valid URL'), z.literal('')]).optional()
})

export const selectDeckSchema = z.object({
  id: z.number().int(),
  commanderId: z.number().int(),
  title: z.string(),
  bracket: z.number().int(),
  description: z.string(),
  winCondition: z.string(),
  coreCards: z.array(coreCardSchema).nullable(),
  deckListUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

const commanderFieldsRenamed = insertCommanderSchema
  .omit({ name: true })
  .extend({ commanderName: insertCommanderSchema.shape.name })

const partnerFields = z.object({
  partnerCommanderName: z.string().optional(),
  partnerImageUrl: z.url('Must be a valid URL').optional(),
  partnerColors: z.array(z.enum(MANA_COLORS)).optional()
})

const backgroundFields = z.object({
  backgroundName: z.string().optional(),
  backgroundImageUrl: z.url('Must be a valid URL').optional(),
  backgroundColors: z.array(z.enum(MANA_COLORS)).optional()
})

const printFields = z.object({
  commanderDefaultImageUrl: z.url('Must be a valid URL').optional(),
  partnerDefaultImageUrl: z.url('Must be a valid URL').optional(),
  backgroundDefaultImageUrl: z.url('Must be a valid URL').optional()
})

export const insertDeckWithCommanderSchema = commanderFieldsRenamed
  .extend(insertDeckSchema.shape)
  .extend(partnerFields.shape)
  .extend(backgroundFields.shape)
  .extend(printFields.shape)
  .transform(({ commanderName, imageUrl, colors, commanderDefaultImageUrl, partnerCommanderName, partnerImageUrl, partnerColors, partnerDefaultImageUrl, backgroundName, backgroundImageUrl, backgroundColors, backgroundDefaultImageUrl, archetypes, ...deck }) => ({
    commander: { name: commanderName, imageUrl: commanderDefaultImageUrl ?? imageUrl, colors },
    commanderPrintUri: imageUrl,
    partner: partnerCommanderName ? { name: partnerCommanderName, imageUrl: partnerDefaultImageUrl ?? partnerImageUrl, colors: partnerColors ?? [] } : undefined,
    partnerPrintUri: partnerCommanderName ? partnerImageUrl : undefined,
    background: backgroundName ? { name: backgroundName, imageUrl: backgroundDefaultImageUrl ?? backgroundImageUrl, colors: backgroundColors ?? [] } : undefined,
    backgroundPrintUri: backgroundName ? backgroundImageUrl : undefined,
    archetypes: archetypes?.filter(Boolean) ?? [],
    deck
  }))

export const insertDeckWithCommanderFormSchema = commanderFieldsRenamed.extend(insertDeckSchema.shape).extend(partnerFields.shape).extend(backgroundFields.shape).extend(printFields.shape)

export type CoreCard = z.infer<typeof coreCardSchema>
export type InsertDeck = z.infer<typeof insertDeckSchema>
export type SelectDeck = z.infer<typeof selectDeckSchema>
export type InsertDeckWithCommander = z.input<typeof insertDeckWithCommanderSchema>
