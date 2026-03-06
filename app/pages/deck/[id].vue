<script setup lang="ts">
import { testDeck } from '~/composables/useTestDeck'

const deckPassport = useDeckPassport()

if (!deckPassport.value) {
  deckPassport.value = testDeck
}

const exportRef = ref<HTMLElement | null>(null)
const { download, loading } = useDownloadCard(exportRef)
</script>

<template>
  <UPage v-if="deckPassport">
    <UPageBody>
      <DeckView :deck="deckPassport" />

      <div class="flex justify-center mt-4">
        <UButton
          label="Download as Image"
          icon="i-lucide-download"
          :loading="loading"
          @click="download()"
        />
      </div>
    </UPageBody>

    <!-- TODO: move offscreen after debugging -->
    <div
      ref="exportRef"
      class="mt-8"
    >
      <DeckViewExport :deck="deckPassport" />
    </div>
  </UPage>
</template>
