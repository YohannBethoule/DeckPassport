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
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
  'select': [name: string]
  'selectPrint': [print: ScryfallCard]
}>()
</script>

<template>
  <UFormField
    :label="label"
    :name="name"
    :required="name === 'commanderName'"
  >
    <UInputMenu
      :model-value="modelValue"
      :items="searchResults.map((c: ScryfallCard) => c.name)"
      :placeholder="placeholder"
      class="w-full"
      @update:search-term="emit('search', $event)"
      @update:model-value="(v: string) => { emit('update:modelValue', v); emit('select', v) }"
    />
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
      @select="emit('selectPrint', $event)"
    />
  </UFormField>
</template>
