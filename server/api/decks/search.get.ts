import { asc, count, desc, eq } from 'drizzle-orm'
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
  const page = Math.max(Number(query.page) || 1, 1)
  const userId = query.userId as string | undefined

  const column = sortColumns[sort]
  const orderByFn = order === 'asc' ? asc : desc

  const offset = (page - 1) * size

  const where = userId ? eq(decks.userId, userId) : undefined

  const [items, countResult] = await Promise.all([
    db.query.decks.findMany({
      where,
      orderBy: [orderByFn(column)],
      limit: size,
      offset,
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
    }),
    db.select({ total: count() }).from(decks).where(where)
  ])

  return { items, total: countResult[0]!.total }
})
