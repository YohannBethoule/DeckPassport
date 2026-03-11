<script setup lang="ts">
import { DESCRIPTION_MAX_LENGTH, type InsertDeckWithCommander } from '#shared/schemas/deck'
import { insertDeckWithCommanderFormSchema } from '#shared/schemas/deck'
import { type ManaColor, type ChromaticColor, CHROMATIC_COLORS } from '#shared/schemas/commander'
import { type ScryfallCard, getCardImageUri } from '~/composables/useScryfall'

const form = reactive({
  commanderName: '',
  title: '',
  imageUrl: '',
  bracket: undefined as number | undefined,
  colors: [] as ManaColor[],
  description: '',
  winCondition: '',
  coreCards: '',
  deckListUrl: '',
  partnerCommanderName: undefined as string | undefined,
  partnerImageUrl: undefined as string | undefined,
  partnerColors: undefined as ManaColor[] | undefined,
  backgroundName: undefined as string | undefined,
  backgroundImageUrl: undefined as string | undefined
})

const PARTNER = 'partner' as const
const BACKGROUND = 'background' as const
type PartnerMode = false | typeof PARTNER | typeof BACKGROUND
const partnerMode = ref<PartnerMode>(false)

const { searchCommanders, searchBackgrounds } = useScryfall()
const commanderResults = ref<ScryfallCard[]>([])
const partnerResults = ref<ScryfallCard[]>([])
const selectedCard = ref<ScryfallCard | null>(null)
const selectedPartnerCard = ref<ScryfallCard | null>(null)

async function onCommanderSearch(query: string) {
  commanderResults.value = await searchCommanders(query)
}

async function onPartnerSearch(query: string) {
  const search = partnerMode.value === BACKGROUND ? searchBackgrounds : searchCommanders
  partnerResults.value = await search(query)
}

function mergeColors() {
  const mainColors = selectedCard.value?.color_identity.filter(
    (c): c is ChromaticColor => (CHROMATIC_COLORS as readonly string[]).includes(c)
  ) ?? []
  const partnerColors = selectedPartnerCard.value?.color_identity.filter(
    (c): c is ChromaticColor => (CHROMATIC_COLORS as readonly string[]).includes(c)
  ) ?? []
  const merged = [...new Set([...mainColors, ...partnerColors])]
  form.colors = merged.length ? merged : ['C']
}

function getDefaultTitle() {
  const mainName = selectedCard.value?.name
  const partnerName = selectedPartnerCard.value?.name
  if (mainName && partnerName) return `${mainName} & ${partnerName}`
  if (mainName) return mainName
  return ''
}

function updateTitleIfDefault(previousDefault: string) {
  if (!form.title || form.title === previousDefault) {
    form.title = getDefaultTitle()
  }
}

function onCommanderSelect(name: string) {
  if (!name) return
  const card = commanderResults.value.find(c => c.name === name)
  if (!card) return

  const prevDefault = getDefaultTitle()
  selectedCard.value = card
  const imageUrl = getCardImageUri(card)
  if (imageUrl) {
    form.imageUrl = imageUrl
  }
  mergeColors()
  updateTitleIfDefault(prevDefault)
}

function onPartnerSelect(name: string) {
  if (!name) return
  const card = partnerResults.value.find(c => c.name === name)
  if (!card) return

  const prevDefault = getDefaultTitle()
  selectedPartnerCard.value = card
  const imageUrl = getCardImageUri(card)

  if (partnerMode.value === BACKGROUND) {
    form.backgroundName = card.name
    if (imageUrl) {
      form.backgroundImageUrl = imageUrl
    }
  } else {
    form.partnerCommanderName = card.name
    if (imageUrl) {
      form.partnerImageUrl = imageUrl
    }
    form.partnerColors = card.color_identity.filter(
      (c): c is ChromaticColor => (CHROMATIC_COLORS as readonly string[]).includes(c)
    )
    if (!form.partnerColors.length) {
      form.partnerColors = ['C']
    }
  }
  mergeColors()
  updateTitleIfDefault(prevDefault)
}

function clearPartner() {
  const prevDefault = getDefaultTitle()
  partnerMode.value = false
  form.partnerCommanderName = undefined
  form.partnerImageUrl = undefined
  form.partnerColors = undefined
  form.backgroundName = undefined
  form.backgroundImageUrl = undefined
  selectedPartnerCard.value = null
  partnerResults.value = []
  mergeColors()
  updateTitleIfDefault(prevDefault)
}

