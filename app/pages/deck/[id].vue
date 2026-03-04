<script setup lang="ts">
import { testDeck } from '~/composables/useTestDeck'

const deckPassport = useDeckPassport()

if (!deckPassport.value) {
  deckPassport.value = testDeck
}

const cardRef = ref<HTMLElement | null>(null)
const { download, loading } = useDownloadCard(cardRef)
</script>

<template>
  <UPage v-if="deckPassport">
    <UPageHeader title="Deck Passport" />

    <UPageBody>
      <div ref="cardRef">
        <DeckView :deck="deckPassport" />
      </div>

      <div class="flex justify-center mt-4">
        <UButton
          label="Download as Image"
          icon="i-lucide-download"
          :loading="loading"
          @click="download()"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
