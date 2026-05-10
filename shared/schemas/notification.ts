import { z } from 'zod/v4'

export const NOTIFICATION_TYPE = {
  FRIEND_REQUEST_RECEIVED: 'friend_request_received',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
  PLAYGROUP_INVITATION_RECEIVED: 'playgroup_invitation_received',
  PLAYGROUP_MEMBER_JOINED: 'playgroup_member_joined',
  PLAYGROUP_DISBANDED: 'playgroup_disbanded',
  SYSTEM: 'system'
} as const

export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE]
export const NOTIFICATION_TYPES = Object.values(NOTIFICATION_TYPE) as [NotificationType, ...NotificationType[]]

const notificationBaseSchema = z.object({
  id: z.number(),
  createdAt: z.string()
})

export const friendRequestNotificationSchema = notificationBaseSchema.extend({
  type: z.enum([NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED, NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED]),
  actor: z.object({ id: z.string(), name: z.string(), image: z.string().nullable() }),
  requestId: z.number().nullable()
})
export type FriendRequestNotification = z.infer<typeof friendRequestNotificationSchema>

export const systemNotificationSchema = notificationBaseSchema.extend({
  type: z.literal(NOTIFICATION_TYPE.SYSTEM),
  title: z.string(),
  body: z.string(),
  link: z.string().nullable()
})
export type SystemNotification = z.infer<typeof systemNotificationSchema>

export const playgroupNotificationSchema = notificationBaseSchema.extend({
  type: z.enum([
    NOTIFICATION_TYPE.PLAYGROUP_INVITATION_RECEIVED,
    NOTIFICATION_TYPE.PLAYGROUP_MEMBER_JOINED,
    NOTIFICATION_TYPE.PLAYGROUP_DISBANDED
  ]),
  playgroupId: z.number().nullable(),
  playgroupName: z.string().nullable(),
  actor: z.object({ id: z.string(), name: z.string(), image: z.string().nullable() }).nullable(),
  invitationId: z.number().nullable()
})
export type PlaygroupNotification = z.infer<typeof playgroupNotificationSchema>

export type AppNotification = FriendRequestNotification | SystemNotification | PlaygroupNotification
