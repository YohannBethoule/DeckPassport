<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'
import type { ManaColor } from '#shared/schemas/commander'

const route = useRoute()

const { data: rawDeck } = await useFetch(`/api/deck/${route.params.id}`)

if (!rawDeck.value) {
  throw createError({ statusCode: 404, statusMessage: 'Deck not found' })
}

function getCommanderPrintUri(d: NonNullable<typeof rawDeck.value>, commanderId: number): string | undefined {
  return d.commanderPrints?.find(p => p.commanderId === commanderId)?.commanderPrintUri
}

const deck = computed<InsertDeckWithCommander | null>(() => {
  const d = rawDeck.value
  if (!d) return null

  const commanderPrintUri = getCommanderPrintUri(d, d.commander.id)
  const partnerPrintUri = d.partnerCommander ? getCommanderPrintUri(d, d.partnerCommander.id) : undefined

  return {
    commanderName: d.commander.name,
    imageUrl: commanderPrintUri ?? d.commander.imageUrl ?? '',
    colors: d.commander.colors as ManaColor[],
    title: d.title,
    bracket: d.bracket.id,
    description: d.description,
    winCondition: d.winCondition,
    coreCards: d.coreCards ?? '',
    deckListUrl: d.deckListUrl ?? '',
    partnerCommanderName: d.partnerCommander?.name,
    partnerImageUrl: partnerPrintUri ?? d.partnerCommander?.imageUrl ?? undefined,
    partnerColors: d.partnerCommander?.colors as ManaColor[] | undefined,
    backgroundName: d.background?.name,
    backgroundImageUrl: (d.background ? d.backgroundPrints?.find(p => p.backgroundId === d.background!.id)?.backgroundPrintUri : undefined) ?? d.background?.imageUrl ?? undefined,
    archetypes: d.archetypes?.map(a => a.archetypeId) ?? []
  }
})

const archetypeNames = computed(() => {
  const d = rawDeck.value
  if (!d) return []
  return (d.archetypes ?? []).map(a => a.archetype.name)
})

const exportComponent = ref<{ $el: HTMLElement } | null>(null)
const exportRef = computed(() => exportComponent.value?.$el ?? null)
const { download, loading } = useDownloadCard(exportRef)
</script>

<template>
  <UPage v-if="deck">
    <UPageBody>
      <DeckView
        :deck="deck"
        :archetype-names="archetypeNames"
      />

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
        :deck="deck"
        :archetype-names="archetypeNames"
      />
    </div>
  </UPage>
</template>
