<script setup lang="ts">
import DeckPassportLogo from '~/assets/images/mtgdeckpassport.png'

const { data: rawDecks } = await useFetch('/api/decks/search', {
  query: { sort: 'createdAt', order: 'desc', size: 3 }
})

const latestDecks = computed(() => {
  if (!rawDecks.value?.items) return []
  return rawDecks.value.items.map(d => ({
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
      <div class="flex justify-center mt-6">
        <UButton
          label="Browse all decks"
          to="/browse"
          trailing-icon="i-lucide-arrow-right"
          variant="outline"
          color="neutral"
        />
      </div>
    </UPageSection>
    <UPageSection
      title="What's next ?"
      headline="Coming soon"
    >
      <DevLogList
        :items="[
          { title: 'Core Cards', description: 'Show up to 3 significative cards in your deck', icon: 'i-lucide-drama' },
          { title: 'Deck Filters', description: 'Filter the decks in the Browse Decks page', icon: 'i-lucide-search' },
          { title: 'Customization', description: 'Customize the appearance of the generated passport', icon: 'i-lucide-settings-2' }
        ]"
      />
    </UPageSection>
  </div>
</template>
