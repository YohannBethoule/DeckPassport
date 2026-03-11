import { db } from '../database'
import { archetypes } from '#server/database/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return db.select({ id: archetypes.id, name: archetypes.name }).from(archetypes).orderBy(asc(archetypes.name))
})
