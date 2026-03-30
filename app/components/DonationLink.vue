<script setup lang="ts">
const { compact = false } = defineProps<{ compact?: boolean }>()
</script>

<template>
  <UButton
    to="https://www.buymeacoffee.com/yohannbethoule"
    target="_blank"
    icon="i-simple-icons-buymeacoffee"
    color="neutral"
    variant="ghost"
    data-umami-event="donation-link"
  >
    <template v-if="compact">
      <span class="hidden sm:inline">Support the project by buying me a coffee</span>
      <span class="sm:hidden">Support me</span>
    </template>
    <span v-else>Support the project by buying me a coffee</span>
  </UButton>
</template>

<style scoped>

</style>
