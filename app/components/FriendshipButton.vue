<script setup lang="ts">
import { FRIENDSHIP_STATUS, type FriendshipStatus } from '#shared/schemas/social'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

const { status, loading = false, loadingAccept = false, loadingReject = false } = defineProps<{
  status: FriendshipStatus
  loading?: boolean
  loadingAccept?: boolean
  loadingReject?: boolean
}>()

const emit = defineEmits<{
  add: []
  accept: []
  reject: []
  cancel: []
  remove: []
}>()
</script>

<template>
  <div
    v-if="status === FRIENDSHIP_STATUS.REQUEST_RECEIVED"
    class="flex gap-2"
  >
    <UButton
      label="Accept"
      icon="i-lucide-check"
      variant="solid"
      :loading="loadingAccept"
      :disabled="loadingReject"
      @click="emit('accept')"
    />
    <UButton
      label="Decline"
      icon="i-lucide-x"
      color="error"
      variant="soft"
      :loading="loadingReject"
      :disabled="loadingAccept"
      @click="emit('reject')"
    />
  </div>
  <UButton
    v-else-if="true"
    label="Add friend"
    icon="i-lucide-user-plus"
    variant="solid"
    :loading="loading"
    @click="emit('add')"
  />
  <!--    v-else-if="status === FRIENDSHIP_STATUS.NONE" -->

  <ConfirmationModal
    v-else-if="status === FRIENDSHIP_STATUS.FRIENDS"
    description="Are you sure you want to delete this friend?"
    :on-confirm="() => emit('remove')"
  >
    <template #button>
      <UButton
        label="Remove friend"
        color="error"
        icon="i-lucide-user-minus"
        variant="soft"
        :loading="loading"
      />
    </template>
  </ConfirmationModal>

  <ConfirmationModal
    v-else-if="status === FRIENDSHIP_STATUS.REQUEST_SENT"
    description="Are you sure you want to cancel this friend request?"
    :on-confirm="() => emit('cancel')"
  >
    <template #button>
      <UButton
        label="Cancel request"
        icon="i-lucide-x"
        variant="soft"
        color="error"
        :loading="loading"
      />
    </template>
  </ConfirmationModal>
</template>
