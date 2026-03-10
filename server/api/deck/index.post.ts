import { eq } from 'drizzle-orm'
import { db } from '../../database'
import { backgrounds, commanders, decks } from '#server/database/schema'
import { insertDeckWithCommanderSchema } from '#shared/schemas/deck'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { commander, partner, background, deck } = await insertDeckWithCommanderSchema.parseAsync(body)

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
