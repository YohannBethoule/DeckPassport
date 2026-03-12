<script setup lang="ts">
const { useSession } = useAuth()
const session = useSession()

const userId = computed(() => session.value?.data?.user?.id)

const { data: rawDecks } = await useFetch('/api/decks/search', {
  query: computed(() => ({
    sort: 'updatedAt',
    order: 'desc',
    size: 20,
    userId: userId.value
  }))
})

const myDecks = computed(() => {
  if (!rawDecks.value) return []
  return rawDecks.value.map(d => ({
    id: d.id,
    ...toDeckView(d)
  }))
})
</script>

<template>
  <UContainer>
    <UPageHeader
      title="My Decks"
      description="All the deck passports you've created."
      icon="i-lucide-layout-grid"
    />

    <div
      v-if="myDecks.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm py-8"
    >
      <NuxtLink
        v-for="item in myDecks"
        :key="item.id"
        :to="`/deck/${item.id}`"
        class="hover:opacity-80 transition-opacity h-full"
      >
        <DeckView
          :deck="item.deck"
          :archetype-names="item.archetypeNames"
          compact
        />
      </NuxtLink>
    </div>

    <div
      v-else
      class="py-16 text-center"
    >
      <UIcon
        name="i-lucide-inbox"
        class="text-4xl text-muted mb-4"
      />
      <p class="text-muted mb-4">
        You haven't created any decks yet.
      </p>
      <UButton
        label="Create your first deck"
        to="/deck/new"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>
  </UContainer>
</template>
