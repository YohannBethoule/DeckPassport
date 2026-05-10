import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { playgroupMembers, playgroups } from '#server/database/schema'
import { eq, sql } from 'drizzle-orm'
import type { PlaygroupSummary } from '#shared/schemas/playgroup'

export default defineEventHandler(async (event): Promise<PlaygroupSummary[]> => {
  const user = await requireAuth(event)

  const memberships = await db
    .select({
      id: playgroups.id,
      name: playgroups.name,
      imageUrl: playgroups.imageUrl,
      ownerId: playgroups.ownerId,
      createdAt: playgroups.createdAt,
      memberCount: sql<number>`(select count(*) from playgroup_members where playgroup_id = ${playgroups.id})::int`
    })
    .from(playgroupMembers)
    .innerJoin(playgroups, eq(playgroupMembers.playgroupId, playgroups.id))
    .where(eq(playgroupMembers.userId, user.id))

  return memberships.map(g => ({ ...g, createdAt: g.createdAt.toISOString() }))
})
