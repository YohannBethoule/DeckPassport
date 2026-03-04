import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const commanders = pgTable('commanders', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url'),
  colors: text('colors').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})
