<script setup lang="ts">
const { placement = 'unknown' } = defineProps<{
  placement?: string
}>()

const { tcgplayerUrl, cardmarketUrl, hasTcgplayer, hasCardmarket, hasAnyAffiliate } = useAffiliate()
</script>

<template>
  <div
    v-if="hasAnyAffiliate"
    class="p-6 bg-elevated rounded-lg w-fit mx-auto"
  >
    <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-muted">
      <span>Looking to buy singles?</span>
      <div class="flex items-center gap-2">
        <UButton
          v-if="hasTcgplayer"
          :to="tcgplayerUrl()"
          target="_blank"
          rel="sponsored nofollow noopener"
          variant="ghost"
          size="md"
          color="neutral"
          icon="i-lucide-shopping-cart"
          label="TCGPlayer"
          data-umami-event="affiliate-banner-tcgplayer"
          :data-umami-event-placement="placement"
          data-umami-event-marketplace="tcgplayer"
        />
        <template v-if="hasCardmarket">
          <span
            v-if="hasTcgplayer"
            class="text-dimmed"
          >|</span>
          <UButton
            :to="cardmarketUrl()"
            target="_blank"
            rel="sponsored nofollow noopener"
            variant="ghost"
            size="xs"
            color="neutral"
            icon="i-lucide-shopping-cart"
            label="CardMarket"
            data-umami-event="affiliate-banner-cardmarket"
            :data-umami-event-placement="placement"
            data-umami-event-marketplace="cardmarket"
          />
        </template>
      </div>
    </div>
    <p class="text-xs text-center text-toned mt-2">
      Affiliate disclosure: purchases made through these links may support DeckPassport.
    </p>
  </div>
</template>
