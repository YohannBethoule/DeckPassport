<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'

type DeckItem = {
  id: number
  deck: InsertDeckWithCommander
  archetypeNames: string[]
}

const props = defineProps<{
  decks: DeckItem[]
  total: number
  size: number
  status: string
  emptyMessage?: string
  emptyButtonLabel?: string
}>()

const page = defineModel<number>('page', { required: true })

const totalPages = computed(() => Math.ceil(props.total / props.size))

function nextPage() {
  page.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div
    v-if="decks.length > 0"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm py-8"
  >
    <NuxtLink
      v-for="item in decks"
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
    v-else-if="status !== 'pending'"
    class="py-16 text-center"
  >
    <UIcon
      name="i-lucide-inbox"
      class="text-4xl text-muted mb-4"
    />
    <p class="text-muted mb-4">
      {{ emptyMessage ?? 'No decks found.' }}
    </p>
    <UButton
      :label="emptyButtonLabel ?? 'Create a deck'"
      to="/deck/new"
      trailing-icon="i-lucide-arrow-right"
    />
  </div>

  <div
    v-if="totalPages > 1"
    class="flex justify-center items-center gap-4 py-8"
  >
    <UButton
      label="Previous"
      icon="i-lucide-chevron-left"
      variant="outline"
      color="neutral"
      :disabled="page <= 1"
      @click="prevPage"
    />
    <span class="text-sm text-muted">Page {{ page }} / {{ totalPages }}</span>
    <UButton
      label="Next"
      trailing-icon="i-lucide-chevron-right"
      variant="outline"
      color="neutral"
      :disabled="page >= totalPages"
      @click="nextPage"
    />
  </div>
</template>
