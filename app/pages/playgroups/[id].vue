<script setup lang="ts">
import type { FriendSummary } from '#shared/schemas/social'
import { PLAYGROUP_INVITATION_STATUS } from '#shared/schemas/playgroup'
import PlaygroupMembers from '~/components/PlaygroupMembers.vue'
import PlaygroupHeader from '~/components/PlaygroupHeader.vue'
import PlaygroupPendingInvitations from '~/components/PlaygroupPendingInvitations.vue'

const route = useRoute()
const playgroupId = Number(route.params.id)

if (!Number.isInteger(playgroupId) || playgroupId < 1) {
  await navigateTo('/playgroups')
}

const { usePlaygroupDetail, useSentInvitations } = usePlaygroupActions()
const { useSession } = useAuth()
const session = useSession()

const { data: playgroup, error: playgroupError, refresh } = await usePlaygroupDetail(playgroupId)
const { data: friends } = await useFetch<FriendSummary[]>('/api/friends', { default: () => [] })
const { data: sentInvitations, refresh: refreshSentInvitations } = await useSentInvitations()

const currentUserId = computed(() => session.value?.data?.user?.id)
const isOwner = computed(() => !!currentUserId.value && playgroup.value?.ownerId === currentUserId.value)

const pendingInvitations = computed(() =>
  sentInvitations.value.filter(inv =>
    inv.playgroupId === playgroupId && inv.status === PLAYGROUP_INVITATION_STATUS.PENDING
  )
)

const invitableFriends = computed(() => {
  const memberIds = new Set(playgroup.value?.members.map(m => m.id) ?? [])
  const pendingIds = new Set(pendingInvitations.value.map(inv => inv.receiverId))
  return friends.value.filter(f => !memberIds.has(f.id) && !pendingIds.has(f.id))
})
</script>

<template>
  <UContainer>
    <div
      v-if="playgroupError"
      class="py-16 text-center"
    >
      <p class="text-muted">
        This playgroup doesn't exist or you're not a member.
      </p>
      <UButton
        label="Back to Playgroups"
        to="/playgroups"
        variant="ghost"
        class="mt-4"
      />
    </div>
    <template v-else-if="playgroup">
      <PlaygroupHeader
        :playgroup="playgroup"
        :is-owner="isOwner"
        :current-user-id="currentUserId"
        :invitable-friends="invitableFriends"
        @updated="refresh"
        @disbanded="navigateTo('/playgroups')"
        @left="navigateTo('/playgroups')"
        @member-invited="refreshSentInvitations"
      />
      <PlaygroupMembers
        :members="playgroup.members"
        :owner-id="playgroup.ownerId"
        :current-user-id="currentUserId"
        :is-owner="isOwner"
        :playgroup-id="playgroupId"
        @updated="refresh"
        @left="navigateTo('/playgroups')"
      />
      <PlaygroupPendingInvitations
        v-if="isOwner && pendingInvitations.length"
        :invitations="pendingInvitations"
        @updated="refreshSentInvitations"
      />
    </template>
  </UContainer>
</template>
