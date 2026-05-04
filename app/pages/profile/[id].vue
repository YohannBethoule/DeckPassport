<script setup lang="ts">
import { FRIENDSHIP_STATUS, type FriendshipStatusResponse } from '#shared/schemas/social'
import FriendshipButton from '~/components/FriendshipButton.vue'

const { addFriend, acceptRequest, rejectRequest, removeFriend } = useFriendshipActions()

const route = useRoute()
const profileId = route.params.id as string

const { useSession, updateUser } = useAuth()
const session = useSession()

const isOwnProfile = computed(() => session.value?.data?.user?.id === profileId)

const friendshipStatus = ref<FriendshipStatusResponse>({ status: FRIENDSHIP_STATUS.NONE })
const isFriendshipRefreshing = ref(false)

async function refreshFriendshipStatus() {
  const data = await $fetch<FriendshipStatusResponse>(`/api/friends/${profileId}/status`).catch(() => null)
  if (data) friendshipStatus.value = data
}

if (!isOwnProfile.value) {
  await refreshFriendshipStatus()
}

async function handleFriendshipAction(action: 'add' | 'accept' | 'reject' | 'remove') {
  isFriendshipRefreshing.value = true
  switch (action) {
    case 'add':
      await addFriend(profileId)
      break
    case 'accept':
      if (friendshipStatus.value.requestId) await acceptRequest(friendshipStatus.value.requestId)
      break
    case 'reject':
      if (friendshipStatus.value.requestId) await rejectRequest(friendshipStatus.value.requestId)
      break
    case 'remove':
      await removeFriend(profileId)
      break
  }
  await refreshFriendshipStatus()
  isFriendshipRefreshing.value = false
}

const { data: profile, error, refresh: refreshProfile } = await useFetch(`/api/user/${profileId}`)

const isEditingName = ref(false)
const editedName = ref('')
const nameError = ref('')
const nameSaving = ref(false)

function startEditingName() {
  editedName.value = profile.value?.name ?? ''
  nameError.value = ''
  isEditingName.value = true
}

function cancelEditingName() {
  isEditingName.value = false
  nameError.value = ''
}

async function saveName() {
  const trimmed = editedName.value.trim()
  if (!trimmed) {
    nameError.value = 'Name cannot be empty'
    return
  }
  if (trimmed === profile.value?.name) {
    isEditingName.value = false
    return
  }

  nameSaving.value = true
  nameError.value = ''
  try {
    const { error: updateError } = await updateUser({ name: trimmed })
    if (updateError) {
      nameError.value = updateError.message ?? 'Failed to update name'
      return
    }
    await refreshProfile()
    isEditingName.value = false
  } catch {
    nameError.value = 'Failed to update name'
  } finally {
    nameSaving.value = false
  }
}

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'User not found' })
}

const page = ref(1)
const size = 12
const filters = ref<Record<string, string | number | undefined>>({})

watch(filters, () => {
  page.value = 1
})

const { data: decksData, status } = await useFetch('/api/decks/search', {
  query: computed(() => ({
    sort: 'updatedAt',
    order: 'desc',
    size,
    userId: profileId,
    page: page.value,
    ...filters.value
  })),
  watch: [page, filters]
})

const decks = computed(() => {
  if (!decksData.value?.items) return []
  return decksData.value.items.map(d => ({
    id: d.id,
    ...toDeckView(d)
  }))
})

const memberSince = computed(() => {
  if (!profile.value?.createdAt) return ''
  return new Date(profile.value.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

useSeoMeta({
  title: `${profile.value?.name ?? 'User'}'s Profile - EDH DeckPassport`,
  description: `View ${profile.value?.name ?? 'this user'}'s deck passports on EDH DeckPassport.`
})
</script>

<template>
  <UContainer>
    <div class="flex items-center gap-4 py-8">
      <UAvatar
        :src="profile?.image ?? undefined"
        :alt="profile?.name ?? 'User'"
        size="xl"
      />
      <div>
        <div
          v-if="isEditingName"
          class="flex items-center gap-2"
        >
          <UInput
            v-model="editedName"
            placeholder="Your name"
            autofocus
            size="lg"
            @keyup.enter="saveName"
            @keyup.escape="cancelEditingName"
          />
          <UButton
            icon="i-lucide-check"
            color="primary"
            variant="ghost"
            size="lg"
            :loading="nameSaving"
            @click="saveName"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="lg"
            :disabled="nameSaving"
            @click="cancelEditingName"
          />
        </div>
        <div
          v-else
          class="flex items-center gap-2"
        >
          <h1 class="text-2xl font-bold">
            {{ profile?.name }}
          </h1>
          <UButton
            v-if="isOwnProfile"
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="startEditingName"
          />
        </div>
        <p
          v-if="nameError"
          class="text-sm text-red-500 mt-1"
        >
          {{ nameError }}
        </p>
        <p class="text-sm text-muted">
          Member since {{ memberSince }}
        </p>
      </div>

      <div
        v-if="!isOwnProfile"
        class="ml-auto"
      >
        <FriendshipButton
          :status="friendshipStatus.status"
          :loading="isFriendshipRefreshing"
          @add="handleFriendshipAction('add')"
          @accept="handleFriendshipAction('accept')"
          @reject="handleFriendshipAction('reject')"
          @remove="handleFriendshipAction('remove')"
        />
      </div>
    </div>

    <USeparator />

    <UPageHeader
      :title="isOwnProfile ? 'My Decks' : `${profile?.name}'s Decks`"
      :description="isOwnProfile
        ? 'All the deck passports you\'ve created.'
        : `Deck passports created by ${profile?.name}.`"
      icon="i-lucide-layout-grid"
    />

    <DeckFilters
      v-model="filters"
      class="mt-4"
      :total="decksData?.total"
    />

    <DeckList
      v-model:page="page"
      :decks="decks"
      :total="decksData?.total ?? 0"
      :size="size"
      :status="status"
      :empty-message="isOwnProfile ? 'You haven\'t created any decks yet.' : 'This user hasn\'t created any decks yet.'"
      :empty-button-label="isOwnProfile ? 'Create your first deck' : undefined"
    />
  </UContainer>
</template>
