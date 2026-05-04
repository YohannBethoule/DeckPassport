<script setup lang="ts">
import FriendCard from '~/components/FriendCard.vue'
import FriendshipButton from '~/components/FriendshipButton.vue'
import { FRIEND_REQUEST_TYPE, FRIENDSHIP_STATUS } from '#shared/schemas/social'
import type { FriendSummary, ReceivedFriendRequest, SentFriendRequest } from '#shared/schemas/social'

const { removeFriend, acceptRequest, rejectRequest } = useFriendshipActions()

const { data: friends, refresh: refreshFriends } = await useFetch<FriendSummary[]>('/api/friends', {
  default: () => []
})
const { data: receivedRequests, refresh: refreshReceivedRequests } = await useFetch<ReceivedFriendRequest[]>('/api/friends/requests', {
  default: () => [],
  query: { type: FRIEND_REQUEST_TYPE.RECEIVED }
})
const { data: sentRequests } = await useFetch<SentFriendRequest[]>('/api/friends/requests', {
  default: () => [],
  query: { type: FRIEND_REQUEST_TYPE.SENT }
})

const processingId = ref<string | number | null>(null)

async function handleRemoveFriend(friendId: string) {
  processingId.value = friendId
  await removeFriend(friendId)
  await refreshFriends()
  processingId.value = null
}

async function handleAcceptRequest(requestId: number) {
  processingId.value = requestId
  await acceptRequest(requestId)
  await Promise.all([refreshReceivedRequests(), refreshFriends()])
  processingId.value = null
}

async function handleRejectRequest(requestId: number) {
  processingId.value = requestId
  await rejectRequest(requestId)
  await refreshReceivedRequests()
  processingId.value = null
}
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Community"
      description="Put the Gathering at the center of the Magic."
    />

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
            :loading="processingId === friend.id"
            @remove="handleRemoveFriend(friend.id)"
          />
        </div>
      </UPageList>
    </UPageSection>

    <UPageSection
      title="Friend Requests"
      :description="(!receivedRequests.length && !sentRequests.length) ? 'No pending friend requests.' : undefined"
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
            :loading="processingId === request.id"
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
          <FriendshipButton :status="FRIENDSHIP_STATUS.REQUEST_SENT" />
        </div>
      </UPageList>
    </UPageSection>
  </UContainer>
</template>
