<script setup lang="ts">
import { insertDeckWithCommanderFormSchema } from '#shared/schemas/deck'

const form = reactive({
  name: '',
  imageUrl: '',
  bracket: undefined as number | undefined,
  colors: [] as ('W' | 'U' | 'B' | 'R' | 'G')[],
  description: '',
  winCondition: '',
  coreCards: '',
  deckListUrl: ''
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
  { label: 'Green', value: 'G' }
]

function onSubmit() {
  console.log('Form submitted:', form)
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
      name="name"
      required
    >
      <UInput
        v-model="form.name"
        placeholder="e.g. Atraxa, Praetors' Voice"
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
        </template>
      </USelectMenu>
    </UFormField>

    <UFormField
      label="Description"
      name="description"
    >
      <UTextarea
        v-model="form.description"
        placeholder="Briefly describe your deck's strategy and theme..."
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="How does it win?"
      name="winCondition"
      required
    >
      <UTextarea
        v-model="form.winCondition"
        placeholder="e.g. Infinite combo with X + Y, or commander damage..."
        :rows="2"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Core Cards"
      name="coreCards"
    >
      <UTextarea
        v-model="form.coreCards"
        placeholder="List key cards, one per line..."
        :rows="4"
        class="w-full"
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
      />
    </div>
  </UForm>
</template>
