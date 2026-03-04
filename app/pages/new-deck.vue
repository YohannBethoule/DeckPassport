<script setup lang="ts">
const form = reactive({
  commanderName: '',
  commanderImageUrl: '',
  bracket: undefined as number | undefined,
  colors: [] as string[],
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
  { label: 'White', value: 'W', chip: { color: 'neutral' as const } },
  { label: 'Blue', value: 'U', chip: { color: 'info' as const } },
  { label: 'Black', value: 'B', chip: { color: 'neutral' as const } },
  { label: 'Red', value: 'R', chip: { color: 'error' as const } },
  { label: 'Green', value: 'G', chip: { color: 'success' as const } }
]

function onSubmit() {
  console.log('Form submitted:', form)
}
</script>

<template>
  <UPage>
    <UPageHeader
      title="Create a Deck Passport"
      description="Fill in the details about your commander deck to generate a business card."
    />

    <UPageBody>
      <UForm :state="form" class="max-w-2xl mx-auto space-y-6" @submit="onSubmit">
        <UFormField label="Commander Name" name="commanderName" required>
          <UInput v-model="form.commanderName" placeholder="e.g. Atraxa, Praetors' Voice" class="w-full" />
        </UFormField>

        <UFormField label="Commander Image URL" name="commanderImageUrl">
          <UInput v-model="form.commanderImageUrl" placeholder="https://cards.scryfall.io/..." class="w-full" />
        </UFormField>

        <UFormField label="Bracket" name="bracket" required>
          <USelect v-model="form.bracket" :items="bracketOptions" placeholder="Select a bracket" class="w-full" />
        </UFormField>

        <UFormField label="Colors" name="colors" required>
          <USelectMenu
            v-model="form.colors"
            :items="colorOptions"
            multiple
            placeholder="Select color identity"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="form.description"
            placeholder="Briefly describe your deck's strategy and theme..."
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UFormField label="How does it win?" name="winCondition" required>
          <UTextarea
            v-model="form.winCondition"
            placeholder="e.g. Infinite combo with X + Y, or commander damage..."
            :rows="2"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Core Cards" name="coreCards">
          <UTextarea
            v-model="form.coreCards"
            placeholder="List key cards, one per line..."
            :rows="4"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Deck List URL" name="deckListUrl">
          <UInput v-model="form.deckListUrl" placeholder="https://www.moxfield.com/decks/..." class="w-full" />
        </UFormField>

        <div class="flex justify-end pt-4">
          <UButton type="submit" label="Generate Passport" icon="i-lucide-image" size="lg" />
        </div>
      </UForm>
    </UPageBody>
  </UPage>
</template>
