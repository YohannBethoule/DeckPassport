import { FetchError } from 'ofetch'
import { PLAYGROUP_INVITATION_STATUS, PLAYGROUP_INVITATION_TYPE } from '#shared/schemas/playgroup'
import type { PlaygroupDetail, PlaygroupSummary, ReceivedPlaygroupInvitation, SentPlaygroupInvitation } from '#shared/schemas/playgroup'

export function usePlaygroupActions() {
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

  function usePlaygroups() {
    return useFetch<PlaygroupSummary[]>('/api/playgroups', { default: () => [] })
  }

  function usePlaygroupDetail(playgroupId: number) {
    return useFetch<PlaygroupDetail | null>(`/api/playgroups/${playgroupId}`, { default: () => null })
  }

  function useReceivedInvitations() {
    return useFetch<ReceivedPlaygroupInvitation[]>('/api/playgroups/invitations', {
      default: () => [],
      query: { type: PLAYGROUP_INVITATION_TYPE.RECEIVED }
    })
  }

  function useSentInvitations() {
    return useFetch<SentPlaygroupInvitation[]>('/api/playgroups/invitations', {
      default: () => [],
      query: { type: PLAYGROUP_INVITATION_TYPE.SENT }
    })
  }

  function createPlaygroup(name: string): Promise<number> {
    return withErrorToast(() => $fetch<number>('/api/playgroups', { method: 'POST', body: { name } }))
  }

  function updatePlaygroup(playgroupId: number, name: string): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/playgroups/${playgroupId}`, { method: 'PUT', body: { name } }))
  }

  function uploadPlaygroupImage(playgroupId: number, file: File): Promise<{ imageUrl: string }> {
    const form = new FormData()
    form.append('image', file)
    return withErrorToast(() => $fetch<{ imageUrl: string }>(`/api/playgroups/${playgroupId}/image`, { method: 'PUT', body: form }))
  }

  function disbandPlaygroup(playgroupId: number): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/playgroups/${playgroupId}`, { method: 'DELETE' }))
  }

  function inviteMember(playgroupId: number, receiverId: string): Promise<number> {
    return withErrorToast(() => $fetch<number>(`/api/playgroups/${playgroupId}/invitations`, { method: 'POST', body: { receiverId } }))
  }

  function removeMember(playgroupId: number, userId: string): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/playgroups/${playgroupId}/members/${userId}`, { method: 'DELETE' }))
  }

  function acceptInvitation(invitationId: number): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/playgroups/invitations/${invitationId}`, { method: 'PUT', body: { status: PLAYGROUP_INVITATION_STATUS.ACCEPTED } }))
  }

  function rejectInvitation(invitationId: number): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/playgroups/invitations/${invitationId}`, { method: 'PUT', body: { status: PLAYGROUP_INVITATION_STATUS.REJECTED } }))
  }

  function cancelInvitation(invitationId: number): Promise<{ success: boolean }> {
    return withErrorToast(() => $fetch<{ success: boolean }>(`/api/playgroups/invitations/${invitationId}`, { method: 'DELETE' }))
  }

  return {
    usePlaygroups,
    usePlaygroupDetail,
    useReceivedInvitations,
    useSentInvitations,
    createPlaygroup,
    updatePlaygroup,
    uploadPlaygroupImage,
    disbandPlaygroup,
    inviteMember,
    removeMember,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation
  }
}
