<script setup lang="ts">
const deckPassport = useDeckPassport()

if (import.meta.dev && !deckPassport.value) {
  const { testDeck } = await import('~/composables/useTestDeck')
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
    <div class="fixed -left-2499.75 top-0">
      <DeckViewExport
        ref="exportComponent"
        :deck="deckPassport"
      />
    </div>
  </UPage>
</template>