function setPartnerMode(mode: typeof PARTNER | typeof BACKGROUND) {
  if (partnerMode.value === mode) {
    clearPartner()
  } else {
    clearPartner()
    partnerMode.value = mode
  }
}

const { data: bracketOptions } = await useFetch('/api/brackets', {
  transform: (brackets: { id: number, name: string, description: string | null }[]) =>
    brackets.map(b => ({ label: `Bracket ${b.id} - ${b.name}`, value: b.id }))
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
    <UFormField
      label="Commander Name"
      name="commanderName"
      required
    >
      <UInputMenu
        v-model="form.commanderName"
        :items="commanderResults.map((c: ScryfallCard) => c.name)"
        placeholder="e.g. Atraxa, Praetors' Voice"
        class="w-full"
        @update:search-term="onCommanderSearch"
        @update:model-value="onCommanderSelect"
      />
    </UFormField>

    <UFormField
      label="Commander Image URL"
      name="imageUrl"
    >
      <UInput
        v-model="form.imageUrl"
        placeholder="https://cards.scryfall.io/..."
        class="w-full"
      />
    </UFormField>

    <div class="flex gap-2">
      <UButton
        :label="partnerMode === PARTNER ? 'Remove Partner' : 'Add Partner'"
        :icon="partnerMode === PARTNER ? 'i-lucide-user-minus' : 'i-lucide-user-plus'"
        :variant="partnerMode === PARTNER ? 'soft' : 'outline'"
        size="sm"
        :disabled="partnerMode === BACKGROUND"
        @click="setPartnerMode(PARTNER)"
      />
      <UButton
        :label="partnerMode === BACKGROUND ? 'Remove Background' : 'Add Background'"
        :icon="partnerMode === BACKGROUND ? 'i-lucide-image-minus' : 'i-lucide-image-plus'"
        :variant="partnerMode === BACKGROUND ? 'soft' : 'outline'"
        size="sm"
        :disabled="partnerMode === PARTNER"
        @click="setPartnerMode(BACKGROUND)"
      />
    </div>

    <template v-if="partnerMode === PARTNER">
      <UFormField
        label="Partner Commander Name"
        name="partnerCommanderName"
      >
        <UInputMenu
          v-model="form.partnerCommanderName"
          :items="partnerResults.map((c: ScryfallCard) => c.name)"
          placeholder="e.g. Tymna the Weaver"
          class="w-full"
          @update:search-term="onPartnerSearch"
          @update:model-value="onPartnerSelect"
        />
      </UFormField>

      <UFormField
        label="Partner Image URL"
        name="partnerImageUrl"
      >
        <UInput
          v-model="form.partnerImageUrl"
          placeholder="https://cards.scryfall.io/..."
          class="w-full"
        />
      </UFormField>
    </template>

    <template v-if="partnerMode === BACKGROUND">
      <UFormField
        label="Background Name"
        name="backgroundName"
      >
        <UInputMenu
          v-model="form.backgroundName"
          :items="partnerResults.map((c: ScryfallCard) => c.name)"
          placeholder="e.g. Far Traveler"
          class="w-full"
          @update:search-term="onPartnerSearch"
          @update:model-value="onPartnerSelect"
        />
      </UFormField>

      <UFormField
        label="Background Image URL"
        name="backgroundImageUrl"
      >
        <UInput
          v-model="form.backgroundImageUrl"
          placeholder="https://cards.scryfall.io/..."
          class="w-full"
        />
      </UFormField>
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

    <UFormField
      label="Colors"
      name="colors"
      required
    >
      <USelectMenu
        v-model="form.colors"
        :items="colorOptions"
        value-key="value"
        multiple
        placeholder="Select color identity"
        class="w-full"
      >
        <template #item-leading="{ item }">
          <IconsWhiteMana
            v-if="item.value === 'W'"
            class="size-5"
          />
          <IconsBlueMana
            v-else-if="item.value === 'U'"
            class="size-5"
          />
          <IconsBlackMana
            v-else-if="item.value === 'B'"
            class="size-5"
          />
          <IconsRedMana
            v-else-if="item.value === 'R'"
            class="size-5"
          />
          <IconsGreenMana
            v-else-if="item.value === 'G'"
            class="size-5"
          />
          <IconsColorlessMana
            v-else-if="item.value === 'C'"
            class="size-5"
          />
        </template>
      </USelectMenu>
    </UFormField>

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
