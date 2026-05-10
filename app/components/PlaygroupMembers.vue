<script setup lang="ts">
import type { MemberSummary } from '#shared/schemas/playgroup'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import FriendCard from '~/components/FriendCard.vue'

const props = defineProps<{
  members: MemberSummary[]
  ownerId: string
  currentUserId?: string
  isOwner: boolean
  playgroupId: number
}>()

const emit = defineEmits<{
  updated: []
  left: []
}>()

const { removeMember } = usePlaygroupActions()

const processingRemove = ref<string | null>(null)

async function handleRemove(userId: string) {
  processingRemove.value = userId
  try {
    await removeMember(props.playgroupId, userId)
    if (userId === props.currentUserId) {
      emit('left')
    } else {
      emit('updated')
    }
  } finally {
    processingRemove.value = null
  }
}
</script>

<template>
  <UPageSection :title="`Members (${members.length})`">
    <UPageList divide>
      <div
        v-for="member in members"
        :key="member.id"
        class="flex justify-between items-center"
      >
        <FriendCard :friend="member" />
        <div class="flex items-center gap-2">
          <UBadge
            v-if="member.id === ownerId"
            label="Owner"
            variant="soft"
            color="primary"
          />
          <ConfirmationModal
            v-if="isOwner && member.id !== currentUserId"
            :description="`Remove ${member.name} from the playgroup?`"
            :on-confirm="() => handleRemove(member.id)"
          >
            <template #button>
              <UButton
                label="Remove"
                icon="i-lucide-user-minus"
                color="error"
                variant="ghost"
                size="sm"
                :loading="processingRemove === member.id"
              />
            </template>
          </ConfirmationModal>
        </div>
      </div>
    </UPageList>
  </UPageSection>
</template>
