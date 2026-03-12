import { db } from '../../database'
import { auth } from '../../utils/auth'
import { findOrCreateCommander, findOrCreateBackground, updateArchetypes, updatePrints } from '../../utils/deck'
import { decks } from '#server/database/schema'
import { insertDeckWithCommanderSchema } from '#shared/schemas/deck'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { commander, commanderPrintUri, partner, partnerPrintUri, background, backgroundPrintUri, archetypes, deck } = await insertDeckWithCommanderSchema.parseAsync(body)

  // Get user session if authenticated
  const session = await auth.api.getSession({
    headers: event.headers
  }).catch(() => null)
  const userId = session?.user?.id ?? null

  const commanderId = await findOrCreateCommander(commander)
  const partnerCommanderId = partner ? await findOrCreateCommander(partner) : null
  const backgroundId = background ? await findOrCreateBackground(background) : null

  const [created] = await db.insert(decks).values({
    ...deck,
    bracketId: deck.bracket,
    commanderId,
    partnerCommanderId,
    backgroundId,
    userId
  }).returning({ id: decks.id })

  const deckId = created!.id

  await updateArchetypes(deckId, archetypes)
  await updatePrints(deckId, commanderId, commanderPrintUri, commander.imageUrl, partnerCommanderId, partnerPrintUri, partner?.imageUrl, backgroundId, backgroundPrintUri, background?.imageUrl)

  return deckId
})
