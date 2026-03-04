import { z } from 'zod/v4'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { commanders } from '../../server/database/schema/commander'

const validColors = ['W', 'U', 'B', 'R', 'G'] as const

export const insertCommanderSchema = createInsertSchema(commanders, {
  name: z.string().min(1, 'Commander name is required'),
  imageUrl: z.string().url('Must be a valid URL').optional(),
  colors: z.array(z.enum(validColors)).min(1, 'Select at least one color')
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectCommanderSchema = createSelectSchema(commanders)

export type InsertCommander = z.infer<typeof insertCommanderSchema>
export type SelectCommander = z.infer<typeof selectCommanderSchema>
