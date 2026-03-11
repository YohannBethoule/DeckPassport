<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'
import type { ManaColor } from '#shared/schemas/commander'
import DeckPassportLogo from '~/assets/images/mtgdeckpassport.png'

const { data: rawDecks } = await useFetch('/api/deck/search', {
  query: { sort: 'createdAt', order: 'desc', size: 3 }
})

function getCommanderPrintUri(d: NonNullable<typeof rawDecks.value>[number], commanderId: number): string | undefined {
  return d.commanderPrints?.find(p => p.commanderId === commanderId)?.commanderPrintUri
}

function toDeckView(d: NonNullable<typeof rawDecks.value>[number]): { deck: InsertDeckWithCommander, archetypeNames: string[] } {
  const commanderPrintUri = getCommanderPrintUri(d, d.commander.id)
  const partnerPrintUri = d.partnerCommander ? getCommanderPrintUri(d, d.partnerCommander.id) : undefined

  return {
    deck: {
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
    },
    archetypeNames: (d.archetypes ?? []).map(a => a.archetype.name)
  }
}

const latestDecks = computed(() => {
  if (!rawDecks.value) return []
  return rawDecks.value.map(d => ({
    id: d.id,
    ...toDeckView(d)
  }))
})
</script>

<template>
  <div>
    <UPageHero
      title="Create your EDH deck passport"
      description="Give your favorite commander decks a nice business card to introduce them."
      :ui="{
        container: 'gap-2 sm:gap-3 py-12 sm:py-12 lg:py-12'
      }"
      reverse
    >
      <img
        :src="DeckPassportLogo"
        alt="logo"
        class="h-72 aspect-square mx-auto"
      >
      <template #links>
        <UButton
          label="Create New Deck"
          to="/deck/new"
          trailing-icon="i-lucide-arrow-right"
          size="xl"
          data-umami-event="create-deck-click"
        />
      </template>
    </UPageHero>

    <UPageSection
      title="Share it with others"
      icon="i-lucide-share-2"
      orientation="horizontal"
    >
      <img
        src="~/assets/images/voltronexample.png"
        alt="example card"
      >
    </UPageSection>
    <UPageSection
      v-if="latestDecks.length > 0"
      title="Last Decks"
      icon="i-lucide-clock"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
        <NuxtLink
          v-for="item in latestDecks"
          :key="item.id"
          :to="`/deck/${item.id}`"
          class="hover:opacity-80 transition-opacity h-full"
        >
          <DeckView
            :deck="item.deck"
            :archetype-names="item.archetypeNames"
            compact
          />
        </NuxtLink>
      </div>
    </UPageSection>
    <UPageSection
      title="What's next ?"
      headline="Coming soon"
    >
      <DevLogList
        :items="[
          { title: 'User Account', description: 'Create your account and save your decks', icon: 'i-lucide-shield-user' },
          { title: 'Core cards', description: 'Show up to 3 significative cards in your deck', icon: 'i-lucide-drama' },
          { title: 'Customization', description: 'Customize the appearance of the generated passport', icon: 'i-lucide-settings-2' }
        ]"
      />
    </UPageSection>
  </div>
</template>
