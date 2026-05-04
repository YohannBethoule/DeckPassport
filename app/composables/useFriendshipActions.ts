import { FRIEND_REQUEST_STATUS } from '#shared/schemas/social'

export function useFriendshipActions() {
  async function addFriend(profileId: string) {
    await $fetch('/api/friends/requests', { method: 'POST', body: { receiverId: profileId } })
  }

  async function acceptRequest(requestId: number) {
    await $fetch(`/api/friends/requests/${requestId}`, { method: 'PUT', body: { status: FRIEND_REQUEST_STATUS.ACCEPTED } })
  }

  async function rejectRequest(requestId: number) {
    await $fetch(`/api/friends/requests/${requestId}`, { method: 'PUT', body: { status: FRIEND_REQUEST_STATUS.REJECTED } })
  }

  async function removeFriend(profileId: string) {
    await $fetch(`/api/friends/${profileId}`, { method: 'DELETE' })
  }

  return { addFriend, acceptRequest, rejectRequest, removeFriend }
}
