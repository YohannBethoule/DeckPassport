import { db } from '../database'
import { brackets } from '#server/database/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return db.select().from(brackets).orderBy(asc(brackets.id))
})
