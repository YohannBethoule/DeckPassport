import { z } from 'zod/v4'

export const insertBackgroundSchema = z.object({
  name: z.string().min(1, 'Background name is required'),
  imageUrl: z.url('Must be a valid URL').optional()
})

export const selectBackgroundSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type InsertBackground = z.infer<typeof insertBackgroundSchema>
export type SelectBackground = z.infer<typeof selectBackgroundSchema>
