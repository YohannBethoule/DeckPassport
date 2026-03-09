<script setup lang="ts">
import { DESCRIPTION_MAX_LENGTH, type InsertDeckWithCommander } from '#shared/schemas/deck'
import { insertDeckWithCommanderFormSchema } from '#shared/schemas/deck'
import { type ScryfallCard, getCardImageUri } from '~/composables/useScryfall'

const form = reactive({
  commanderName: '',
  title: '',
  imageUrl: '',
  bracket: undefined as number | undefined,
  colors: [] as ('W' | 'U' | 'B' | 'R' | 'G' | 'C')[],
  description: '',
  winCondition: '',
  coreCards: '',
  deckListUrl: '',
  partnerCommanderName: undefined as string | undefined,
  partnerImageUrl: undefined as string | undefined,
  partnerColors: undefined as ('W' | 'U' | 'B' | 'R' | 'G' | 'C')[] | undefined
})

type PartnerMode = false | 'partner' | 'background'
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
  const search = partnerMode.value === 'background' ? searchBackgrounds : searchCommanders
  partnerResults.value = await search(query)
}

function mergeColors() {
  const mainColors = selectedCard.value?.color_identity.filter(
    (c): c is 'W' | 'U' | 'B' | 'R' | 'G' => ['W', 'U', 'B', 'R', 'G'].includes(c)
  ) ?? []
  const partnerColors = selectedPartnerCard.value?.color_identity.filter(
    (c): c is 'W' | 'U' | 'B' | 'R' | 'G' => ['W', 'U', 'B', 'R', 'G'].includes(c)
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
  form.partnerCommanderName = card.name
  const imageUrl = getCardImageUri(card)
  if (imageUrl) {
    form.partnerImageUrl = imageUrl
  }
  form.partnerColors = card.color_identity.filter(
    (c): c is 'W' | 'U' | 'B' | 'R' | 'G' => ['W', 'U', 'B', 'R', 'G'].includes(c)
  )
  if (!form.partnerColors.length) {
    form.partnerColors = ['C']
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
  selectedPartnerCard.value = null
  partnerResults.value = []
  mergeColors()
  updateTitleIfDefault(prevDefault)
}

function setPartnerMode(mode: 'partner' | 'background') {
  if (partnerMode.value === mode) {
    clearPartner()
  } else {
    clearPartner()
    partnerMode.value = mode
  }
}

const partnerLabel = computed(() => {
  return partnerMode.value === 'background' ? 'Background Name' : 'Partner Commander Name'
})

const partnerImageLabel = computed(() => {
  return partnerMode.value === 'background' ? 'Background Image URL' : 'Partner Image URL'
})

const partnerPlaceholder = computed(() => {
  return partnerMode.value === 'background' ? 'e.g. Far Traveler' : 'e.g. Tymna the Weaver'
})

const bracketOptions = [
  { label: 'Bracket 1 - Exhibition', value: 1 },
  { label: 'Bracket 2 - Core', value: 2 },
  { label: 'Bracket 3 - Upgraded', value: 3 },
  { label: 'Bracket 4 - Optimized', value: 4 },
  { label: 'Bracket 5 - cEDH', value: 5 }
]

const colorOptions = [
  { label: 'White', value: 'W' },
  { label: 'Blue', value: 'U' },
  { label: 'Black', value: 'B' },
  { label: 'Red', value: 'R' },
  { label: 'Green', value: 'G' },
  { label: 'Colorless', value: 'C' }
]

const deckPassport = useDeckPassport()

function onSubmit() {
  deckPassport.value = { ...form } as InsertDeckWithCommander
  navigateTo('/deck/1')
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
        :label="partnerMode === 'partner' ? 'Remove Partner' : 'Add Partner'"
        :icon="partnerMode === 'partner' ? 'i-lucide-user-minus' : 'i-lucide-user-plus'"
        :variant="partnerMode === 'partner' ? 'soft' : 'outline'"
        size="sm"
        :disabled="partnerMode === 'background'"
        @click="setPartnerMode('partner')"
      />
      <UButton
        :label="partnerMode === 'background' ? 'Remove Background' : 'Add Background'"
        :icon="partnerMode === 'background' ? 'i-lucide-image-minus' : 'i-lucide-image-plus'"
        :variant="partnerMode === 'background' ? 'soft' : 'outline'"
        size="sm"
        :disabled="partnerMode === 'partner'"
        @click="setPartnerMode('background')"
      />
    </div>

    <template v-if="partnerMode">
      <UFormField
        :label="partnerLabel"
        name="partnerCommanderName"
      >
        <UInputMenu
          v-model="form.partnerCommanderName"
          :items="partnerResults.map((c: ScryfallCard) => c.name)"
          :placeholder="partnerPlaceholder"
          class="w-full"
          @update:search-term="onPartnerSearch"
          @update:model-value="onPartnerSelect"
        />
      </UFormField>

      <UFormField
        :label="partnerImageLabel"
        name="partnerImageUrl"
      >
        <UInput
          v-model="form.partnerImageUrl"
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
        :items="bracketOptions"
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
