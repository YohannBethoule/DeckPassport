<script setup lang="ts">
import { DESCRIPTION_MAX_LENGTH, type InsertDeckWithCommander } from '#shared/schemas/deck'
import { insertDeckWithCommanderFormSchema } from '#shared/schemas/deck'
import { type ManaColor, type ChromaticColor, CHROMATIC_COLORS } from '#shared/schemas/commander'
import type { ScryfallCard } from '~/composables/useScryfall'

const form = reactive({
  commanderName: '',
  title: '',
  imageUrl: '',
  bracket: undefined as number | undefined,
  colors: [] as ManaColor[],
  description: '',
  winCondition: '',
  coreCards: '',
  archetypes: [] as number[],
  deckListUrl: '',
  partnerCommanderName: undefined as string | undefined,
  partnerImageUrl: undefined as string | undefined,
  partnerColors: undefined as ManaColor[] | undefined,
  backgroundName: undefined as string | undefined,
  backgroundImageUrl: undefined as string | undefined,
  commanderDefaultImageUrl: undefined as string | undefined,
  partnerDefaultImageUrl: undefined as string | undefined,
  backgroundDefaultImageUrl: undefined as string | undefined
})

const partnerMode = ref<PartnerMode>(false)

const { searchCommanders, searchBackgrounds } = useScryfall()

function mergeColors(mainCard: ScryfallCard | null, partnerCard: ScryfallCard | null) {
  const mainColors = mainCard?.color_identity.filter(
    (c): c is ChromaticColor => (CHROMATIC_COLORS as readonly string[]).includes(c)
  ) ?? []
  const partnerColors = partnerCard?.color_identity.filter(
    (c): c is ChromaticColor => (CHROMATIC_COLORS as readonly string[]).includes(c)
  ) ?? []
  const merged = [...new Set([...mainColors, ...partnerColors])]
  form.colors = merged.length ? merged : ['C']
}

function getDefaultTitle(mainCard: ScryfallCard | null, partnerCard: ScryfallCard | null) {
  const mainName = mainCard?.name
  const partnerName = partnerCard?.name
  if (mainName && partnerName) return `${mainName} & ${partnerName}`
  if (mainName) return mainName
  return ''
}

function updateTitleIfDefault(previousDefault: string, mainCard: ScryfallCard | null, partnerCard: ScryfallCard | null) {
  if (!form.title || form.title === previousDefault) {
    form.title = getDefaultTitle(mainCard, partnerCard)
  }
}

const commander = useCardSearch({
  searchFn: searchCommanders,
  onSelect(card, imageUrl) {
    const prevDefault = getDefaultTitle(commander.selectedCard.value, partner.selectedCard.value)
    if (imageUrl) {
      form.imageUrl = imageUrl
      form.commanderDefaultImageUrl = imageUrl
    }
    mergeColors(card, partner.selectedCard.value)
    updateTitleIfDefault(prevDefault, card, partner.selectedCard.value)
  }
})

const partner = useCardSearch({
  searchFn: (query: string) => {
    const search = partnerMode.value === BACKGROUND ? searchBackgrounds : searchCommanders
    return search(query)
  },
  onSelect(card, imageUrl) {
    const prevDefault = getDefaultTitle(commander.selectedCard.value, null)
    if (partnerMode.value === BACKGROUND) {
      form.backgroundName = card.name
      if (imageUrl) {
        form.backgroundImageUrl = imageUrl
        form.backgroundDefaultImageUrl = imageUrl
      }
    } else {
      form.partnerCommanderName = card.name
      if (imageUrl) {
        form.partnerImageUrl = imageUrl
        form.partnerDefaultImageUrl = imageUrl
      }
      form.partnerColors = card.color_identity.filter(
        (c): c is ChromaticColor => (CHROMATIC_COLORS as readonly string[]).includes(c)
      )
      if (!form.partnerColors.length) {
        form.partnerColors = ['C']
      }
    }
    mergeColors(commander.selectedCard.value, card)
    updateTitleIfDefault(prevDefault, commander.selectedCard.value, card)
  }
})

function onCommanderPrintSelect(print: ScryfallCard) {
  const imageUrl = commander.selectPrint(print)
  if (imageUrl) form.imageUrl = imageUrl
}

function onPartnerPrintSelect(print: ScryfallCard) {
  const imageUrl = partner.selectPrint(print)
  if (!imageUrl) return
  if (partnerMode.value === BACKGROUND) {
    form.backgroundImageUrl = imageUrl
  } else {
    form.partnerImageUrl = imageUrl
  }
}

function onTogglePartner(mode: 'partner' | 'background') {
  const prevDefault = getDefaultTitle(commander.selectedCard.value, partner.selectedCard.value)
  partner.clear()
  form.partnerCommanderName = undefined
  form.partnerImageUrl = undefined
  form.partnerColors = undefined
  form.partnerDefaultImageUrl = undefined
  form.backgroundName = undefined
  form.backgroundImageUrl = undefined
  form.backgroundDefaultImageUrl = undefined
  mergeColors(commander.selectedCard.value, null)
  updateTitleIfDefault(prevDefault, commander.selectedCard.value, null)
  if (partnerMode.value === mode) {
    partnerMode.value = false
  } else {
    partnerMode.value = mode
  }
}

