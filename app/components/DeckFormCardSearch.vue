<script setup lang="ts">
import type { ScryfallCard } from '~/composables/useScryfall'

defineProps<{
  label: string
  name: string
  placeholder: string
  modelValue?: string
  searchResults: ScryfallCard[]
  prints: ScryfallCard[]
  loadingPrints: boolean
  selectedImageUrl?: string
  isDoubleFaced?: boolean
  faceIndex?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
  'select': [name: string]
  'selectPrint': [print: ScryfallCard]
  'flip': []
}>()
</script>

<template>
  <UFormField
    :label="label"
    :name="name"
    :required="name === 'commanderName'"
  >
    <div class="flex gap-2 items-center">
      <UInputMenu
        :model-value="modelValue"
        :items="searchResults.map((c: ScryfallCard) => c.name)"
        :placeholder="placeholder"
        class="flex-1"
        @update:search-term="emit('search', $event)"
        @update:model-value="(v: string) => { emit('update:modelValue', v); emit('select', v) }"
      />
      <UButton
        v-if="isDoubleFaced"
        type="button"
        icon="i-lucide-flip-horizontal-2"
        variant="outline"
        size="sm"
        title="Flip card"
        @click="emit('flip')"
      />
    </div>
  </UFormField>

  <UFormField
    v-if="prints.length > 0 || loadingPrints"
    label="Select Print"
    :name="`${name}Print`"
  >
    <PrintSelector
      :prints="prints"
      :loading="loadingPrints"
      :selected-image-url="selectedImageUrl"
      :face-index="faceIndex"
      @select="emit('selectPrint', $event)"
    />
  </UFormField>
</template>
