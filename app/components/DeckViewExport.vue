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

const totalTextLength = computed(() => {
  return (props.deck.description?.length ?? 0) + (props.deck.winCondition?.length ?? 0)
})

const fontScale = computed(() => {
  const len = totalTextLength.value
  if (len < 100) return 1
  if (len > 500) return 0.6
  // Linear interpolation between 1 and 0.6 for 100-500 chars
  return 1 - (len - 100) * 0.4 / 2000
})
</script>

<template>
  <div
    class="card"
    :style="{ fontSize: `calc(${fontScale} * (var(--card-size) + (var(--gap) + var(--card-size))) / 45)` }"
  >
    <div class="row">
      <div
        v-if="deck.imageUrl"
        class="image-wrapper"
      >
        <img
          :src="deck.imageUrl"
          :alt="deck.commanderName"
          class="image"
        >
      </div>

      <div class="content">
        <div>
          <div class="colors">
            <component
              :is="colorComponents[color]"
              v-for="color in deck.colors"
              :key="color"
              class="color-icon"
            />
          </div>
          <h2 class="title">
            {{ deck.title }}
          </h2>
        </div>

        <span class="bracket">
          Bracket {{ deck.bracket }} — {{ bracketLabels[deck.bracket] ?? `Bracket ${deck.bracket}` }}
        </span>

        <div v-if="deck.description">
          <p class="text">
            {{ deck.description }}
          </p>
        </div>

        <div>
          <h3 class="label">
            How does it win ?
          </h3>
          <p class="text">
            {{ deck.winCondition }}
          </p>
        </div>
      </div>
    </div>
    <div class="spacer" />
  </div>
</template>

<style scoped>
.card {
  --card-width:672px;
  --card-height:936px;
  --padding: 24px;
  --gap: 24px;
  /* Scryfall card aspect ratio: 672/936 (w/h)
     Solving: s = 2p + (s - 2p) * 672/936 + gap + content_width
     => s = 2p + (gap + content_width) * 936 / 264 */
  --card-size: calc(2 * var(--padding) + (var(--gap) + var(--card-width)) * 2);
  /* font-size is set dynamically via :style binding */

  width: var(--card-size);
  height: auto;
  padding: var(--padding) var(--padding) 0 var(--padding);
  background: var(--ui-bg);
  border-radius: 12px;
  border: 1px solid var(--ui-border);
  font-family: inherit;
}

.row {
  display: flex;
  flex-direction: row;
  gap: var(--gap);
}

.spacer {
  height: var(--padding);
}

.image-wrapper {
  width: var(--card-width);
  height: var(--card-height);
  border-radius: calc(var(--card-size) / 25);
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-size: inherit;
}

.colors {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.color-icon {
  width: calc(var(--card-width)/10);
  height: calc(var(--card-width)/10);
}

.title {
  font-weight: 700;
  font-size: 1.5em;
  line-height: 1em;
  margin-top: .5em;
}

.bracket {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 6px;
  background: forestgreen;
  width: fit-content;
  font-size: .5em;
  white-space: nowrap;
}

.text {
  white-space: pre-line;
  margin: 0;
  font-size: .5em;
}

.label {
  font-weight: 600;
  color: var(--ui-text-dimmed);
  margin: 0 0 4px 0;
}
</style>
