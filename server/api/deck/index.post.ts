import { eq } from 'drizzle-orm'
import { db } from '../../database'
import { backgrounds, commanders, decks, decksToArchetypes, decksToCommanderPrints, decksToBackgroundPrints } from '#server/database/schema'
import { insertDeckWithCommanderSchema } from '#shared/schemas/deck'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { commander, commanderPrintUri, partner, partnerPrintUri, background, backgroundPrintUri, archetypes, deck } = await insertDeckWithCommanderSchema.parseAsync(body)

  // find or create commander
  const commanderId = await findOrCreateCommander(commander)

  // find or create partner commander
  const partnerCommanderId = partner
    ? await findOrCreateCommander(partner)
    : null

  // find or create background
  const backgroundId = background
    ? await findOrCreateBackground(background)
    : null

  // create deck
  const [created] = await db.insert(decks).values({
    ...deck,
    bracketId: deck.bracket,
    commanderId,
    partnerCommanderId,
    backgroundId
  }).returning({ id: decks.id })

  // create deck-archetype associations
  if (archetypes.length > 0) {
    await db.insert(decksToArchetypes).values(
      archetypes.map((archetypeId, index) => ({
        deckId: created!.id,
        archetypeId,
        order: index + 1
      }))
    )
  }

  // save commander print selections
  const printEntries: { deckId: number, commanderId: number, commanderPrintUri: string }[] = []

  if (commanderPrintUri && commanderPrintUri !== commander.imageUrl) {
    printEntries.push({ deckId: created!.id, commanderId, commanderPrintUri })
  }
  if (partnerCommanderId && partnerPrintUri && partnerPrintUri !== partner?.imageUrl) {
    printEntries.push({ deckId: created!.id, commanderId: partnerCommanderId, commanderPrintUri: partnerPrintUri })
  }

  if (printEntries.length > 0) {
    await db.insert(decksToCommanderPrints).values(printEntries)
  }

  // save background print selection
  if (backgroundId && backgroundPrintUri && backgroundPrintUri !== background?.imageUrl) {
    await db.insert(decksToBackgroundPrints).values({
      deckId: created!.id,
      backgroundId,
      backgroundPrintUri
    })
  }

  return created!.id
})

async function findOrCreateCommander(commander: { name: string, imageUrl?: string, colors: string[] }) {
  const [existing] = await db.select()
    .from(commanders)
    .where(eq(commanders.name, commander.name))
    .limit(1)

  if (existing) return existing.id

  const [created] = await db.insert(commanders).values({
    name: commander.name,
    imageUrl: commander.imageUrl ?? null,
    colors: commander.colors
  }).returning({ id: commanders.id })

  return created!.id
}

async function findOrCreateBackground(background: { name: string, imageUrl?: string }) {
  const [existing] = await db.select()
    .from(backgrounds)
    .where(eq(backgrounds.name, background.name))
    .limit(1)

  if (existing) return existing.id

  const [created] = await db.insert(backgrounds).values({
    name: background.name,
    imageUrl: background.imageUrl ?? null
  }).returning({ id: backgrounds.id })

  return created!.id
}
