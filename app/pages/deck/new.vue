<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'

const prefill = useState<InsertDeckWithCommander | null>('deckPrefill', () => null)
const initialValues = prefill.value ?? undefined
// Clear after reading so it doesn't persist across navigations
prefill.value = null

async function onSubmit(data: InsertDeckWithCommander) {
  const id = await $fetch('/api/deck', {
    method: 'POST',
    body: data
  })
  navigateTo(`/deck/${id}`)
}
</script>

<template>
  <UPage>
    <UPageHeader
      headline="New Deck"
      title="Create your Deck Passport"
      description="Fill in the details about your commander deck to generate your deck passport."
      :ui="{ root: 'px-6 sm:px-12' }"
    />

    <UPageBody class="p-4">
      <DeckForm
        :initial-values="initialValues"
        @submit="onSubmit"
      />
    </UPageBody>
  </UPage>
</template>
