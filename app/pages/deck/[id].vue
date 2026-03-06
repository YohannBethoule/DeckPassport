<script setup lang="ts">
import { testDeck } from '~/composables/useTestDeck'

const deckPassport = useDeckPassport()

if (!deckPassport.value) {
  deckPassport.value = testDeck
}

const exportComponent = ref<{ $el: HTMLElement } | null>(null)
const exportRef = computed(() => exportComponent.value?.$el ?? null)
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

    <div class="fixed -left-[9999px] top-0">
      <DeckViewExport
        ref="exportComponent"
        :deck="deckPassport"
      />
    </div>
  </UPage>
</template>
