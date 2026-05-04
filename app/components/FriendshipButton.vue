<script setup lang="ts">
import { FRIENDSHIP_STATUS, type FriendshipStatus } from '#shared/schemas/social'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

const { status, loading = false } = defineProps<{
  status: FriendshipStatus
  loading?: boolean
}>()

const emit = defineEmits<{
  add: []
  accept: []
  reject: []
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
      :loading="loading"
      @click="emit('accept')"
    />
    <UButton
      label="Decline"
      icon="i-lucide-x"
      color="error"
      variant="soft"
      :loading="loading"
      @click="emit('reject')"
    />
  </div>
  <UButton
    v-else-if="status === FRIENDSHIP_STATUS.NONE"
    label="Add friend"
    icon="i-lucide-user-plus"
    variant="solid"
    :loading="loading"
    @click="emit('add')"
  />

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
  <UButton
    v-else-if="status === FRIENDSHIP_STATUS.REQUEST_SENT"
    label="Invite sent"
    icon="i-lucide-hourglass"
    variant="soft"
    disabled
  />
</template>

<style scoped>

</style>
