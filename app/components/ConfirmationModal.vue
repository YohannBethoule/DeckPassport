<script setup lang="ts">
defineProps<{
  description: string
  onConfirm: () => void
}>()
</script>

<template>
  <UModal
    title="Confirm"
    :description="description"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
  >
    <slot name="button" />

    <template #body>
      <UButton
        label="Confirm"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>

<style scoped>

</style>
