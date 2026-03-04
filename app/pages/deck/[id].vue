<script setup lang="ts">
import { testDeck } from '~/composables/useTestDeck'

const deckPassport = useDeckPassport()

if (!deckPassport.value) {
  deckPassport.value = testDeck
}
</script>

<template>
  <UPage v-if="deckPassport">
    <UPageHeader title="Deck Passport" />

    <UPageBody>
      <DeckView :deck="deckPassport" />
    </UPageBody>
  </UPage>
</template>
