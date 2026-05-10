import { requireAuth } from '#server/utils/auth'
import { db } from '#server/database'
import { eq } from 'drizzle-orm'
import { PLAYGROUP_INVITATION_STATUS, PLAYGROUP_INVITATION_TYPE, playgroupInvitationsQuerySchema } from '#shared/schemas/playgroup'
import type { ReceivedPlaygroupInvitation, SentPlaygroupInvitation } from '#shared/schemas/playgroup'

export default defineEventHandler(async (event): Promise<ReceivedPlaygroupInvitation[] | SentPlaygroupInvitation[]> => {
  const user = await requireAuth(event)
  const { type } = await getValidatedQuery(event, query => playgroupInvitationsQuerySchema.parseAsync(query))

  if (type === PLAYGROUP_INVITATION_TYPE.RECEIVED) {
    const invitations = await db.query.playgroupInvitations.findMany({
      where: (inv, { and }) => and(
        eq(inv.receiverId, user.id),
        eq(inv.status, PLAYGROUP_INVITATION_STATUS.PENDING)
      ),
      with: {
        playgroup: { columns: { id: true, name: true, imageUrl: true } },
        sender: { columns: { id: true, name: true, image: true } }
      }
    })
    return invitations as ReceivedPlaygroupInvitation[]
  }

  const invitations = await db.query.playgroupInvitations.findMany({
    where: (inv, { and }) => and(
      eq(inv.senderId, user.id),
      eq(inv.status, PLAYGROUP_INVITATION_STATUS.PENDING)
    ),
    with: {
      receiver: { columns: { id: true, name: true, image: true } }
    }
  })
  return invitations as SentPlaygroupInvitation[]
})
