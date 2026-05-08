<script setup lang="ts">
import FriendCard from '~/components/FriendCard.vue'
import FriendshipButton from '~/components/FriendshipButton.vue'
import { FRIEND_REQUEST_TYPE, FRIENDSHIP_STATUS } from '#shared/schemas/social'
import type { FriendSummary, ReceivedFriendRequest, SentFriendRequest } from '#shared/schemas/social'

const { removeFriend, acceptRequest, rejectRequest, cancelRequest } = useFriendshipActions()

const { data: friends, refresh: refreshFriends } = await useFetch<FriendSummary[]>('/api/friends', {
  default: () => []
})
const { data: receivedRequests, refresh: refreshReceivedRequests } = await useFetch<ReceivedFriendRequest[]>('/api/friends/requests', {
  default: () => [],
  query: { type: FRIEND_REQUEST_TYPE.RECEIVED }
})
const { data: sentRequests, refresh: refreshSentRequests } = await useFetch<SentFriendRequest[]>('/api/friends/requests', {
  default: () => [],
  query: { type: FRIEND_REQUEST_TYPE.SENT }
})

type ProcessingAction = { id: string | number, type: 'remove' | 'accept' | 'reject' | 'cancel' }
const processingAction = ref<ProcessingAction | null>(null)

function isProcessing(id: string | number, type: ProcessingAction['type']) {
  return processingAction.value?.id === id && processingAction.value?.type === type
}

async function handleRemoveFriend(friendId: string) {
  processingAction.value = { id: friendId, type: 'remove' }
  try {
    await removeFriend(friendId)
    await refreshFriends()
  } finally {
    processingAction.value = null
  }
}

async function handleAcceptRequest(requestId: number) {
  processingAction.value = { id: requestId, type: 'accept' }
  try {
    await acceptRequest(requestId)
    await Promise.all([refreshReceivedRequests(), refreshFriends()])
  } finally {
    processingAction.value = null
  }
}

async function handleRejectRequest(requestId: number) {
  processingAction.value = { id: requestId, type: 'reject' }
  try {
    await rejectRequest(requestId)
    await refreshReceivedRequests()
  } finally {
    processingAction.value = null
  }
}

async function handleCancelRequest(requestId: number) {
  processingAction.value = { id: requestId, type: 'cancel' }
  try {
    await cancelRequest(requestId)
    await refreshSentRequests()
  } finally {
    processingAction.value = null
  }
}
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Community"
      description="Put the Gathering at the center of the Magic."
    />

    <UPageSection
      v-if="receivedRequests.length || sentRequests.length"
      title="Friend Requests"
    >
      <UPageList divide>
        <div
          v-for="request in receivedRequests"
          :key="request.id"
          class="flex justify-between items-center"
        >
          <FriendCard :friend="request.sender" />
          <FriendshipButton
            :status="FRIENDSHIP_STATUS.REQUEST_RECEIVED"
            :loading-accept="isProcessing(request.id, 'accept')"
            :loading-reject="isProcessing(request.id, 'reject')"
            @accept="handleAcceptRequest(request.id)"
            @reject="handleRejectRequest(request.id)"
          />
        </div>
      </UPageList>
      <UPageList divide>
        <div
          v-for="request in sentRequests"
          :key="request.id"
          class="flex justify-between items-center"
        >
          <FriendCard :friend="request.receiver" />
          <FriendshipButton
            :status="FRIENDSHIP_STATUS.REQUEST_SENT"
            :loading="isProcessing(request.id, 'cancel')"
            @cancel="handleCancelRequest(request.id)"
          />
        </div>
      </UPageList>
    </UPageSection>

    <UPageSection
      title="My Friends"
      :description="!friends.length ? 'No friend already. Go on their profile page to send them a friend request.' : undefined"
    >
      <UPageList divide>
        <div
          v-for="friend in friends"
          :key="friend.id"
          class="flex items-center justify-between"
        >
          <FriendCard :friend="friend" />
          <FriendshipButton
            :status="FRIENDSHIP_STATUS.FRIENDS"
            :loading="isProcessing(friend.id, 'remove')"
            @remove="handleRemoveFriend(friend.id)"
          />
        </div>
      </UPageList>
    </UPageSection>
  </UContainer>
</template>
