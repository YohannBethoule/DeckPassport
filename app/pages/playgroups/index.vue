<script setup lang="ts">
import type { ReceivedPlaygroupInvitation } from '#shared/schemas/playgroup'

const {
  usePlaygroups, useReceivedInvitations,
  createPlaygroup, acceptInvitation, rejectInvitation
} = usePlaygroupActions()

const { data: playgroups, refresh: refreshPlaygroups } = await usePlaygroups()
const { data: receivedInvitations, refresh: refreshReceived } = await useReceivedInvitations()

const isCreateOpen = ref(false)
const newGroupName = ref('')

async function handleCreate() {
  if (!newGroupName.value.trim()) return
  const id = await createPlaygroup(newGroupName.value.trim())
  isCreateOpen.value = false
  newGroupName.value = ''
  await navigateTo(`/playgroups/${id}`)
}

type ProcessingAction = { id: number, type: 'accept' | 'reject' }
const processingAction = ref<ProcessingAction | null>(null)

async function handleAccept(inv: ReceivedPlaygroupInvitation) {
  processingAction.value = { id: inv.id, type: 'accept' }
  try {
    await acceptInvitation(inv.id)
    await Promise.all([refreshReceived(), refreshPlaygroups()])
  } finally {
    processingAction.value = null
  }
}

async function handleReject(invitationId: number) {
  processingAction.value = { id: invitationId, type: 'reject' }
  try {
    await rejectInvitation(invitationId)
    await refreshReceived()
  } finally {
    processingAction.value = null
  }
}
</script>

<template>
  <UContainer>
    <div class="flex items-center justify-between">
      <UPageHeader
        title="Playgroups"
        description="Gather your regulars and track who you play with."
      />
      <UButton
        label="New Playgroup"
        icon="i-lucide-plus"
        @click="isCreateOpen = true"
      />
    </div>

    <UModal
      v-model:open="isCreateOpen"
      title="Create Playgroup"
    >
      <template #body>
        <UFormField
          label="Name"
          required
        >
          <UInput
            v-model="newGroupName"
            placeholder="Friday Night Crew"
            autofocus
            @keyup.enter="handleCreate"
          />
        </UFormField>
      </template>
      <template #footer>
        <UButton
          label="Cancel"
          variant="ghost"
          color="neutral"
          @click="isCreateOpen = false"
        />
        <UButton
          label="Create"
          :disabled="!newGroupName.trim()"
          @click="handleCreate"
        />
      </template>
    </UModal>

    <UPageSection
      v-if="receivedInvitations.length"
      title="Invitations"
    >
      <UPageList divide>
        <div
          v-for="inv in receivedInvitations"
          :key="inv.id"
          class="flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full overflow-hidden bg-elevated flex items-center justify-center shrink-0">
              <img
                v-if="inv.playgroup.imageUrl"
                :src="inv.playgroup.imageUrl"
                :alt="inv.playgroup.name"
                class="w-full h-full object-cover"
              >
              <UIcon
                v-else
                name="i-lucide-shield"
                class="size-5 text-muted"
              />
            </div>
            <div>
              <p class="font-medium">
                {{ inv.playgroup.name }}
              </p>
              <p class="text-sm text-muted">
                Invited by {{ inv.sender.name }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton
              label="Accept"
              icon="i-lucide-check"
              :loading="processingAction?.id === inv.id && processingAction?.type === 'accept'"
              :disabled="processingAction?.id === inv.id && processingAction?.type === 'reject'"
              @click="handleAccept(inv)"
            />
            <UButton
              label="Decline"
              icon="i-lucide-x"
              color="error"
              variant="soft"
              :loading="processingAction?.id === inv.id && processingAction?.type === 'reject'"
              :disabled="processingAction?.id === inv.id && processingAction?.type === 'accept'"
              @click="handleReject(inv.id)"
            />
          </div>
        </div>
      </UPageList>
    </UPageSection>

    <UPageSection
      title="My Playgroups"
      :description="!playgroups.length ? 'No playgroups yet. Create one to get started.' : undefined"
    >
      <UPageList divide>
        <PlaygroupCard
          v-for="group in playgroups"
          :key="group.id"
          :playgroup="group"
        />
      </UPageList>
    </UPageSection>
  </UContainer>
</template>
