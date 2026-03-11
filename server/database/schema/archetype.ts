import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core'

export const archetypes = pgTable('archetypes', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})
