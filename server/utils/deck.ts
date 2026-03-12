import { eq } from 'drizzle-orm'
import { db } from '../database'
import { backgrounds, commanders, decks, decksToArchetypes, decksToCommanderPrints, decksToBackgroundPrints } from '#server/database/schema'

export async function findOrCreateCommander(commander: { name: string, imageUrl?: string, colors: string[] }) {
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

export async function findOrCreateBackground(background: { name: string, imageUrl?: string }) {
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

export async function updateArchetypes(deckId: number, archetypes: number[]) {
  await db.delete(decksToArchetypes).where(eq(decksToArchetypes.deckId, deckId))
  if (archetypes.length > 0) {
    await db.insert(decksToArchetypes).values(
      archetypes.map((archetypeId, index) => ({
        deckId,
        archetypeId,
        order: index + 1
      }))
    )
  }
}

export async function updatePrints(
  deckId: number,
  commanderId: number,
  commanderPrintUri: string | undefined,
  commanderImageUrl: string | undefined,
  partnerCommanderId: number | null,
  partnerPrintUri: string | undefined,
  partnerImageUrl: string | undefined,
  backgroundId: number | null,
  backgroundPrintUri: string | undefined,
  backgroundImageUrl: string | undefined
) {
  await db.delete(decksToCommanderPrints).where(eq(decksToCommanderPrints.deckId, deckId))
  const printEntries: { deckId: number, commanderId: number, commanderPrintUri: string }[] = []

  if (commanderPrintUri && commanderPrintUri !== commanderImageUrl) {
    printEntries.push({ deckId, commanderId, commanderPrintUri })
  }
  if (partnerCommanderId && partnerPrintUri && partnerPrintUri !== partnerImageUrl) {
    printEntries.push({ deckId, commanderId: partnerCommanderId, commanderPrintUri: partnerPrintUri })
  }

  if (printEntries.length > 0) {
    await db.insert(decksToCommanderPrints).values(printEntries)
  }

  await db.delete(decksToBackgroundPrints).where(eq(decksToBackgroundPrints.deckId, deckId))
  if (backgroundId && backgroundPrintUri && backgroundPrintUri !== backgroundImageUrl) {
    await db.insert(decksToBackgroundPrints).values({
      deckId,
      backgroundId,
      backgroundPrintUri
    })
  }
}

export async function checkDeckOwnership(deckId: number, userId: string) {
  const [existing] = await db.select({ userId: decks.userId })
    .from(decks)
    .where(eq(decks.id, deckId))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Deck not found' })
  }

  if (existing.userId !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'You can only edit your own decks' })
  }
}
