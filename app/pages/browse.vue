<script setup lang="ts">
const page = ref(1)
const size = 12

const { data, status } = await useFetch('/api/decks/search', {
  query: computed(() => ({
    sort: 'createdAt',
    order: 'desc',
    size,
    page: page.value
  })),
  watch: [page]
})

const decks = computed(() => {
  if (!data.value?.items) return []
  return data.value.items.map(d => ({
    id: d.id,
    ...toDeckView(d)
  }))
})

useSeoMeta({
  title: 'Browse Decks - EDH DeckPassport',
  description: 'Browse all EDH commander deck passports created by the community.'
})
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Browse Decks"
      description="Explore deck passports created by the community."
      icon="i-lucide-search"
    />

    <DeckList
      v-model:page="page"
      :decks="decks"
      :total="data?.total ?? 0"
      :size="size"
      :status="status"
      empty-message="No decks found."
      empty-button-label="Create the first deck"
    />
  </UContainer>
</template>
