import { requireAuth } from '#server/utils/auth'
import { createPlaygroupSchema } from '#shared/schemas/playgroup'
import { db } from '#server/database'
import { playgroups, playgroupMembers } from '#server/database/schema'

export default defineEventHandler(async (event): Promise<number> => {
  const user = await requireAuth(event)
  const { name } = await readValidatedBody(event, body => createPlaygroupSchema.parseAsync(body))

  const id = await db.transaction(async (tx) => {
    const [created] = await tx.insert(playgroups)
      .values({ name, ownerId: user.id })
      .returning({ id: playgroups.id })

    await tx.insert(playgroupMembers).values({ playgroupId: created!.id, userId: user.id })

    return created!.id
  })

  return id
})
