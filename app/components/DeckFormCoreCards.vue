<script setup lang="ts">
import { type ScryfallCard, getCardImageUri } from '~/composables/useScryfall'
import { MAX_CORE_CARDS, type CoreCard } from '#shared/schemas/deck'
import type { ManaColor } from '#shared/schemas/commander'

const props = defineProps<{
  modelValue: CoreCard[]
  colorIdentity: ManaColor[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CoreCard[]]
}>()

const { searchCards, fetchPrints } = useScryfall()

const searchTerm = ref('')
const searchResults = ref<ScryfallCard[]>([])
const pendingCard = ref<ScryfallCard | null>(null)
const pendingImageUrl = ref<string | undefined>()
const prints = ref<ScryfallCard[]>([])
const loadingPrints = ref(false)

const canAdd = computed(() => props.modelValue.length < MAX_CORE_CARDS)

async function onSearch(query: string) {
  searchTerm.value = query
  if (query.length < 2) {
    searchResults.value = []
    return
  }
  searchResults.value = await searchCards(query, props.colorIdentity)
}

async function onSelect(name: string) {
  if (!name || !canAdd.value) return
  const card = searchResults.value.find(c => c.name === name)
  if (!card) return

  pendingCard.value = card
  pendingImageUrl.value = getCardImageUri(card)
  searchResults.value = []
  searchTerm.value = ''

  prints.value = []
  if (card.prints_search_uri) {
    loadingPrints.value = true
    prints.value = await fetchPrints(card.prints_search_uri)
    loadingPrints.value = false
  }
}

function onSelectPrint(print: ScryfallCard) {
  const imageUrl = getCardImageUri(print)
  if (imageUrl) pendingImageUrl.value = imageUrl
  confirmAdd()
}

function confirmAdd() {
  const card = pendingCard.value
  const imageUrl = pendingImageUrl.value
  if (!card || !imageUrl) return
  if (!props.modelValue.some(c => c.name === card.name)) {
    emit('update:modelValue', [...props.modelValue, { name: card.name, imageUrl }])
  }
  clearPending()
}

function clearPending() {
  pendingCard.value = null
  pendingImageUrl.value = undefined
  prints.value = []
  loadingPrints.value = false
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
        v-if="canAdd && !pendingCard"
        :model-value="searchTerm"
        :items="searchResults.map(c => c.name)"
        placeholder="Search for a card..."
        class="w-full"
        @update:search-term="onSearch"
        @update:model-value="onSelect"
      />

      <div
        v-if="pendingCard"
        class="space-y-2 border border-default rounded-lg p-3"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium flex-1">{{ pendingCard.name }}</span>
          <UButton
            type="button"
            size="xs"
            label="Add"
            icon="i-lucide-plus"
            :disabled="!pendingImageUrl"
            @click="confirmAdd"
          />
          <UButton
            type="button"
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearPending"
          />
        </div>
        <PrintSelector
          v-if="prints.length > 0 || loadingPrints"
          :prints="prints"
          :loading="loadingPrints"
          :selected-image-url="pendingImageUrl"
          @select="onSelectPrint"
        />
      </div>
    </div>
  </UFormField>
</template>
