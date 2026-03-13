import { and, asc, arrayContained, arrayContains, count, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { db } from '../../database'
import { commanders, decks, decksToArchetypes } from '#server/database/schema'
import { FILTER_MODES } from '#shared/schemas/filter'

const sortColumns = {
  createdAt: decks.createdAt,
  updatedAt: decks.updatedAt,
  title: decks.title
} as const

type SortColumn = keyof typeof sortColumns

const VALID_COLORS = ['W', 'U', 'B', 'R', 'G', 'C']

interface SearchParams {
  sort: SortColumn
  order: 'asc' | 'desc'
  size: number
  page: number
  userId?: string
  commanderId?: number
  bracketId?: number
  archetypeIds: number[]
  archetypeMode: string
  colors: string[]
  colorMode: string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = parseSearchParams(query)
  const conditions = buildConditions(params)
  const where = conditions.length > 0 ? and(...conditions) : undefined

  return executeSearch(params, where)
})

function parseSearchParams(query: Record<string, unknown>): SearchParams {
  const [includingMode, onlyMode] = FILTER_MODES

  return {
    sort: (query.sort as string) in sortColumns ? (query.sort as SortColumn) : 'createdAt',
    order: query.order === 'asc' ? 'asc' : 'desc',
    size: Math.min(Math.max(Number(query.size) || 10, 1), 20),
    page: Math.max(Number(query.page) || 1, 1),
    userId: query.userId as string | undefined,
    commanderId: query.commanderId ? Number(query.commanderId) : undefined,
    bracketId: query.bracketId ? Number(query.bracketId) : undefined,
    archetypeIds: parseIntArray(query.archetypeIds),
    archetypeMode: query.archetypeMode === onlyMode ? onlyMode : includingMode,
    colors: parseColors(query.colors),
    colorMode: query.colorMode === onlyMode ? onlyMode : includingMode
  }
}

function buildConditions(params: SearchParams): SQL[] {
  const [, onlyMode] = FILTER_MODES
  const conditions: SQL[] = []

  if (params.userId) {
    conditions.push(eq(decks.userId, params.userId))
  }

  if (params.commanderId) {
    conditions.push(
      or(
        eq(decks.commanderId, params.commanderId),
        eq(decks.partnerCommanderId, params.commanderId)
      )!
    )
  }

  if (params.bracketId) {
    conditions.push(eq(decks.bracketId, params.bracketId))
  }

  if (params.colors.length > 0) {
    buildColorConditions(conditions, params.colors, params.colorMode === onlyMode)
  }

  if (params.archetypeIds.length > 0) {
    buildArchetypeConditions(conditions, params.archetypeIds, params.archetypeMode === onlyMode)
  }

  return conditions
}

function buildColorConditions(conditions: SQL[], colors: string[], exactMatch: boolean) {
  if (exactMatch) {
    // Commander colors must be a subset of selected colors
    const subsetIds = commanderIdsByColor(arrayContained(commanders.colors, colors))
    conditions.push(inArray(decks.commanderId, subsetIds))

    // Partner commander colors must also be a subset (or not exist)
    conditions.push(
      or(
        isNull(decks.partnerCommanderId),
        inArray(decks.partnerCommanderId, subsetIds)
      )!
    )

    // The union of commander + partner colors must cover all selected colors
    for (const color of colors) {
      const hasColorIds = commanderIdsByColor(arrayContains(commanders.colors, [color]))
      conditions.push(
        or(
          inArray(decks.commanderId, hasColorIds),
          inArray(decks.partnerCommanderId, hasColorIds)
        )!
      )
    }
  } else {
    // Each selected color must be present in at least one of commander/partner
    for (const color of colors) {
      const hasColorIds = commanderIdsByColor(arrayContains(commanders.colors, [color]))
      conditions.push(
        or(
          inArray(decks.commanderId, hasColorIds),
          inArray(decks.partnerCommanderId, hasColorIds)
        )!
      )
    }
  }
}

function commanderIdsByColor(condition: SQL) {
  return db.select({ id: commanders.id }).from(commanders).where(condition)
}

function buildArchetypeConditions(conditions: SQL[], archetypeIds: number[], exactMatch: boolean) {
  if (exactMatch) {
    for (const archetypeId of archetypeIds) {
      conditions.push(
        inArray(
          decks.id,
          db.select({ id: decksToArchetypes.deckId }).from(decksToArchetypes).where(
            eq(decksToArchetypes.archetypeId, archetypeId)
          )
        )
      )
    }
    conditions.push(
      inArray(
        decks.id,
        db.select({ id: decksToArchetypes.deckId })
          .from(decksToArchetypes)
          .groupBy(decksToArchetypes.deckId)
          .having(sql`count(*) = ${archetypeIds.length}`)
      )
    )
  } else {
    conditions.push(
      inArray(
        decks.id,
        db.select({ id: decksToArchetypes.deckId }).from(decksToArchetypes).where(
          inArray(decksToArchetypes.archetypeId, archetypeIds)
        )
      )
    )
  }
}

async function executeSearch(params: SearchParams, where: SQL | undefined) {
  const column = sortColumns[params.sort]
  const orderByFn = params.order === 'asc' ? asc : desc
  const offset = (params.page - 1) * params.size

  const [items, countResult] = await Promise.all([
    db.query.decks.findMany({
      where,
      orderBy: [orderByFn(column)],
      limit: params.size,
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
}

function parseIntArray(value: unknown): number[] {
  if (!value) return []
  const str = String(value)
  return str.split(',').map(Number).filter(n => Number.isInteger(n) && n > 0)
}

function parseColors(value: unknown): string[] {
  if (!value) return []
  const str = String(value)
  return str.split(',').filter(c => VALID_COLORS.includes(c))
}