const { data: bracketOptions } = await useFetch('/api/brackets', {
  transform: (brackets: { id: number, name: string, description: string | null }[]) =>
    brackets.map(b => ({ label: `Bracket ${b.id} - ${b.name}`, value: b.id }))
})

const { data: archetypeOptions } = await useFetch('/api/archetypes', {
  transform: (archetypes: { id: number, name: string }[]) =>
    archetypes.map(a => ({ label: a.name, value: a.id }))
})

const secondArchetypeOptions = computed(() => {
  if (!archetypeOptions.value) return []
  return archetypeOptions.value.filter(a => a.value !== form.archetypes[0])
})

const colorOptions = [
  { label: 'White', value: 'W' },
  { label: 'Blue', value: 'U' },
  { label: 'Black', value: 'B' },
  { label: 'Red', value: 'R' },
  { label: 'Green', value: 'G' },
  { label: 'Colorless', value: 'C' }
]

const emit = defineEmits<{
  submit: [data: InsertDeckWithCommander]
}>()

function onSubmit() {
  emit('submit', { ...form } as InsertDeckWithCommander)
}
</script>

<template>
  <UForm
    :schema="insertDeckWithCommanderFormSchema"
    :state="form"
    class="max-w-2xl mx-auto space-y-6"
    @submit="onSubmit"
  >
    <DeckFormCardSearch
      v-model="form.commanderName"
      label="Commander Name"
      name="commanderName"
      placeholder="e.g. Atraxa, Praetors' Voice"
      :search-results="commander.searchResults.value"
      :prints="commander.prints.value"
      :loading-prints="commander.loadingPrints.value"
      :selected-image-url="form.imageUrl"
      @search="commander.onSearch"
      @select="commander.onCardSelect"
      @select-print="onCommanderPrintSelect"
    />

    <DeckFormPartnerToggle
      :partner-mode="partnerMode"
      @toggle="onTogglePartner"
    />

    <template v-if="partnerMode === PARTNER">
      <DeckFormCardSearch
        v-model="form.partnerCommanderName"
        label="Partner Commander Name"
        name="partnerCommanderName"
        placeholder="e.g. Tymna the Weaver"
        :search-results="partner.searchResults.value"
        :prints="partner.prints.value"
        :loading-prints="partner.loadingPrints.value"
        :selected-image-url="form.partnerImageUrl"
        @search="partner.onSearch"
        @select="partner.onCardSelect"
        @select-print="onPartnerPrintSelect"
      />
    </template>

    <template v-if="partnerMode === BACKGROUND">
      <DeckFormCardSearch
        v-model="form.backgroundName"
        label="Background Name"
        name="backgroundName"
        placeholder="e.g. Far Traveler"
        :search-results="partner.searchResults.value"
        :prints="partner.prints.value"
        :loading-prints="partner.loadingPrints.value"
        :selected-image-url="form.backgroundImageUrl"
        @search="partner.onSearch"
        @select="partner.onCardSelect"
        @select-print="onPartnerPrintSelect"
      />
    </template>

    <UFormField
      label="Deck Title"
      name="title"
      required
    >
      <UInput
        v-model="form.title"
        placeholder="e.g. Songs of Bombadil"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Bracket"
      name="bracket"
      required
    >
      <USelect
        v-model="form.bracket"
        :items="bracketOptions ?? []"
        placeholder="Select a bracket"
        class="w-full"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField
        label="Primary Archetype"
        name="archetypes[0]"
      >
        <USelect
          v-model="form.archetypes[0]"
          :items="archetypeOptions ?? []"
          placeholder="Select an archetype"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Secondary Archetype"
        name="archetypes[1]"
      >
        <USelect
          v-model="form.archetypes[1]"
          :items="secondArchetypeOptions"
          placeholder="Select an archetype"
          class="w-full"
          :disabled="!form.archetypes[0]"
        />
      </UFormField>
    </div>

    <DeckFormColorPicker
      v-model="form.colors"
      :color-options="colorOptions"
    />

    <UFormField
      label="Short Description / Lore"
      name="description"
      :hint="DESCRIPTION_MAX_LENGTH + ' max characters'"
      required
    >
      <UTextarea
        v-model="form.description"
        placeholder="Give a quick presentation of the lore and gameplay of your deck"
        :rows="3"
        class="w-full"
        :maxlength="DESCRIPTION_MAX_LENGTH"
        minlength="0"
      />
    </UFormField>

    <UFormField
      label="How does it win?"
      name="winCondition"
      :hint="DESCRIPTION_MAX_LENGTH + ' max characters'"
      required
    >
      <UTextarea
        v-model="form.winCondition"
        placeholder="e.g. Infinite combo with X + Y, or commander damage..."
        :rows="2"
        class="w-full"
        :maxlength="DESCRIPTION_MAX_LENGTH"
        minlength="0"
      />
    </UFormField>

    <UFormField
      label="Deck List URL"
      name="deckListUrl"
    >
      <UInput
        v-model="form.deckListUrl"
        placeholder="https://www.moxfield.com/decks/..."
        class="w-full"
      />
    </UFormField>

    <div class="flex justify-end pt-4">
      <UButton
        type="submit"
        label="Generate Passport"
        icon="i-lucide-image"
        size="lg"
        data-umami-event="generate-passport-click"
      />
    </div>
  </UForm>
</template>
