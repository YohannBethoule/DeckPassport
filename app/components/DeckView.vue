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

const colorComponents: Record<string, string> = {
  W: 'IconsWhiteMana',
  U: 'IconsBlueMana',
  B: 'IconsBlackMana',
  R: 'IconsRedMana',
  G: 'IconsGreenMana'
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
      <div
        v-if="deck.imageUrl"
        class="shrink-0"
      >
        <img
          :src="deck.imageUrl"
          :alt="deck.name"
          class="w-full sm:w-48 rounded-lg object-cover"
        >
      </div>

      <div class="flex-1 space-y-4">
        <div>
          <h2 class="text-2xl font-bold">
            {{ deck.name }}
          </h2>
          <div class="flex items-center gap-1.5 mt-1">
            <component
              :is="colorComponents[color]"
              v-for="color in deck.colors"
              :key="color"
              class="size-5"
            />
          </div>
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
          <h3 class="text-sm font-semibold text-[var(--ui-text-dimmed)]">
            Description
          </h3>
          <p class="text-sm whitespace-pre-line">
            {{ deck.description }}
          </p>
        </div>

        <div class="space-y-1">
          <h3 class="text-sm font-semibold text-[var(--ui-text-dimmed)]">
            Win Condition
          </h3>
          <p class="text-sm whitespace-pre-line">
            {{ deck.winCondition }}
          </p>
        </div>

        <div
          v-if="coreCardsList.length"
          class="space-y-1"
        >
          <h3 class="text-sm font-semibold text-[var(--ui-text-dimmed)]">
            Core Cards
          </h3>
          <ul class="text-sm list-disc list-inside">
            <li
              v-for="card in coreCardsList"
              :key="card"
            >
              {{ card }}
            </li>
          </ul>
        </div>

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
