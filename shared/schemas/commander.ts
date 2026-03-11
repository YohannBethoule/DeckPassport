import { z } from 'zod/v4'

export const CHROMATIC_COLORS = ['W', 'U', 'B', 'R', 'G'] as const
export type ChromaticColor = typeof CHROMATIC_COLORS[number]
export const MANA_COLORS = [...CHROMATIC_COLORS, 'C'] as const
export type ManaColor = typeof MANA_COLORS[number]

export const insertCommanderSchema = z.object({
  name: z.string().min(1, 'Commander name is required'),
  imageUrl: z.url('Must be a valid URL').optional(),
  colors: z.array(z.enum(MANA_COLORS)).min(1, 'Select at least one color')
})

export const selectCommanderSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  colors: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type InsertCommander = z.infer<typeof insertCommanderSchema>
export type SelectCommander = z.infer<typeof selectCommanderSchema>
