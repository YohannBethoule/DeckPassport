import { z } from 'zod/v4'

export const PLAYGROUP_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const

export type PlaygroupInvitationStatus = typeof PLAYGROUP_INVITATION_STATUS[keyof typeof PLAYGROUP_INVITATION_STATUS]
export const PLAYGROUP_INVITATION_STATUSES = Object.values(PLAYGROUP_INVITATION_STATUS) as [PlaygroupInvitationStatus, ...PlaygroupInvitationStatus[]]

export const createPlaygroupSchema = z.object({
  name: z.string().min(1).max(50)
})

export const updatePlaygroupSchema = z.object({
  name: z.string().min(1).max(50)
})

export const inviteToPlaygroupSchema = z.object({
  receiverId: z.string().min(1)
})

export const respondToPlaygroupInvitationSchema = z.object({
  status: z.enum([PLAYGROUP_INVITATION_STATUS.ACCEPTED, PLAYGROUP_INVITATION_STATUS.REJECTED])
})

export const PLAYGROUP_INVITATION_TYPE = {
  SENT: 'sent',
  RECEIVED: 'received'
} as const
export type PlaygroupInvitationType = typeof PLAYGROUP_INVITATION_TYPE[keyof typeof PLAYGROUP_INVITATION_TYPE]
export const PLAYGROUP_INVITATION_TYPES = Object.values(PLAYGROUP_INVITATION_TYPE) as [PlaygroupInvitationType, ...PlaygroupInvitationType[]]

export const playgroupInvitationsQuerySchema = z.object({
  type: z.enum(PLAYGROUP_INVITATION_TYPES).default(PLAYGROUP_INVITATION_TYPE.RECEIVED)
})

export const memberSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable()
})
export type MemberSummary = z.infer<typeof memberSummarySchema>

export const playgroupSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  ownerId: z.string(),
  memberCount: z.number(),
  createdAt: z.string()
})
export type PlaygroupSummary = z.infer<typeof playgroupSummarySchema>

export const playgroupDetailSchema = playgroupSummarySchema.omit({ memberCount: true }).extend({
  members: z.array(memberSummarySchema)
})
export type PlaygroupDetail = z.infer<typeof playgroupDetailSchema>

export const playgroupInvitationBaseSchema = z.object({
  id: z.number(),
  playgroupId: z.number(),
  senderId: z.string(),
  receiverId: z.string(),
  status: z.enum(PLAYGROUP_INVITATION_STATUSES)
})

export const receivedPlaygroupInvitationSchema = playgroupInvitationBaseSchema.extend({
  playgroup: z.object({ id: z.number(), name: z.string(), imageUrl: z.string().nullable() }),
  sender: memberSummarySchema
})
export type ReceivedPlaygroupInvitation = z.infer<typeof receivedPlaygroupInvitationSchema>

export const sentPlaygroupInvitationSchema = playgroupInvitationBaseSchema.extend({
  receiver: memberSummarySchema
})
export type SentPlaygroupInvitation = z.infer<typeof sentPlaygroupInvitationSchema>
