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

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * Math.min(Math.max(t, 0), 1)
}

const titleScale = computed(() => {
  const len = totalTextLength.value
  const shortThreshold = 15
  const longThreshold = 40
  const minScale = 1.5
  const maxScale = 2.5

  if (len < shortThreshold) return maxScale
  if (len > longThreshold) return minScale
  const t = (len - shortThreshold) / (longThreshold - shortThreshold)
  return lerp(maxScale, minScale, t)
})

const totalTextLength = computed(() => {
  return (props.deck.description?.length ?? 0) + (props.deck.winCondition?.length ?? 0)
})

const fontScale = computed(() => {
  const len = totalTextLength.value
  const shortThreshold = 50
  const longThreshold = 350
  let minScale = 0.7
  let maxScale = 1.4

  if (secondaryImageUrl.value) {
    minScale += 0.2
    maxScale += 0.1
  }

  if (len < shortThreshold) return maxScale
  if (len > longThreshold) return minScale
  const t = (len - shortThreshold) / (longThreshold - shortThreshold)
  return lerp(maxScale, minScale, t)
})
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
          :style="{ fontSize: `${fontScale}rem` }"
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
            <h2
              class="font-bold leading-tight mt-1"
              :style="{ fontSize: `${titleScale * 1.5}rem` }"
            >
              {{ deck.title }}
            </h2>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-if="!!archetypeNames && archetypeNames.length > 0"
              size="lg"
              variant="outline"
              :style="{ fontSize: `${fontScale}rem` }"
            >
              <span
                v-for="name in archetypeNames"
                :key="name"
              >{{ name }}</span>
            </UBadge>
            <UBadge
              size="lg"
              variant="subtle"
              :style="{ fontSize: `${fontScale}rem` }"
            >
              <span class="whitespace-nowrap">Bracket {{ deck.bracket }} — {{ bracketLabel }}</span>
            </UBadge>
          </div>

          <div
            v-if="deck.description"
            class="space-y-1"
          >
            <p class="whitespace-pre-line">
              {{ deck.description }}
            </p>
          </div>

          <div class="space-y-1">
            <h3 class="font-semibold text-dimmed">
              How does it win ?
            </h3>
            <p class="whitespace-pre-line">
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
