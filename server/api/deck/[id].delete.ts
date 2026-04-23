import { eq } from 'drizzle-orm'
import { db } from '../../database'
import { requireAuth } from '../../utils/auth'
import { checkDeckOwnership } from '../../utils/deck'
import { decks } from '#server/database/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid deck ID' })
  }

  const user = await requireAuth(event)

  await checkDeckOwnership(id, user.id)

  await db.delete(decks).where(eq(decks.id, id))

  return { success: true }
})
