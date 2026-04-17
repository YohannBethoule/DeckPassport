<script setup lang="ts">
const props = withDefaults(defineProps<{
  cardName: string
  size?: 'xs' | 'sm' | 'md'
  showCardName?: boolean
  placement?: string
}>(), {
  size: 'md',
  showCardName: true,
  placement: 'unknown'
})

const { buyUrl, marketplaceName, hasAnyAffiliate } = useAffiliate()
const url = computed(() => buyUrl(props.cardName))
const marketplaceKey = computed(() => marketplaceName.value.toLowerCase())
const label = computed(() =>
  props.showCardName
    ? `Buy ${props.cardName} on ${marketplaceName.value}`
    : `Buy on ${marketplaceName.value}`
)
</script>

<template>
  <UButton
    v-if="hasAnyAffiliate"
    :to="url"
    :size="size"
    target="_blank"
    rel="sponsored nofollow noopener"
    icon="i-lucide-shopping-cart"
    variant="outline"
    color="neutral"
    :label="label"
    :data-umami-event="`buy-card-${marketplaceKey}`"
    :data-umami-event-marketplace="marketplaceKey"
    :data-umami-event-placement="placement"
    :data-umami-event-card="cardName"
  />
</template>
