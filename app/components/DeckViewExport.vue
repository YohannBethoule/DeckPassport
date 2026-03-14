<script setup lang="ts">
import type { InsertDeckWithCommander } from '#shared/schemas/deck'
import QRCode from 'qrcode'

const props = defineProps<{
  deck: InsertDeckWithCommander
  archetypeNames?: string[]
}>()

const proxiedImageUrl = computed(() => {
  if (!props.deck.imageUrl) return undefined
  return `/api/image-proxy?url=${encodeURIComponent(props.deck.imageUrl)}`
})

const secondaryImageUrl = computed(() => props.deck.partnerImageUrl ?? props.deck.backgroundImageUrl)
const secondaryName = computed(() => props.deck.partnerCommanderName ?? props.deck.backgroundName)

const proxiedSecondaryImageUrl = computed(() => {
  if (!secondaryImageUrl.value) return undefined
  return `/api/image-proxy?url=${encodeURIComponent(secondaryImageUrl.value)}`
})

const hasSecondary = computed(() => !!secondaryName.value)
const hasCoreCards = computed(() => !!(props.deck.coreCards?.length))

const proxiedCoreCards = computed(() => {
  if (!props.deck.coreCards?.length) return []
  return props.deck.coreCards.map(card => ({
    name: card.name,
    imageUrl: `/api/image-proxy?url=${encodeURIComponent(card.imageUrl)}`
  }))
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

const totalTextLength = computed(() => {
  return (props.deck.description?.length ?? 0) + (props.deck.winCondition?.length ?? 0)
})

const qrDataUrl = ref<string>()

watchEffect(async () => {
  if (props.deck.deckListUrl) {
    qrDataUrl.value = await QRCode.toDataURL(props.deck.deckListUrl, { width: 150, margin: 1 })
  }
})

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * Math.min(Math.max(t, 0), 1)
}

const titleScale = computed(() => {
  const len = props.deck.title?.length ?? 0
  const shortThreshold = 15
  const longThreshold = 40
  let minScale = 0.7
  let maxScale = 1

  if (hasCoreCards.value) {
    minScale -= 0.2
    maxScale -= 0.25
  }

  if (len < shortThreshold) return maxScale
  if (len > longThreshold) return minScale
  const t = (len - shortThreshold) / (longThreshold - shortThreshold)
  return lerp(maxScale, minScale, t)
})

const fontScale = computed(() => {
  const len = totalTextLength.value
  const hasQr = !!props.deck.deckListUrl
  const shortThreshold = 100
  const longThreshold = 500
  let minScale = 0.6
  let maxScale = 1.1
  if (hasQr) {
    minScale += 0.2
    maxScale += 0.1
  }
  if (hasSecondary.value) {
    minScale += 0.2
    maxScale += 0.1
  }
  if (hasCoreCards.value) {
    minScale -= 0.1
    maxScale -= 0.2
  }

  if (len < shortThreshold) return maxScale
  if (len > longThreshold) return minScale
  const t = (len - shortThreshold) / (longThreshold - shortThreshold)
  return lerp(maxScale, minScale, t)
})
</script>

<template>
  <div
    class="card"
    :style="{ fontSize: `calc(${fontScale} * (var(--card-size) + (var(--gap) + var(--card-size))) / 45)` }"
  >
    <div class="row">
      <div class="content">
        <div
          v-if="deck.imageUrl"
          class="image-stack"
          :class="{ 'image-stack--duo': hasSecondary }"
        >
          <img
            v-if="proxiedSecondaryImageUrl"
            :src="proxiedSecondaryImageUrl"
            :alt="secondaryName"
            class="image image--partner"
          >
          <img
            :src="proxiedImageUrl"
            :alt="deck.commanderName"
            class="image"
            :class="{ 'image--main': hasSecondary }"
          >
        </div>
        <div
          v-if="qrDataUrl"
          class="qr-section"
        >
          <h3 class="label">
            Deck List
          </h3>
          <img
            :src="qrDataUrl"
            alt="Deck list QR code"
            class="qr-code"
          >
        </div>
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
        </div>

        <h2
          class="title"
          :style="{ fontSize: `${titleScale * 1.5}em` }"
        >
          {{ deck.title }}
        </h2>

        <div class="badges">
          <span
            v-if="!!archetypeNames && archetypeNames.length > 0"
            class="archetypes badge badge--outline"
          >
            <span
              v-for="name in archetypeNames"
              :key="name"
            >{{ name }}</span>
          </span>
          <span class="badge">
            Bracket {{ deck.bracket }} — {{ bracketLabels[deck.bracket] ?? `Bracket ${deck.bracket}` }}
          </span>
        </div>

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

        <div
          v-if="proxiedCoreCards.length"
          class="core-cards"
        >
          <h3 class="label">
            Core Cards
          </h3>
          <div class="core-cards-images">
            <img
              v-for="card in proxiedCoreCards"
              :key="card.name"
              :src="card.imageUrl"
              :alt="card.name"
              class="core-card-image"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  --card-width:250px;
  --card-height:calc(var(--card-width)*1.40);
  --padding: calc(var(--card-width)*0.10);
  --gap: calc(var(--card-width)*0.05);
  /* Scryfall card aspect ratio: 672/936 (w/h)
     Solving: s = 2p + (s - 2p) * 672/936 + gap + content_width
     => s = 2p + (gap + content_width) * 936 / 264 */
  --card-size: calc(2 * var(--padding) + (var(--gap) + var(--card-width)) * 2);
  /* font-size is set dynamically via :style binding */

  width: var(--card-size);
  height: auto;
  padding: var(--padding);
  background: var(--ui-bg);
  border-radius: 12px;
  border: 1px solid var(--ui-border);
  box-sizing: border-box;
  font-family: inherit;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--gap);
}

.image-stack {
  position: relative;
  width: var(--card-width);
  height: var(--card-height);
}

.image-stack--duo {
  margin-top: calc(var(--card-width) * 0.18);
  margin-left: calc(var(--card-width) * 0.05);
}

.image {
  width: var(--card-width);
  height: var(--card-height);
  object-fit: contain;
  border-radius: calc(var(--card-size) / 25);
}

.image--main {
  position: relative;
  left: calc(-1 * var(--card-width) * 0.10);
}

.image--partner {
  position: absolute;
  top: calc(-1 * var(--card-width) * 0.18);
  left: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
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
}

.badges {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badge {
  padding: 6px 12px;
  border-radius: 12px;
  background: color-mix(in oklab, var(--color-primary), transparent 80%);
  color: var(--color-primary);
  font-size: .5em;
  font-weight: 500;
  width: fit-content;
  white-space: nowrap;
}

.badge--outline {
  background: transparent;
  border: 1px solid var(--ui-primary);
  color: var(--ui-primary);
}

.text {
  white-space: pre-line;
  margin: 0;
  font-size: .5em;
}

.label {
  font-weight: 600;
  font-size: .7em;
}

.qr-section {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  justify-content: right;
  margin-right: 15px;
}

.qr-code {
  width: calc(var(--card-width) * 0.4);
  height: calc(var(--card-width) * 0.4);
  border-radius: 4px;
}

.archetypes :first-child {
  margin-right: 3px;
}

.core-cards {
  display: flex;
  flex-direction: column;
  gap: calc(var(--gap)/2);
}

.core-cards-images {
  display: flex;
  gap: 5px;
}

.core-card-image {
  width: calc(var(--card-width) * 0.33);
  border-radius: calc(var(--card-size) / 50);
  object-fit: contain;
}
</style>
