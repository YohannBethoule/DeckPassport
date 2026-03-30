<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'
import type { ExportOptions } from '~/utils/exportOptions'

const props = defineProps<{
  deck: InsertDeckWithCommander
  archetypeNames?: string[]
}>()

const { deck, archetypeNames } = props

const open = defineModel<boolean>('open', { default: false })

const exportOptions = ref<ExportOptions>({
  showWatermark: true,
  showDeckLink: true
})

const exportComponent = ref<{ $el: HTMLElement } | null>(null)
const exportRef = computed(() => exportComponent.value?.$el ?? null)
const { download, loading } = useDownloadCard(exportRef)
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Passport Customization
        </h3>

        <div class="flex items-center justify-between">
          <span class="text-sm">Show watermark</span>
          <USwitch v-model="exportOptions.showWatermark" />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">Show QR code to deck list</span>
          <USwitch v-model="exportOptions.showDeckLink" />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancel"
            variant="outline"
            @click="open = false"
          />
          <UButton
            label="Download"
            icon="i-lucide-download"
            :loading="loading"
            @click="download(deck.title)"
          />
        </div>
      </div>

      <div class="fixed -left-[9999px] top-0">
        <DeckViewExport
          ref="exportComponent"
          :deck="deck"
          :archetype-names="archetypeNames"
          :options="exportOptions"
        />
      </div>
    </template>
  </UModal>
</template>
