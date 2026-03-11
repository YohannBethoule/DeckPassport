<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'

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
      <DeckForm @submit="onSubmit" />
    </UPageBody>
  </UPage>
</template>
