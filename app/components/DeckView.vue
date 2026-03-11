<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'

const props = defineProps<{
  deck: InsertDeckWithCommander
  archetypeNames?: string[]
}>()

const bracketLabels: Record<number, string> = {
  1: 'Exhibition',
  2: 'Core',
  3: 'Upgraded',
  4: 'Optimized',
  5: 'cEDH'
}

const colorComponents: Record<string, ReturnType<typeof resolveComponent>> = {
  W: resolveComponent('IconsWhiteMana'),
  U: resolveComponent('IconsBlueMana'),
  B: resolveComponent('IconsBlackMana'),
  R: resolveComponent('IconsRedMana'),
  G: resolveComponent('IconsGreenMana'),
  C: resolveComponent('IconsColorlessMana')
}

const secondaryImageUrl = computed(() => props.deck.partnerImageUrl ?? props.deck.backgroundImageUrl)
const secondaryName = computed(() => props.deck.partnerCommanderName ?? props.deck.backgroundName)

const bracketLabel = computed(() => bracketLabels[props.deck.bracket] ?? `Bracket ${props.deck.bracket}`)
</script>

<template>
  <UCard class="max-w-2xl mx-auto py-2">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row gap-6">
        <div
          v-if="deck.imageUrl"
          class="relative flex-1 min-w-0"
          :class="secondaryImageUrl ? 'mt-10 ml-8' : ''"
        >
          <img
            v-if="secondaryImageUrl"
            :src="secondaryImageUrl"
            :alt="secondaryName"
            class="absolute -top-12 rounded-xl w-full"
          >
          <img
            :src="deck.imageUrl"
            :alt="deck.commanderName"
            class="rounded-xl w-full"
            :class="secondaryImageUrl ? 'relative -left-10' : ''"
          >
        </div>

        <div
          class="flex-1 min-w-0 space-y-4"
        >
          <div>
            <div class="flex items-center gap-1.5 mt-1">
              <component
                :is="colorComponents[color]"
                v-for="color in deck.colors"
                :key="color"
                class="size-5"
              />
            </div>
            <h2 class="text-2xl font-bold">
              {{ deck.title }}
            </h2>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-if="archetypeNames.length > 0"
              size="lg"
              variant="outline"
            >
              <span
                v-for="name in archetypeNames"
                :key="name"
              >{{ name }}</span>
            </UBadge>
            <UBadge
              size="lg"
              variant="subtle"
            >
              <span class="whitespace-nowrap">Bracket {{ deck.bracket }} — {{ bracketLabel }}</span>
            </UBadge>
          </div>

          <div
            v-if="deck.description"
            class="space-y-1"
          >
            <p class="text-sm whitespace-pre-line">
              {{ deck.description }}
            </p>
          </div>

          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-dimmed">
              How does it win ?
            </h3>
            <p class="text-sm whitespace-pre-line">
              {{ deck.winCondition }}
            </p>
          </div>
        </div>
      </div>
      <div
        v-if="deck.deckListUrl"
        class="no-export ml-auto"
      >
        <UButton
          :to="deck.deckListUrl"
          target="_blank"
          label="View Deck List"
          icon="i-lucide-external-link"
          variant="outline"
          size="sm"
        />
      </div>
    </div>
  </UCard>
</template>
