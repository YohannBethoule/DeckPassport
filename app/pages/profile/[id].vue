<script setup lang="ts">
const route = useRoute()
const profileId = route.params.id as string

const { useSession } = useAuth()
const session = useSession()

const isOwnProfile = computed(() => session.value?.data?.user?.id === profileId)

const { data: profile, error } = await useFetch(`/api/user/${profileId}`)

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
        <h1 class="text-2xl font-bold">
          {{ profile?.name }}
        </h1>
        <p class="text-sm text-muted">
          Member since {{ memberSince }}
        </p>
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
