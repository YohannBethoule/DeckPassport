import { FetchError } from 'ofetch'
import { FRIEND_REQUEST_STATUS } from '#shared/schemas/social'

export function useFriendshipActions() {
  const toast = useToast()

  async function withErrorToast<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (err) {
      const description = err instanceof FetchError
        ? (err.data?.statusMessage ?? err.message)
        : 'An unexpected error occurred'
      toast.add({ color: 'error', title: 'Something went wrong', description })
      throw err
    }
  }

  function addFriend(profileId: string): Promise<number> {
    return withErrorToast(() => $fetch<number>('/api/friends/requests', { method: 'POST', body: { receiverId: profileId } }))
  }

  function acceptRequest(requestId: number): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/friends/requests/${requestId}`, { method: 'PUT', body: { status: FRIEND_REQUEST_STATUS.ACCEPTED } }))
  }

  function rejectRequest(requestId: number): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/friends/requests/${requestId}`, { method: 'PUT', body: { status: FRIEND_REQUEST_STATUS.REJECTED } }))
  }

  function cancelRequest(requestId: number): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/friends/requests/${requestId}`, { method: 'DELETE' }))
  }

  function removeFriend(profileId: string): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/friends/${profileId}`, { method: 'DELETE' }))
  }

  return { addFriend, acceptRequest, rejectRequest, cancelRequest, removeFriend }
}
