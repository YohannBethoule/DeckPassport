<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'

const props = withDefaults(defineProps<{
  deck: InsertDeckWithCommander
  archetypeNames?: string[]
  compact?: boolean
}>(), {
  compact: false
})

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

const hasCoreCards = computed(() => !!(props.deck.coreCards?.length))
const sizeMultiplier = computed(() => props.compact ? 0.45 : 1)

const titleScale = computed(() => {
  const len = totalTextLength.value
  const shortThreshold = 15
  const longThreshold = 40
  let minScale = 1.5
  let maxScale = 2

  if (hasCoreCards.value && !props.compact) {
    minScale -= 0.4
    maxScale -= 0.5
  }

  let scale: number
  if (len < shortThreshold) scale = maxScale
  else if (len > longThreshold) scale = minScale
  else {
    const t = (len - shortThreshold) / (longThreshold - shortThreshold)
    scale = lerp(maxScale, minScale, t)
  }
  return scale * sizeMultiplier.value
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

  if (props.compact) {
    minScale = 1
  } else {
    if (secondaryImageUrl.value) {
      minScale += 0.2
      maxScale += 0.1
    }

    if (hasCoreCards.value) {
      minScale -= 0.1
      maxScale -= 0.2
    }
  }

  let scale: number
  if (len < shortThreshold) scale = maxScale
  else if (len > longThreshold) scale = minScale
  else {
    const t = (len - shortThreshold) / (longThreshold - shortThreshold)
    scale = lerp(maxScale, minScale, t)
  }
  return scale * sizeMultiplier.value
})
</script>

<template>
  <UCard
    class="mx-auto"
    :class="compact ? 'max-w-sm py-1 h-full' : 'max-w-2xl py-2'"
  >
    <div
      class="flex flex-col my-auto"
      :class="compact ? 'gap-2' : 'gap-4'"
    >
      <div
        class="flex gap-6"
        :class="compact ? 'flex-row' : 'flex-col sm:flex-row'"
      >
        <div
          v-if="deck.imageUrl"
          class="relative min-w-0"
          :class="[
            compact ? 'w-32 shrink-0' : 'flex-1',
            secondaryImageUrl ? (compact ? 'mt-4 ml-3' : 'mt-10 ml-8') : ''
          ]"
        >
          <img
            v-if="secondaryImageUrl"
            :src="secondaryImageUrl"
            :alt="secondaryName"
            class="absolute rounded-xl w-full"
            :class="compact ? '-top-5' : '-top-12'"
          >
          <img
            :src="deck.imageUrl"
            :alt="deck.commanderName"
            class="rounded-xl w-full"
            :class="secondaryImageUrl ? (compact ? 'relative -left-4' : 'relative -left-10') : ''"
          >
        </div>

        <div
          class="flex-1 min-w-0"
          :class="compact ? 'space-y-1' : 'space-y-4'"
          :style="{ fontSize: `${fontScale}rem` }"
        >
          <div>
            <div
              class="flex items-center mt-1"
              :class="compact ? 'gap-0.5' : 'gap-1.5'"
            >
              <component
                :is="colorComponents[color]"
                v-for="color in deck.colors"
                :key="color"
                :class="compact ? 'size-3' : 'size-5'"
              />
            </div>
            <h2
              class="font-bold leading-tight mt-1"
              :style="{ fontSize: `${titleScale * 1.5}rem` }"
            >
              {{ deck.title }}
            </h2>
          </div>

          <div
            class="flex flex-wrap"
            :class="compact ? 'gap-1' : 'gap-2'"
          >
            <UBadge
              v-if="!!archetypeNames && archetypeNames.length > 0"
              :size="compact ? 'sm' : 'lg'"
              variant="outline"
              :style="{ fontSize: `${fontScale}rem` }"
            >
              <span
                v-for="name in archetypeNames"
                :key="name"
              >{{ name }}</span>
            </UBadge>
            <UBadge
              :size="compact ? 'sm' : 'lg'"
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

          <div
            v-if="!compact && deck.coreCards?.length"
            class="space-y-1"
          >
            <h3 class="font-semibold text-dimmed">
              Core Cards
            </h3>
            <div class="flex gap-1">
              <img
                v-for="card in deck.coreCards"
                :key="card.name"
                :src="card.imageUrl"
                :alt="card.name"
                class="rounded-lg w-24"
              >
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="deck.deckListUrl && !compact"
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
