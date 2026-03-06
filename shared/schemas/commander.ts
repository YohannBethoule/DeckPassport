import { z } from 'zod/v4'

const validColors = ['W', 'U', 'B', 'R', 'G', 'C'] as const

export const insertCommanderSchema = z.object({
  name: z.string().min(1, 'Commander name is required'),
  imageUrl: z.url('Must be a valid URL').optional(),
  colors: z.array(z.enum(validColors)).min(1, 'Select at least one color')
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
