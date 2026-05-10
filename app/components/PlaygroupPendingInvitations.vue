<script setup lang="ts">
import type { SentPlaygroupInvitation } from '#shared/schemas/playgroup'
import FriendCard from '~/components/FriendCard.vue'

defineProps<{
  invitations: SentPlaygroupInvitation[]
}>()

const emit = defineEmits<{
  updated: []
}>()

const { cancelInvitation } = usePlaygroupActions()

const processingCancelInv = ref<number | null>(null)

async function handleCancel(invitationId: number) {
  processingCancelInv.value = invitationId
  try {
    await cancelInvitation(invitationId)
    emit('updated')
  } finally {
    processingCancelInv.value = null
  }
}
</script>

<template>
  <UPageSection title="Pending Invitations">
    <UPageList divide>
      <div
        v-for="inv in invitations"
        :key="inv.id"
        class="flex justify-between items-center"
      >
        <FriendCard :friend="inv.receiver" />
        <UButton
          label="Cancel"
          icon="i-lucide-x"
          color="error"
          variant="ghost"
          size="sm"
          :loading="processingCancelInv === inv.id"
          @click="handleCancel(inv.id)"
        />
      </div>
    </UPageList>
  </UPageSection>
</template>
