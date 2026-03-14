<script setup lang="ts">
import type { ScryfallCard } from '~/composables/useScryfall'
import { getCardImageUri } from '~/composables/useScryfall'
import { MAX_CORE_CARDS, type CoreCard } from '#shared/schemas/deck'
import type { ManaColor } from '#shared/schemas/commander'

const props = defineProps<{
  modelValue: CoreCard[]
  colorIdentity: ManaColor[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CoreCard[]]
}>()

const { searchCards } = useScryfall()

const searchTerm = ref('')
const searchResults = ref<ScryfallCard[]>([])

const canAdd = computed(() => props.modelValue.length < MAX_CORE_CARDS)

async function onSearch(query: string) {
  searchTerm.value = query
  if (query.length < 2) {
    searchResults.value = []
    return
  }
  searchResults.value = await searchCards(query, props.colorIdentity)
}

function onSelect(name: string) {
  if (!name || !canAdd.value) return
  const card = searchResults.value.find(c => c.name === name)
  if (!card) return

  if (props.modelValue.some(c => c.name === card.name)) return

  const imageUrl = getCardImageUri(card)
  if (!imageUrl) return

  emit('update:modelValue', [...props.modelValue, { name: card.name, imageUrl }])
  searchTerm.value = ''
  searchResults.value = []
}

function onRemove(index: number) {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}
</script>

<template>
  <UFormField
    label="Core Cards"
    name="coreCards"
    :hint="`${modelValue.length}/${MAX_CORE_CARDS}`"
  >
    <div class="space-y-3">
      <div
        v-if="modelValue.length > 0"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="(card, index) in modelValue"
          :key="card.name"
          color="neutral"
          variant="subtle"
          size="lg"
        >
          {{ card.name }}
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="neutral"
            variant="ghost"
            class="ml-1"
            @click="onRemove(index)"
          />
        </UBadge>
      </div>

      <UInputMenu
        v-if="canAdd"
        :model-value="searchTerm"
        :items="searchResults.map(c => c.name)"
        placeholder="Search for a card..."
        class="w-full"
        @update:search-term="onSearch"
        @update:model-value="onSelect"
      />
    </div>
  </UFormField>
</template>
