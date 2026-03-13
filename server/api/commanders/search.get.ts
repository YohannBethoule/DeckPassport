import { db } from '../../database'
import { commanders } from '#server/database/schema'
import { asc, ilike } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string || '').trim()

  if (q.length < 2) return []

  return db.select({ id: commanders.id, name: commanders.name })
    .from(commanders)
    .where(ilike(commanders.name, `%${q}%`))
    .orderBy(asc(commanders.name))
    .limit(20)
})
