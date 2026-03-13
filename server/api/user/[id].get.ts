import { eq } from 'drizzle-orm'
import { db } from '../../database'
import { user } from '#server/database/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const result = await db.select({
    id: user.id,
    name: user.name,
    image: user.image,
    createdAt: user.createdAt
  }).from(user).where(eq(user.id, id)).limit(1)

  if (result.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return result[0]
})
