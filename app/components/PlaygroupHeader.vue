<script setup lang="ts">
import type { FriendSummary } from '#shared/schemas/social'
import type { PlaygroupDetail } from '#shared/schemas/playgroup'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import FriendCard from '~/components/FriendCard.vue'

const props = defineProps<{
  playgroup: PlaygroupDetail
  isOwner: boolean
  currentUserId?: string
  invitableFriends: FriendSummary[]
}>()

const emit = defineEmits<{
  updated: []
  disbanded: []
  left: []
  memberInvited: []
}>()

const { updatePlaygroup, uploadPlaygroupImage, disbandPlaygroup, inviteMember, removeMember } = usePlaygroupActions()

const isRenameOpen = ref(false)
const newName = ref('')

function openRename() {
  newName.value = props.playgroup.name
  isRenameOpen.value = true
}

async function handleRename() {
  if (!newName.value.trim()) return
  await updatePlaygroup(props.playgroup.id, newName.value.trim())
  isRenameOpen.value = false
  emit('updated')
}

const imageInput = ref<HTMLInputElement | null>(null)
const isUploadingImage = ref(false)

async function handleImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploadingImage.value = true
  try {
    await uploadPlaygroupImage(props.playgroup.id, file)
    emit('updated')
  } finally {
    isUploadingImage.value = false
    if (imageInput.value) imageInput.value.value = ''
  }
}

async function handleDisband() {
  await disbandPlaygroup(props.playgroup.id)
  emit('disbanded')
}

async function handleLeave() {
  if (!props.currentUserId) return
  await removeMember(props.playgroup.id, props.currentUserId)
  emit('left')
}

const isInviteOpen = ref(false)
const processingInvite = ref<string | null>(null)

async function handleInvite(friendId: string) {
  processingInvite.value = friendId
  try {
    await inviteMember(props.playgroup.id, friendId)
    emit('memberInvited')
  } finally {
    processingInvite.value = null
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="relative group shrink-0">
        <div class="size-16 rounded-full overflow-hidden bg-elevated flex items-center justify-center">
          <img
            v-if="playgroup.imageUrl"
            :src="playgroup.imageUrl"
            :alt="playgroup.name"
            class="w-full h-full object-cover"
          >
          <UIcon
            v-else
            name="i-lucide-shield"
            class="size-8 text-muted"
          />
        </div>
        <button
          v-if="isOwner"
          class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          :disabled="isUploadingImage"
          @click="imageInput?.click()"
        >
          <UIcon
            v-if="!isUploadingImage"
            name="i-lucide-camera"
            class="size-5 text-white"
          />
          <UIcon
            v-else
            name="i-lucide-loader-circle"
            class="size-5 text-white animate-spin"
          />
        </button>
        <input
          ref="imageInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          @change="handleImageChange"
        >
      </div>
      <UPageHeader :title="playgroup.name" />
    </div>

    <div class="flex gap-2">
      <template v-if="isOwner">
        <UButton
          label="Rename"
          icon="i-lucide-pencil"
          variant="outline"
          color="neutral"
          @click="openRename"
        />
        <UButton
          label="Invite"
          icon="i-lucide-user-plus"
          @click="isInviteOpen = true"
        />
        <ConfirmationModal
          description="Are you sure you want to disband this playgroup? This cannot be undone."
          :on-confirm="handleDisband"
        >
          <template #button>
            <UButton
              label="Disband"
              icon="i-lucide-trash-2"
              color="error"
              variant="soft"
            />
          </template>
        </ConfirmationModal>
      </template>
      <ConfirmationModal
        v-else
        description="Are you sure you want to leave this playgroup?"
        :on-confirm="handleLeave"
      >
        <template #button>
          <UButton
            label="Leave"
            icon="i-lucide-log-out"
            color="error"
            variant="soft"
          />
        </template>
      </ConfirmationModal>
    </div>
  </div>

  <UModal
    v-model:open="isRenameOpen"
    title="Rename Playgroup"
  >
    <template #body>
      <UFormField
        label="Name"
        required
      >
        <UInput
          v-model="newName"
          autofocus
          @keyup.enter="handleRename"
        />
      </UFormField>
    </template>
    <template #footer>
      <UButton
        label="Cancel"
        variant="ghost"
        color="neutral"
        @click="isRenameOpen = false"
      />
      <UButton
        label="Save"
        :disabled="!newName.trim()"
        @click="handleRename"
      />
    </template>
  </UModal>

  <UModal
    v-model:open="isInviteOpen"
    title="Invite a Friend"
  >
    <template #body>
      <p
        v-if="!invitableFriends.length"
        class="text-sm text-muted"
      >
        All your friends are already in this playgroup, or you have no friends to invite yet.
      </p>
      <UPageList
        v-else
        divide
      >
        <div
          v-for="friend in invitableFriends"
          :key="friend.id"
          class="flex justify-between items-center"
        >
          <FriendCard :friend="friend" />
          <UButton
            label="Invite"
            icon="i-lucide-user-plus"
            variant="soft"
            :loading="processingInvite === friend.id"
            @click="handleInvite(friend.id)"
          />
        </div>
      </UPageList>
    </template>
  </UModal>
</template>
