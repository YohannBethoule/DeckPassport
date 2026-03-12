import { asc, desc, eq } from 'drizzle-orm'
import { db } from '../../database'
import { decks } from '#server/database/schema'

const sortColumns = {
  createdAt: decks.createdAt,
  updatedAt: decks.updatedAt,
  title: decks.title
} as const

type SortColumn = keyof typeof sortColumns

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const sort = (query.sort as string) in sortColumns ? (query.sort as SortColumn) : 'createdAt'
  const order = query.order === 'asc' ? 'asc' : 'desc'
  const size = Math.min(Math.max(Number(query.size) || 3, 1), 20)
  const userId = query.userId as string | undefined

  const column = sortColumns[sort]
  const orderByFn = order === 'asc' ? asc : desc

  return await db.query.decks.findMany({
    where: userId ? eq(decks.userId, userId) : undefined,
    orderBy: [orderByFn(column)],
    limit: size,
    with: {
      archetypes: {
        with: { archetype: true },
        orderBy: (decksToArchetypes, { asc }) => [asc(decksToArchetypes.order)]
      },
      bracket: true,
      commander: true,
      partnerCommander: true,
      background: true,
      commanderPrints: true,
      backgroundPrints: true
    }
  })
})
