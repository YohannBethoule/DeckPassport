<script setup lang="ts">
defineProps<{
  partnerMode: PartnerMode
}>()

const emit = defineEmits<{
  toggle: [mode: typeof PARTNER | typeof BACKGROUND]
}>()
</script>

<template>
  <div class="flex gap-2">
    <UButton
      :label="partnerMode === PARTNER ? 'Remove Partner' : 'Add Partner'"
      :icon="partnerMode === PARTNER ? 'i-lucide-user-minus' : 'i-lucide-user-plus'"
      :variant="partnerMode === PARTNER ? 'soft' : 'outline'"
      size="sm"
      :disabled="partnerMode === BACKGROUND"
      @click="emit('toggle', PARTNER)"
    />
    <UButton
      :label="partnerMode === BACKGROUND ? 'Remove Background' : 'Add Background'"
      :icon="partnerMode === BACKGROUND ? 'i-lucide-image-minus' : 'i-lucide-image-plus'"
      :variant="partnerMode === BACKGROUND ? 'soft' : 'outline'"
      size="sm"
      :disabled="partnerMode === PARTNER"
      @click="emit('toggle', BACKGROUND)"
    />
  </div>
</template>
