import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { playgroupMembers } from '#server/database/schema'
import { and, eq } from 'drizzle-orm'
import type { PlaygroupDetail } from '#shared/schemas/playgroup'

export default defineEventHandler(async (event): Promise<PlaygroupDetail> => {
  const user = await requireAuth(event)
  const playgroupId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(playgroupId) || playgroupId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid playgroup ID' })
  }

  const membership = await db.query.playgroupMembers.findFirst({
    where: and(eq(playgroupMembers.playgroupId, playgroupId), eq(playgroupMembers.userId, user.id)),
    with: {
      playgroup: {
        with: {
          members: {
            with: { userRelation: { columns: { id: true, name: true, image: true } } }
          }
        }
      }
    }
  })

  if (!membership) {
    throw createError({ statusCode: 404, statusMessage: 'Playgroup not found' })
  }

  const group = membership.playgroup
  return {
    id: group.id,
    name: group.name,
    imageUrl: group.imageUrl ?? null,
    ownerId: group.ownerId,
    createdAt: group.createdAt.toISOString(),
    members: group.members.map(m => m.userRelation)
  }
})
