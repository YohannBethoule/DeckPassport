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
  deckListUrl: ''
})

const { searchCommanders } = useScryfall()
const commanderResults = ref<ScryfallCard[]>([])
const selectedCard = ref<ScryfallCard | null>(null)

async function onCommanderSearch(query: string) {
  commanderResults.value = await searchCommanders(query)
}

function onCommanderSelect(name: string) {
  if (!name) return
  const card = commanderResults.value.find(c => c.name === name)
  if (!card) return

  selectedCard.value = card
  if (!form.title) {
    form.title = card.name
  }
  const imageUrl = getCardImageUri(card)
  if (imageUrl) {
    form.imageUrl = imageUrl
  }
  form.colors = card.color_identity.filter(
    (c): c is 'W' | 'U' | 'B' | 'R' | 'G' => ['W', 'U', 'B', 'R', 'G'].includes(c)
  )
  if (!form.colors?.length) {
    form.colors = ['C']
  }
}

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
        :items="commanderResults.map(c => c.name)"
        placeholder="e.g. Atraxa, Praetors' Voice"
        class="w-full"
        @update:search-term="onCommanderSearch"
        @update:model-value="onCommanderSelect"
      />
    </UFormField>

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
      label="Commander Image URL"
      name="imageUrl"
    >
      <UInput
        v-model="form.imageUrl"
        placeholder="https://cards.scryfall.io/..."
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
