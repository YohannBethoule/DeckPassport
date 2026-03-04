<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'

const props = defineProps<{
  deck: InsertDeckWithCommander
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

const bracketLabel = computed(() => bracketLabels[props.deck.bracket] ?? `Bracket ${props.deck.bracket}`)

const coreCardsList = computed(() => {
  if (!props.deck.coreCards) return []
  return props.deck.coreCards.split('\n').map(c => c.trim()).filter(Boolean)
})
</script>

<template>
  <UCard class="max-w-2xl mx-auto">
    <div class="flex flex-col sm:flex-row gap-6">
      <div class="flex flex-col">
        <div
          v-if="deck.imageUrl"
          class="shrink-0"
          :style="{ width: imageWidth, maxWidth: '16rem' }"
        >
          <img
            :src="deck.imageUrl"
            :alt="deck.commanderName"
            class="w-full rounded-xl object-cover"
          >
        </div>
      </div>

      <div class="flex-1 space-y-4">
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

        <UBadge
          :label="`Bracket ${deck.bracket} — ${bracketLabel}`"
          size="lg"
          variant="subtle"
        />

        <div
          v-if="deck.description"
          class="space-y-1"
        >
          <p class="text-sm whitespace-pre-line">
            {{ deck.description }}
          </p>
        </div>

        <div class="space-y-1">
          <h3 class="text-sm font-semibold text-[var(--ui-text-dimmed)]">
            How does it win ?
          </h3>
          <p class="text-sm whitespace-pre-line">
            {{ deck.winCondition }}
          </p>
        </div>

        <!--        <div -->
        <!--          v-if="coreCardsList.length" -->
        <!--          class="space-y-1" -->
        <!--        > -->
        <!--          <h3 class="text-sm font-semibold text-[var(&#45;&#45;ui-text-dimmed)]"> -->
        <!--            Core Cards -->
        <!--          </h3> -->
        <!--          <ul class="text-sm list-disc list-inside"> -->
        <!--            <li -->
        <!--              v-for="card in coreCardsList" -->
        <!--              :key="card" -->
        <!--            > -->
        <!--              {{ card }} -->
        <!--            </li> -->
        <!--          </ul> -->
        <!--        </div> -->

        <div v-if="deck.deckListUrl">
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
    </div>
  </UCard>
</template>
