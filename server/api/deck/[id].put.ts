import { eq } from 'drizzle-orm'
import { db } from '../../database'
import { requireAuth } from '../../utils/auth'
import { checkDeckOwnership, findOrCreateCommander, findOrCreateBackground, updateArchetypes, updatePrints } from '../../utils/deck'
import { decks } from '#server/database/schema'
import { insertDeckWithCommanderSchema } from '#shared/schemas/deck'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid deck ID' })
  }

  const user = await requireAuth(event)

  await checkDeckOwnership(id, user.id)

  const { commander, commanderPrintUri, partner, partnerPrintUri, background, backgroundPrintUri, archetypes, deck } = await readValidatedBody(event, body => insertDeckWithCommanderSchema.parseAsync(body))

  const commanderId = await findOrCreateCommander(commander)
  const partnerCommanderId = partner ? await findOrCreateCommander(partner) : null
  const backgroundId = background ? await findOrCreateBackground(background) : null

  await updateDeck(id, deck, commanderId, partnerCommanderId, backgroundId)
  await updateArchetypes(id, archetypes)
  await updatePrints(id, commanderId, commanderPrintUri, commander.imageUrl, partnerCommanderId, partnerPrintUri, partner?.imageUrl, backgroundId, backgroundPrintUri, background?.imageUrl)

  return id
})

async function updateDeck(
  id: number,
  deck: { bracket: number, [key: string]: unknown },
  commanderId: number,
  partnerCommanderId: number | null,
  backgroundId: number | null
) {
  await db.update(decks)
    .set({
      ...deck,
      bracketId: deck.bracket,
      commanderId,
      partnerCommanderId,
      backgroundId,
      updatedAt: new Date()
    })
    .where(eq(decks.id, id))
}
