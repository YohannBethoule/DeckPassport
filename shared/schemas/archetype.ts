import { z } from 'zod/v4'

export const selectArchetypeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type SelectArchetype = z.infer<typeof selectArchetypeSchema>
