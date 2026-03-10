import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const backgrounds = pgTable('backgrounds', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})
