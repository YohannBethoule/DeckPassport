import { eq } from 'drizzle-orm'
import { db } from '../../database'
import { auth } from '../../utils/auth'
import { checkDeckOwnership } from '../../utils/deck'
import { decks } from '#server/database/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid deck ID' })
  }

  const session = await auth.api.getSession({
    headers: event.headers
  }).catch(() => null)

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  await checkDeckOwnership(id, session.user.id)

  await db.delete(decks).where(eq(decks.id, id))

  return { success: true }
})
