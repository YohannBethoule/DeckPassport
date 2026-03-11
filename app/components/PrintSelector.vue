<script setup lang="ts">
import { type ScryfallCard, getCardImageUri } from '~/composables/useScryfall'

defineProps<{
  prints: ScryfallCard[]
  loading: boolean
  selectedImageUrl?: string
}>()

const emit = defineEmits<{
  select: [print: ScryfallCard]
}>()
</script>

<template>
  <div
    v-if="loading"
    class="text-sm text-dimmed"
  >
    Loading prints...
  </div>
  <div
    v-else-if="prints.length > 0"
    class="flex gap-2 overflow-x-auto p-2"
  >
    <button
      v-for="print in prints"
      :key="print.scryfall_uri"
      type="button"
      class="shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer"
      :class="getCardImageUri(print) === selectedImageUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent opacity-70 hover:opacity-100'"
      :title="`${print.set_name} #${print.collector_number}`"
      @click="emit('select', print)"
    >
      <img
        :src="getCardImageUri(print, 'small')"
        :alt="`${print.set_name} #${print.collector_number}`"
        class="w-24 h-auto"
      >
    </button>
  </div>
</template>
