<script setup lang="ts">
import { DESCRIPTION_MAX_LENGTH, type InsertDeckWithCommander } from '#shared/schemas/deck'
import { insertDeckWithCommanderFormSchema } from '#shared/schemas/deck'
import { type ChromaticColor, CHROMATIC_COLORS } from '#shared/schemas/commander'
import type { ScryfallCard } from '~/composables/useScryfall'

const props = withDefaults(defineProps<{
  initialValues?: InsertDeckWithCommander
  submitLabel?: string
}>(), {
  submitLabel: 'Generate Passport'
})

const form = reactive({
  commanderName: props.initialValues?.commanderName ?? '',
  title: props.initialValues?.title ?? '',
  imageUrl: props.initialValues?.imageUrl ?? '',
  bracket: props.initialValues?.bracket as number | undefined,
  colors: props.initialValues?.colors ?? [] as ManaColor[],
  description: props.initialValues?.description ?? '',
  winCondition: props.initialValues?.winCondition ?? '',
  coreCards: props.initialValues?.coreCards ?? '',
  archetypes: props.initialValues?.archetypes ?? [] as number[],
  deckListUrl: props.initialValues?.deckListUrl ?? '',
  partnerCommanderName: props.initialValues?.partnerCommanderName,
  partnerImageUrl: props.initialValues?.partnerImageUrl,
  partnerColors: props.initialValues?.partnerColors,
  backgroundName: props.initialValues?.backgroundName,
  backgroundImageUrl: props.initialValues?.backgroundImageUrl,
  commanderDefaultImageUrl: props.initialValues?.commanderDefaultImageUrl,
  partnerDefaultImageUrl: props.initialValues?.partnerDefaultImageUrl,
  backgroundDefaultImageUrl: props.initialValues?.backgroundDefaultImageUrl
})

const partnerMode = ref<PartnerMode>(
  props.initialValues?.partnerCommanderName
    ? PARTNER
    : props.initialValues?.backgroundName
      ? BACKGROUND
      : false
)

const { searchCommanders, searchBackgrounds } = useScryfall()

function updateCommanderColors(mainCard: ScryfallCard | null) {
  const colors = mainCard?.color_identity.filter(
    (c): c is ChromaticColor => (CHROMATIC_COLORS as readonly string[]).includes(c)
  ) ?? []
  form.colors = colors.length ? colors : ['C']
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
    updateCommanderColors(card)
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

// Initialize card searches when editing an existing deck
if (props.initialValues) {
  onMounted(async () => {
    const promises: Promise<void>[] = []
    if (props.initialValues!.commanderName) {
      promises.push(commander.initializeFromName(props.initialValues!.commanderName))
    }
    const partnerName = props.initialValues!.partnerCommanderName ?? props.initialValues!.backgroundName
    if (partnerName) {
      promises.push(partner.initializeFromName(partnerName))
    }
    await Promise.all(promises)
  })
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
  updateCommanderColors(commander.selectedCard.value)
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

const submitting = ref(false)

const emit = defineEmits<{
  submit: [data: InsertDeckWithCommander]
}>()

function onSubmit() {
  submitting.value = true
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
        :label="submitLabel"
        icon="i-lucide-image"
        size="lg"
        :disabled="submitting"
        :loading="submitting"
        data-umami-event="generate-passport-click"
      />
    </div>
  </UForm>
</template>
