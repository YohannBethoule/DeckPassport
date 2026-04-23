import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { friendships } from '#server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const friends = await db.query.friendships.findMany({
    where: eq(friendships.userId, user.id),
    with: { friendRelation: {
      columns: { id: true, name: true, image: true }
    } }
  })

  return friends.map(f => f.friendRelation)
})
