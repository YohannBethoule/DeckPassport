import { z } from 'zod/v4'

export const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const

export type FriendRequestStatus = typeof FRIEND_REQUEST_STATUS[keyof typeof FRIEND_REQUEST_STATUS]
export const FRIEND_REQUEST_STATUSES = Object.values(FRIEND_REQUEST_STATUS) as [FriendRequestStatus, ...FriendRequestStatus[]]

export const sendFriendRequestSchema = z.object({
  receiverId: z.string().min(1)
})

export const respondToFriendRequestSchema = z.object({
  status: z.enum([FRIEND_REQUEST_STATUS.ACCEPTED, FRIEND_REQUEST_STATUS.REJECTED])
})

export const FRIEND_REQUEST_TYPE = {
  SENT: 'sent',
  RECEIVED: 'received'
} as const
export type FriendRequestType = typeof FRIEND_REQUEST_TYPE[keyof typeof FRIEND_REQUEST_TYPE]
export const FRIEND_REQUEST_TYPES = Object.values(FRIEND_REQUEST_TYPE) as [FriendRequestType, ...FriendRequestType[]]

export const friendRequestsSchema = z.object({
  type: z.enum(FRIEND_REQUEST_TYPES).default(FRIEND_REQUEST_TYPE.RECEIVED)
})

export const FRIENDSHIP_STATUS = {
  FRIENDS: 'friends',
  REQUEST_SENT: 'sent',
  REQUEST_RECEIVED: 'received',
  NONE: 'none'
} as const

export type FriendshipStatus = typeof FRIENDSHIP_STATUS[keyof typeof FRIENDSHIP_STATUS]
export const FRIENDSHIP_STATUSES = Object.values(FRIENDSHIP_STATUS) as [FriendshipStatus, ...FriendshipStatus[]]

export const friendshipStatusResponseSchema = z.object({
  status: z.enum(FRIENDSHIP_STATUSES),
  requestId: z.number().optional()
})

export type FriendshipStatusResponse = z.infer<typeof friendshipStatusResponseSchema>

export const friendSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable()
})
export type FriendSummary = z.infer<typeof friendSummarySchema>

export const friendRequestBaseSchema = z.object({
  id: z.number(),
  senderId: z.string(),
  receiverId: z.string(),
  status: z.enum(FRIEND_REQUEST_STATUSES),
  createdAt: z.date(),
  updatedAt: z.date()
})
export type SentFriendRequest = z.infer<typeof friendRequestBaseSchema> & { receiver: FriendSummary }
export type ReceivedFriendRequest = z.infer<typeof friendRequestBaseSchema> & { sender: FriendSummary }
