<script setup lang="ts">
const { description, onConfirm } = defineProps<{
  description: string
  onConfirm: () => void
}>()

const open = ref(false)

function confirm() {
  onConfirm()
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
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
        @click="confirm"
      />
    </template>
  </UModal>
</template>
