import { eq } from 'drizzle-orm'
import { db } from '../../database'
import { decks } from '#server/database/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid deck ID' })
  }

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, id),
    with: {
      bracket: true,
      commander: true,
      partnerCommander: true,
      background: true
    }
  })

  if (!deck) {
    throw createError({ statusCode: 404, statusMessage: 'Deck not found' })
  }

  return deck
})
